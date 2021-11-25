<?php
    include_once './common/database.php';
    include_once './common/utils.php';

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    
    http_response_code(200);

    $data = json_decode(file_get_contents("php://input"));
    $user_id = $data->user_id;
    $file_id = $data->file_id;
    $file_name = $data->file_name;

    if ($user_id == '' || $file_id == '') {
        echo json_encode(array('success'=>0, 'content'=>'', 'message'=>'Unable to load the script'));
        exit();
    }

    $db_row = getScriptByIdFromDB('strategies', $file_id);

    if (count($db_row) == 0) {
        $result = array(
            'success'=>0, 
            'content'=>'', 
            'message'=>'Uable to find file_name on DB Table.'
        );

        echo json_encode( $result );
    } else {
        $filepath = '/home/ubuntu/trading/strategies/'.$user_id.'/'.$file_name.'.py';
        if (!file_exists($filepath)) {
            $result = array(
                'success'=>0, 
                'content'=>'', 
                'message'=>'Uable to find file'
            );
    
            $scripts = [$defaultScript];
            echo json_encode( $result );
        } else {
            $fileContent = file_get_contents($filepath);
            $result = array(
                'success'=>1, 
                'content'=>$fileContent, 
                'message'=>'Loaded your script successfully'
            );
            echo json_encode($result);
        }
    }

?>