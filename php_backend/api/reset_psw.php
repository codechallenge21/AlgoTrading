<?php
    include_once './common/database.php';

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    $data = json_decode(file_get_contents("php://input"));

    $databaseService = new DatabaseService();
    $conn = $databaseService->getConnection();

    $email = $data->email;
    $newassword = $data->newpassword;
    $password_hash = password_hash($newassword, PASSWORD_BCRYPT);
    $table_name = 'users';

    if($newassword == '') {
        return;
    }

    $query = "SELECT id, first_name, last_name, password FROM " . $table_name . " WHERE email = '".$email."' LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    if($num > 0){

        $query = "UPDATE " . $table_name . "
                        SET password = '".$password_hash."' where email = '".$email."'";
    
        $stmt = $conn->prepare($query);

        if($stmt->execute()){
    
            http_response_code(200);
            echo json_encode(array( 
                                    "message" => "Reset password successfuly.", 
                                    "success" => 1, 
                                    "type" => "reset"
                            )
                    );
        }

        else{

            http_response_code(200);
            echo json_encode(array("message" => "Unable to reset password", "success" => 0, "type" => "reset"));
        }

    } else {

        http_response_code(200);
        echo json_encode(array("message" => "Unregistered user", "success" => 0, "type" => "reset"));
    }

?>