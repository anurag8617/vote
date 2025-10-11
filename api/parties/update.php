<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

// --- Helper Functions to Generate Fake Data ---

/**
 * Generates a random, plausible IPv4 address.
 * @return string A fake IP address.
 */
function generate_fake_ip() {
    // Generates a random IP address in the format X.X.X.X
    return rand(1, 255) . "." . rand(0, 255) . "." . rand(0, 255) . "." . rand(1, 254);
}

/**
 * Returns a random, common user agent string from a predefined list.
 * @return string A fake user agent string.
 */
function get_fake_user_agent() {
    $user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 10; SM-G996U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    ];
    // Return a random element from the array
    return $user_agents[array_rand($user_agents)];
}


// --- Main Logic ---

$id = $_POST['id'];
$party_name = $_POST['party_name'];
$new_total_votes = (int)$_POST['total_votes'];

// Get the current vote count
$sql_get_party = "SELECT total_votes, party_logo, party_banner FROM parties WHERE id = ?";
$stmt_get_party = $conn->prepare($sql_get_party);
$stmt_get_party->bind_param("i", $id);
$stmt_get_party->execute();
$result = $stmt_get_party->get_result();
$party = $result->fetch_assoc();
$current_total_votes = (int)$party['total_votes'];
$stmt_get_party->close();

$vote_difference = $new_total_votes - $current_total_votes;

$conn->begin_transaction();

try {
    if ($vote_difference > 0) {
        // Votes were ADDED, so insert fake voter records
        $sql_add_voters = "INSERT INTO voters (party_id, ip_address, user_agent) VALUES (?, ?, ?)";
        $stmt_add_voters = $conn->prepare($sql_add_voters);
        
        for ($i = 0; $i < $vote_difference; $i++) {
            // Generate unique, realistic fake data for each new voter
            $fake_ip = generate_fake_ip();
            $fake_user_agent = get_fake_user_agent();
            
            $stmt_add_voters->bind_param("iss", $id, $fake_ip, $fake_user_agent);
            $stmt_add_voters->execute();
        }
        $stmt_add_voters->close();

    } elseif ($vote_difference < 0) {
        // Votes were REMOVED, so delete voter records
        $votes_to_remove = abs($vote_difference);
        $sql_delete_votes = "DELETE FROM voters WHERE party_id = ? ORDER BY voted_at DESC LIMIT ?";
        $stmt_delete_votes = $conn->prepare($sql_delete_votes);
        $stmt_delete_votes->bind_param("ii", $id, $votes_to_remove);
        $stmt_delete_votes->execute();
        $stmt_delete_votes->close();
    }

    // Handle file uploads (remains the same)
    $logo_path = $party['party_logo'];
    if (isset($_FILES['party_logo'])) {
        if (file_exists("../" . $logo_path)) unlink("../" . $logo_path);
        $logo_path = save_file('party_logo');
    }
    $banner_path = $party['party_banner'];
    if (isset($_FILES['party_banner'])) {
        if (file_exists("../" . $banner_path)) unlink("../" . $banner_path);
        $banner_path = save_file('party_banner');
    }

    // Update the party table (remains the same)
    $sql_update_party = "UPDATE parties SET party_name = ?, total_votes = ?, party_logo = ?, party_banner = ? WHERE id = ?";
    $stmt_update_party = $conn->prepare($sql_update_party);
    $stmt_update_party->bind_param("sisss", $party_name, $new_total_votes, $logo_path, $banner_path, $id);

    if ($stmt_update_party->execute()) {
        $conn->commit();
        http_response_code(200);
        echo json_encode(["message" => "Party updated successfully!"]);
    } else {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["message" => "Failed to update party."]);
    }
    $stmt_update_party->close();

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "An error occurred: " . $e->getMessage()]);
}

$conn->close();

function save_file($file_key) {
    if (isset($_FILES[$file_key])) {
        $file = $_FILES[$file_key];
        $target_dir = "../uploads/";
        $file_name = "party_" . $file_key . "-" . time() . "." . pathinfo($file["name"], PATHINFO_EXTENSION);
        $target_file = $target_dir . $file_name;
        if (move_uploaded_file($file["tmp_name"], $target_file)) {
            return "uploads/" . $file_name;
        }
    }
    return null;
}
?>