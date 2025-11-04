<?php
require_once '../config/db.php';

$sql = "SELECT slogan, banner1, banner2, banner3 FROM settings ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $settings = $result->fetch_assoc();
    http_response_code(200);
    echo json_encode($settings);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Settings not found."]);
}

$conn->close();
?>