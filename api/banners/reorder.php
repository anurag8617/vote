<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

authenticate(); // Protect this endpoint

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['bannerIds']) && is_array($data['bannerIds'])) {
    $bannerIds = $data['bannerIds'];
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE banners SET display_order = :order WHERE id = :id");
        foreach ($bannerIds as $index => $id) {
            $stmt->execute(['order' => $index + 1, 'id' => $id]);
        }
        $pdo->commit();
        echo json_encode(['message' => 'Banner order updated successfully.']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['message' => 'Failed to reorder banners.', 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid data provided.']);
}
?>