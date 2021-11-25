<?php
    include_once './common/database.php';
    include_once './common/utils.php';

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);

    $data = json_decode(file_get_contents("php://input"));
    $uid = $data->user_id; 
    $type = $data->type; 
    $content = $data->content; 
    $file_id = $data->file_id; 
    $file_name = $data->file_name; 
    $origin_name = $data->origin_name;

    $path = '/home/ubuntu/trading/strategies/'.$uid;
    $dir_result = true;
    if (!file_exists($path)) {
        $dir_result = mkdir($path, 0777, true);
    }

    $file = $path.'/'.$file_name.'.py';
    $origin = $path.'/'.$origin_name.'.py';

    if ($file_name == '' || $uid == '') {
        echo json_encode(array('success'=>0, 'message'=>'Missing params file_name, content or user_id to save script'));
        exit();
    }

    if ($type == 'add') {
        $fs_result = file_put_contents($file, $content);
        $db_result = insertScriptToDB($uid, $path, $file_name);
        
        $db_result['fs_result'] = $fs_result;
        $db_result['dir_result'] = $dir_result;
        
        $updated_table = getScriptNamesFromDB($uid);
        $scriptData = addScriptContentToTableData($updated_table, $path);
        $db_result['scriptsData'] = $scriptData;

        echo json_encode($db_result);

    } else if ($type == 'add_replace') {
        $fs_result = file_put_contents($file, $content);

        $db_delToResult = deleteScriptsByNameFromDB($file_name);
        $db_result = insertScriptToDB($uid, $path, $file_name);

        $db_result['fs_result'] = $fs_result;
        $db_result['db_delToResult'] = $db_delToResult;
        $db_result['dir_result'] = $dir_result;

        $updated_table = getScriptNamesFromDB($uid);
        $scriptData = addScriptContentToTableData($updated_table, $path);
        $db_result['scriptsData'] = $scriptData;
        
        echo json_encode($db_result);

    } else if ($type == 'edit') {
        $fs_result = file_put_contents($file, $content);
        $db_result = updateScriptInDB($file_id, $file_name, date("Y-m-d H:i:s"));
        
        $db_result['fs_result'] = $fs_result;
        $db_result['dir_result'] = $dir_result;
        
        $updated_table = getScriptNamesFromDB($uid);
        $scriptData = addScriptContentToTableData($updated_table, $path);
        $db_result['scriptsData'] = $scriptData;

        echo json_encode($db_result);

    } else if ($type == 'edit_rename') {
        if(file_exists($origin)) {
            $fd_result = unlink($origin);
        }
        $db_result = updateScriptInDB($file_id, $file_name, date("Y-m-d H:i:s"));
        $fs_result = file_put_contents($file, $content);

        $db_result['fs_result'] = $fs_result;
        $db_result['fd_result'] = $fd_result;
        $db_result['dir_result'] = $dir_result;
        
        $updated_table = getScriptNamesFromDB($uid);
        $scriptData = addScriptContentToTableData($updated_table, $path);
        $db_result['scriptsData'] = $scriptData;
        
        echo json_encode($db_result);

    } else if ($type == 'edit_replace') {
        if(file_exists($origin)) {
            $fd_result = unlink($origin);
        }
        $db_delToResult = deleteScriptsByNameFromDB($file_name);
        $db_result = updateScriptInDB($file_id, $file_name, date("Y-m-d H:i:s"));
        $db_delFromResult = deleteScriptsByNameFromDB($origin_name);
        $fs_result = file_put_contents($file, $content);

        $db_result['db_delFromResult'] = $db_delFromResult;
        $db_result['db_delToResult'] = $db_delToResult;
        $db_result['fs_result'] = $fs_result;
        $db_result['dir_result'] = $dir_result;
        
        $updated_table = getScriptNamesFromDB($uid);
        $scriptData = addScriptContentToTableData($updated_table, $path);
        $db_result['scriptsData'] = $scriptData;

        echo json_encode($db_result);
    }

    else {
        echo json_encode(array('message' => "other exceptions"));
    }
    
    // echo json_encode($updated_scriptNames);
    
    // if ($data->file_name == '' || $data->content == '' || $data->user_id == null) {
    //     echo json_encode(array('success'=>0, 'saved_filename'=>$data->file_name, 'message'=>'Missing params file_name, content or user_id to save script'));
    //     exit();
    // }

    // $path = '/home/ubuntu/trading/strategies/'.$data->user_id;
    // if (!file_exists($path)) {
    //     mkdir($path, 0777, true);
    // }

    // $file = $path.'/'.$data->file_name.'.py';

    // if ($data->file_id == 0) {
    //     $fs_result = file_put_contents($file, $data->content);
    //     $db_result = saveToDB($data->file_id, $data->user_id, $path, $data->file_name);
    //     $db_result['fs_result'] = $fs_result;
        
    //     echo json_encode($db_result);
    // } else {
    //     $table_name = 'strategies';
    //     $databaseService = new DatabaseService();
    //     $conn = $databaseService->getConnection();

    //     $query = "SELECT * FROM " . $table_name . " WHERE id = '".$data->file_id."' LIMIT 0,1";
    //     $stmt = $conn->prepare($query);
    //     $stmt->execute();
    //     $num = $stmt->rowCount();
    //     if($num > 0) {
    //         $row = $stmt->fetch(PDO::FETCH_ASSOC);
    //         $prior_name = $row['script_name'];
    //         $prior_path = $row['script_path'];
    //         unlink($prior_path.'/'.$prior_name.'.py');

    //         $fs_result = file_put_contents($file, $data->content);
    //         $db_result = saveToDB($data->file_id, $data->user_id, $path, $data->file_name);
    //         $db_result['fs_result'] = $fs_result;
    //         echo json_encode($db_result);
    //     } else {
    //         $fs_result = file_put_contents($file, $data->content);
    //         $db_result = saveToDB(0, $data->user_id, $path, $data->file_name);
    //         $db_result['fs_result'] = $fs_result;
    //         echo json_encode($db_result);
    //     }

    // }

?>