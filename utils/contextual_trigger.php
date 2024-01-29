<?php

$mysqli = new mysqli(
    getenv("DB_HOST"),
    getenv("DB_USER"),
    getenv("DB_PASS"),
    getenv("DB_NAME"),
    getenv("DB_PORT")
);

// Create a new mysqli instance
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check the connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Query to fetch contextual triggers
$query = "SELECT trigger_name FROM contextual_trigger";
$results = $mysqli->query($query);

// Check for errors in the query execution
if (!$results) {
    echo "Query failed: " . $mysqli->error;
    // die("Query failed: " . $mysqli->error);
}
?>
