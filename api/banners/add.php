<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

authenticate(); // Protect this endpoint

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['banner'])) {
        $uploadDir = '../uploads/banners/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = 'banner_' . time() . '_' . basename($_FILES['banner']['name']);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['banner']['tmp_name'], $targetFile)) {
            $imagePath = 'uploads/banners/' . $fileName;

            // Get the highest display order and add 1
            $stmt = $pdo->query("SELECT MAX(display_order) as max_order FROM banners");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $newOrder = ($result['max_order'] !== null) ? $result['max_order'] + 1 : 1;

            $sql = "INSERT INTO banners (image_path, display_order) VALUES (:image_path, :display_order)";
            $stmt = $pdo->prepare($sql);
            
            try {
                $stmt->execute(['image_path' => $imagePath, 'display_order' => $newOrder]);
                http_response_code(201);
                echo json_encode(['message' => 'Banner added successfully', 'path' => $imagePath]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload banner.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'No banner file provided.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>