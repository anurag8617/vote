<?php
require_once '../config/db.php';

$id = $_GET['id'];

$sql = "UPDATE parties SET total_votes = total_votes + 1 WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "Vote counted successfully!"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error processing your vote."]);
}

$stmt->close();
$conn->close();
?>