<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
verify_token();

// Get the JSON payload sent from the frontend
$data = json_decode(file_get_contents("php://input"));

// The payload should be an array of party IDs in the new desired order
$party_ids_in_order = $data->partyIds;

if (empty($party_ids_in_order) || !is_array($party_ids_in_order)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid data provided."]);
    exit();
}

$conn->begin_transaction();

try {
    // Prepare the update statement
    $sql = "UPDATE parties SET display_order = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);

    // Loop through the array of IDs and update each party's display_order
    foreach ($party_ids_in_order as $index => $party_id) {
        $order = $index + 1; // The order is the array index + 1
        $stmt->bind_param("ii", $order, $party_id);
        $stmt->execute();
    }
    
    $stmt->close();
    $conn->commit();

    http_response_code(200);
    echo json_encode(["message" => "Party order updated successfully!"]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "Failed to update party order."]);
}

$conn->close();
?>