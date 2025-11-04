<?php
require_once '../config/db.php';

// Fetch parties with new fields and remove banner
// We select candidate_name and candidate_image, and party_banner is removed.
$sql = "SELECT id, party_name, party_logo, total_votes, display_order, candidate_name, candidate_image 
        FROM parties 
        ORDER BY display_order ASC, created_at DESC";

$result = $conn->query($sql);

$parties = [];

// --- FIX: Check if the query was successful before trying to access its properties ---
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $parties[] = $row;
    }
} elseif (!$result) {
    // If the query failed, log the error and return a specific error message.
    http_response_code(500); // Internal Server Error
    // This will help you debug by showing the exact SQL error in the browser console.
    echo json_encode(["error" => "Database query failed.", "details" => $conn->error]);
    $conn->close();
    exit(); // Stop the script from running further
}

// If the query was successful but returned no rows, it will correctly send an empty array.
http_response_code(200);
echo json_encode($parties);

$conn->close();
?>