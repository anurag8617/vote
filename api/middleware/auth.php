<?php
// You will need to install a JWT library. `firebase/php-jwt` is a popular choice.
// Run: composer require firebase/php-jwt
require_once __DIR__ . '/../../vendor/autoload.php'; // Adjust path if needed
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

// Function to generate a JWT token
function generate_jwt($payload) {
    global $JWT_SECRET;
    return JWT::encode($payload, $JWT_SECRET, 'HS256');
}

// Function to verify a JWT token
function verify_token() {
    global $JWT_SECRET;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. No token provided."]);
        exit();
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');

    if (!$jwt) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Malformed token."]);
        exit();
    }

    try {
        $decoded = JWT::decode($jwt, new Key($JWT_SECRET, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode(["message" => "Invalid token."]);
        exit();
    }
}
?>