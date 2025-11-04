<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

// Get new fields from the form
$party_name = $_POST['party_name'];
$candidate_name = $_POST['candidate_name']; // New field

// Handle file uploads
$logo_path = save_file('party_logo');
$candidate_image_path = save_file('candidate_image'); // New file

// We removed party_banner and added candidate_name and candidate_image
if ($party_name && $candidate_name && $logo_path && $candidate_image_path) {
    
    // Updated SQL query
    $sql = "INSERT INTO parties (party_name, party_logo, candidate_name, candidate_image) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    // Updated bind_param (changed "sss" to "ssss")
    $stmt->bind_param("ssss", $party_name, $logo_path, $candidate_name, $candidate_image_path);

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

// I made a small improvement to this function
function save_file($file_key) {
    if (isset($_FILES[$file_key])) {
        $file = $_FILES[$file_key];
        $target_dir = "../uploads/";
        
        // Better file name: uses the key (e.g., "candidate_image") instead of "party_"
        $file_name = $file_key . "-" . time() . "." . pathinfo($file["name"], PATHINFO_EXTENSION);
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($file["tmp_name"], $target_file)) {
            return "uploads/" . $file_name;
        }
    }
    return null;
}
?>