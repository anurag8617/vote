<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

$party_name = $_POST['party_name'];

// Handle file uploads
$logo_path = save_file('party_logo');
$banner_path = save_file('party_banner');

if ($party_name && $logo_path && $banner_path) {
    $sql = "INSERT INTO parties (party_name, party_logo, party_banner) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $party_name, $logo_path, $banner_path);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Party added successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to add party."]);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing data or files."]);
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