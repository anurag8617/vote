<?php
require_once '../config/db.php';
require_once '../middleware/auth.php'; // For JWT functions

// Decode the incoming JSON data
$data = json_decode(file_get_contents("php://input"));

$username = $data->username;
$password = $data->password;

// Find the admin by username
$sql = "SELECT * FROM admins WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();

// Verify the admin and password
if ($admin && password_verify($password, $admin['password'])) {
    // Generate a JWT token
    $token = generate_jwt(['id' => $admin['id'], 'username' => $admin['username']]);
    
    http_response_code(200);
    echo json_encode(["message" => "Login successful!", "token" => $token]);
} else {
    http_response_code(401);
    echo json_encode(["message" => "Invalid username or password."]);
}

$stmt->close();
$conn->close();
?>