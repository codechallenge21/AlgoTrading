<?php
    include_once './common/database.php';
    include_once './common/utils.php';
    

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    $data = json_decode(file_get_contents("php://input"));
    $user_id = $data->userID;
    $path = '/home/ubuntu/trading/strategies/';
    
    if ($user_id == 0) {
        $defaultFileContent = file_get_contents($path.'mystrategy.py');
        $defaultScript = array(
            'id'            => 0, 
            'script_name'   => 'Default' , 
            'content'       => $defaultFileContent,
            'last_time'     => date('Y-m-d H:i:s')
        );
        $scripts = [$defaultScript];
        echo json_encode( $scripts );
        exit();
    }

    $scriptNames = getScriptNamesFromDB($user_id);
    if (count($scriptNames) == 0) {
        $defaultFileContent = file_get_contents($path.'mystrategy.py');
        $defaultScript = array(
            'id'            => 0, 
            'script_name'   => 'Default' , 
            'content'       => $defaultFileContent,
            'last_time'     => date('Y-m-d H:i:s')
        );

        $scripts = [$defaultScript];
        echo json_encode( $scripts );
    } else {
        $path = '/home/ubuntu/trading/strategies/'.$user_id;
        $scriptData = addScriptContentToTableData($scriptNames, $path);
        echo json_encode($scriptData);
    }

    
?>