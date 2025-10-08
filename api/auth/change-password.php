<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

// Verify the token
$decoded = verify_token();
$admin_id = $decoded->id;

// Decode the incoming JSON data
$data = json_decode(file_get_contents("php://input"));

$currentPassword = $data->currentPassword;
$newPassword = $data->newPassword;

// Get the admin's current password from the database
$sql = "SELECT password FROM admins WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $admin_id);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();

// Check if the current password is correct
if ($admin && password_verify($currentPassword, $admin['password'])) {
    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update the password in the database
    $update_sql = "UPDATE admins SET password = ? WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("si", $hashedPassword, $admin_id);

    if ($update_stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Password updated successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to update password."]);
    }
    $update_stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid current password."]);
}

$stmt->close();
$conn->close();
?>