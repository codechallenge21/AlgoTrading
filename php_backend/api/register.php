<?php
    include_once './common/database.php';

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // // Allow from any origin
    // if (isset($_SERVER['HTTP_ORIGIN'])) {
    //     // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    //     // you want to allow, and if so:
    //     header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    //     header('Access-Control-Allow-Credentials: true');
    //     header('Access-Control-Max-Age: 86400');    // cache for 1 day
    // }

    // // Access-Control headers are received during OPTIONS requests
    // if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    //     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
    //         // may also be using PUT, PATCH, HEAD etc
    //         header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    //     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
    //         header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    // }

    $data = json_decode(file_get_contents("php://input"));

    $databaseService = new DatabaseService();
    $conn = $databaseService->getConnection();

    $firstName = $data->fname;
    $lastName = $data->lname;
    $email = $data->email;
    $password = $data->password;
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $table_name = 'users';

    if ($firstName == "" || $lastName == "" || $email == "" || $password =="") {
        return;
    }

    //check exsitance
    $query = "SELECT * FROM " . $table_name . " WHERE email = '".$email."' LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    if($num > 0){
        http_response_code(200);
        echo json_encode(array("message" => "This user registered already.", "success" => 0, "type" => "register"));
        exit();
    } else {
        $query = "INSERT INTO ".$table_name." (first_name, last_name, email, password) 
                                VALUES ('".$firstName."', '".$lastName."', '".$email."', '".$password_hash."')"
                                ;
        $stmt = $conn->prepare($query);
    }

    if($stmt->execute()){
    
        http_response_code(200);
        echo json_encode(array( 
                                "message" => "Registered successfully.", 
                                "success" => 1, 
                                "type" => "register"
                        )
                );
    }
    else{
        http_response_code(200);
        echo json_encode(array("message" => "Unable to register", "success" => 0, "type" => "register"));
    }
?>