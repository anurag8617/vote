<?php
require_once '../config/db.php';

// Get the party ID from the request
$id = $_GET['id'];

// Get voter's device information
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];

// --- Check if the user has already voted from this IP ---
$sql_check = "SELECT id FROM voters WHERE ip_address = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("s", $ip_address);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    // If a record with this IP exists, send an error
    http_response_code(403); // 403 Forbidden
    echo json_encode(["message" => "You have already voted from this device."]);
    $stmt_check->close();
    $conn->close();
    exit(); // Stop execution
}
$stmt_check->close();

// --- If the user has not voted, proceed ---
$conn->begin_transaction();

try {
    // 1. Update the total_votes in the parties table
    $sql_vote = "UPDATE parties SET total_votes = total_votes + 1 WHERE id = ?";
    $stmt_vote = $conn->prepare($sql_vote);
    $stmt_vote->bind_param("i", $id);
    $stmt_vote->execute();
    $stmt_vote->close();

    // 2. Insert the new voter's details into the voters table
    $sql_voter = "INSERT INTO voters (party_id, ip_address, user_agent) VALUES (?, ?, ?)";
    $stmt_voter = $conn->prepare($sql_voter);
    $stmt_voter->bind_param("iss", $id, $ip_address, $user_agent);
    $stmt_voter->execute();
    $stmt_voter->close();

    // If both queries succeed, commit the changes
    $conn->commit();

    http_response_code(200);
    echo json_encode(["message" => "Vote counted successfully!"]);

} catch (mysqli_sql_exception $exception) {
    // If any query fails, roll back the transaction
    $conn->rollback();

    http_response_code(500);
    echo json_encode(["message" => "Error processing your vote."]);
    error_log($exception->getMessage()); // Log the actual error
}

$conn->close();
?>