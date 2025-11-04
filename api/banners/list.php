<?php
require_once '../config/db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM banners ORDER BY display_order ASC");
    $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($banners);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>