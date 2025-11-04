<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

authenticate();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $slogan = isset($_POST['slogan']) ? trim($_POST['slogan']) : '';

    try {
        // We only update the slogan now.
        $stmt = $pdo->prepare("UPDATE settings SET slogan = :slogan WHERE id = 1");
        $stmt->execute(['slogan' => $slogan]);
        
        echo json_encode(['message' => 'Settings updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>