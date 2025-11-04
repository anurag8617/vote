<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

// --- File saving function ---
function save_file($file_key) {
    if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] == 0) {
        $file = $_FILES[$file_key];
        $target_dir = "../uploads/";
        $file_name = $file_key . "-" . time() . "." . pathinfo($file["name"], PATHINFO_EXTENSION);
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($file["tmp_name"], $target_file)) {
            return "uploads/" . $file_name;
        }
    }
    return null; 
}

// --- Get all data from POST ---
$id = $_POST['id'];
$party_name = $_POST['party_name'];
$candidate_name = $_POST['candidate_name']; 
$new_total_votes = (int)$_POST['total_votes']; // The new vote count from admin

// Basic validation
if (!$id || !$party_name || !$candidate_name || !isset($new_total_votes)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

// --- Start a Transaction ---
$conn->begin_transaction();

try {
    // 1. --- SAFETY CHECK (UPDATED) ---
    // Count how many *REAL* user votes exist (IP does NOT start with 'admin_added_')
    $sql_real_votes = "SELECT COUNT(*) as real_votes FROM voters WHERE party_id = ? AND ip_address NOT LIKE 'admin_added_%'";
    $stmt_real = $conn->prepare($sql_real_votes);
    $stmt_real->bind_param("i", $id);
    $stmt_real->execute();
    $real_votes_count = $stmt_real->get_result()->fetch_assoc()['real_votes'];
    $stmt_real->close();

    // If admin tries to set vote count *lower* than real votes, STOP.
    if ($new_total_votes < $real_votes_count) {
        $conn->rollback(); // Cancel the transaction
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Error: Cannot set total votes ($new_total_votes) lower than the number of real user votes ($real_votes_count)."]);
        exit();
    }

    // 2. --- SYNCHRONIZE VOTERS TABLE ---
    // Get the *current* total votes (real + fake) from the voters table
    $sql_current_votes = "SELECT COUNT(*) as current_total_votes FROM voters WHERE party_id = ?";
    $stmt_current = $conn->prepare($sql_current_votes);
    $stmt_current->bind_param("i", $id);
    $stmt_current->execute();
    $current_total_votes = $stmt_current->get_result()->fetch_assoc()['current_total_votes'];
    $stmt_current->close();

    $difference = $new_total_votes - $current_total_votes;

    if ($difference > 0) {
        // --- ADD FAKE VOTES (UPDATED) ---
        // We will add $difference new rows, each with a unique IP
        $sql_add_vote = "INSERT INTO voters (party_id, ip_address, user_agent) VALUES (?, ?, 'admin_added')";
        $stmt_add = $conn->prepare($sql_add_vote);
        for ($i = 0; $i < $difference; $i++) {
            // Create a unique IP address for this "fake" vote
            $unique_admin_ip = 'admin_added_' . uniqid(); 
            $stmt_add->bind_param("is", $id, $unique_admin_ip);
            $stmt_add->execute();
        }
        $stmt_add->close();

    } elseif ($difference < 0) {
        // --- REMOVE FAKE VOTES (UPDATED) ---
        // We will remove $difference rows, only from the "admin_added" pool
        $votes_to_remove = abs($difference);
        $sql_remove_vote = "DELETE FROM voters WHERE party_id = ? AND ip_address LIKE 'admin_added_%' LIMIT ?";
        $stmt_remove = $conn->prepare($sql_remove_vote);
        $stmt_remove->bind_param("ii", $id, $votes_to_remove);
        $stmt_remove->execute();
        $stmt_remove->close();
    }
    // If $difference == 0, do nothing.

    // 3. --- UPDATE THE PARTIES TABLE ---
    // This query is the same as before
    $sql_update_party = "UPDATE parties SET party_name = ?, candidate_name = ?, total_votes = ?";
    $types = "ssi"; // s = string, i = integer
    $params = [$party_name, $candidate_name, $new_total_votes];

    // Check for new logo
    $logo_path = save_file('party_logo');
    if ($logo_path) {
        $sql_update_party .= ", party_logo = ?";
        $types .= "s";
        $params[] = $logo_path;
    }

    // Check for new candidate image
    $candidate_image_path = save_file('candidate_image');
    if ($candidate_image_path) {
        $sql_update_party .= ", candidate_image = ?";
        $types .= "s";
        $params[] = $candidate_image_path;
    }

    $sql_update_party .= " WHERE id = ?";
    $types .= "i";
    $params[] = $id;

    // Prepare and execute the final update
    $stmt_update = $conn->prepare($sql_update_party);
    $stmt_update->bind_param($types, ...$params);
    $stmt_update->execute();
    $stmt_update->close();

    // If everything worked, commit the changes
    $conn->commit();
    http_response_code(200);
    echo json_encode(["message" => "Party updated and votes synchronized successfully!"]);

} catch (mysqli_sql_exception $exception) {
    // If any step failed, roll back all changes
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "Database error occurred.", "error" => $exception->getMessage()]);
}

$conn->close();
?>