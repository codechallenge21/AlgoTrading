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

    // $firstName = '';
    // $lastName = '';
    // $email = '';
    // $password = '';

    $data = json_decode(file_get_contents("php://input"));

    // var_dump($data->fname);
    // var_dump($data->lname);
    // var_dump($data->email);
    // var_dump($data->password);

    $databaseService = new DatabaseService();
    $conn = $databaseService->getConnection();
    // $conn = $databaseService->createTables();

    $firstName = $data->fname;
    $lastName = $data->lname;
    $email = $data->email;
    $password = $data->password;
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $table_name = 'Users';

    $query = "INSERT INTO " . $table_name . "
                    SET first_name = '".$firstName."',
                        last_name = '".$lastName."',
                        email = '".$email."',
                        password = '".$password_hash."'";

    $stmt = $conn->prepare($query);

    // $stmt->bindParam(':firstname', $firstName);
    // $stmt->bindParam(':lastname', $lastName);
    // $stmt->bindParam(':email', $email);


    // $stmt->bindParam(':password', $password_hash);

    // var_dump($query);
    // var_dump($stmt);

    if($stmt->execute()){
    
        http_response_code(200);
        echo json_encode(array( 
                                "message" => "User was successfully registered.", 
                                "success" => 1, 
                                "type" => "register"
                        )
                );
    }
    else{
        http_response_code(200);
    
        echo json_encode(array("message" => "Unable to register the user.", "success" => 0, "type" => "register"));
    }
?>