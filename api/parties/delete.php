<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

$id = $_GET['id'];

// Get file paths to delete them
$sql = "SELECT party_logo, party_banner FROM parties WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$party = $result->fetch_assoc();

if ($party) {
    if (file_exists("../" . $party['party_logo'])) unlink("../" . $party['party_logo']);
    if (file_exists("../" . $party['party_banner'])) unlink("../" . $party['party_banner']);
}

// Delete from the database
$sql = "DELETE FROM parties WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "Party deleted successfully!"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete party."]);
}

$stmt->close();
$conn->close();
?>