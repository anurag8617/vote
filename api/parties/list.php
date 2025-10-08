<?php
require_once '../config/db.php';

$sql = "SELECT id, party_name, party_logo, party_banner, total_votes FROM parties ORDER BY created_at DESC";
$result = $conn->query($sql);

$parties = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $parties[] = $row;
    }
}

http_response_code(200);
echo json_encode($parties);

$conn->close();
?>