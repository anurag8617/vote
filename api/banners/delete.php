<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';


authenticate(); // Protect this endpoint

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = basename($_SERVER['REQUEST_URI']);

    if (empty($id) || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid banner ID provided.']);
        exit;
    }

    // First, get the image path to delete the file
    $stmt = $pdo->prepare("SELECT image_path FROM banners WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $banner = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($banner) {
        $filePath = '../' . $banner['image_path'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Then, delete from the database
        $deleteStmt = $pdo->prepare("DELETE FROM banners WHERE id = :id");
        if ($deleteStmt->execute(['id' => $id])) {
            http_response_code(200);
            echo json_encode(['message' => 'Banner deleted successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete banner from database.']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Banner not found.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>