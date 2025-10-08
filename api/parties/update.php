<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

$id = $_POST['id'];
$party_name = $_POST['party_name'];
$total_votes = $_POST['total_votes'];

// Get existing party data
$sql = "SELECT party_logo, party_banner FROM parties WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$party = $result->fetch_assoc();

// Handle file uploads
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

$sql = "UPDATE parties SET party_name = ?, total_votes = ?, party_logo = ?, party_banner = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sisss", $party_name, $total_votes, $logo_path, $banner_path, $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "Party updated successfully!"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update party."]);
}

$stmt->close();
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