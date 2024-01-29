<?php
// Include the database connection file
require_once('utils/db_connection.php');

$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch data from the database
$sql = "SELECT trigger_id, trigger_name FROM contextual_trigger";
$result = $conn->query($sql);

// Prepare data for JSON response
$triggers = [];
while ($row = $result->fetch_assoc()) {
    $triggers[] = $row['trigger_column'];
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($triggers);

// Close the database connection
$conn->close();
?>