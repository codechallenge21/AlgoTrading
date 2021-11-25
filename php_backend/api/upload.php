<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"));

// var_dump($data->content);

$file = '../../trading/strategies/'.$data->file.'.py';

file_put_contents($file, $data->content);

http_response_code(200);
echo json_encode(array('saved_filename'=>$file));

?>