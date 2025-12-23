<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// CONFIG
$host = "localhost";
$user = "root";
$pass = "";
$db   = "lumpia_db";

// Koneksi
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Ambil Query dari Request
$input = json_decode(file_get_contents('php://input'), true);
$sql = $input['sql'] ?? '';
$params = $input['params'] ?? [];

if (empty($sql)) {
    echo json_encode(["status" => "error", "message" => "No SQL provided"]);
    exit;
}

// SECURITY: Basic SQL Injection prevention?
// NO, karena ini adalah 'bridge' untuk client-side DB.table().
// User framework bertanggung jawab atas query-nya via binding params.
// TAPI INI SANGAT BERBAHAYA JIKA DIEKPOS KE PUBLIK TANPA AUTH.
// Untuk 'Have Fun' framework, kita biarkan dulu, tapi kasih warning.

try {
    $stmt = $conn->prepare($sql);
    if($params) {
        $types = str_repeat("s", count($params)); // Asumsikan string semua biar aman
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    if($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    } else {
        // Non-select query
        $data = ["affected_rows" => $stmt->affected_rows];
    }
    
    echo json_encode(["status" => "success", "data" => $data]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
