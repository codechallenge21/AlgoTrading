<?php
    include_once './common/utils.php';

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
        

    $imgString_64 = '';
    $output = '';
    $outputWithErrors = '';
    $return_flag = 0;
    
    $imageFileCreated = false;
    $data = json_decode(file_get_contents("php://input"));

    if($data->file == '') {
        return;
    }

    if ($data->type == 'start_test') {
        // $command = escapeshellcmd('python3 /home/ubuntu/trading/backtest.py '.$data->file.' backtest ./images/result.png 2>&1');
        $command = escapeshellcmd('python3 /home/ubuntu/trading/backtest.py "'.$data->user_id.'.'.$data->file.'" backtest ./images/result.png 2>&1');
        
        // $output = shell_exec("cd /home/ubuntu/trading && ".$command." cd -");
        $command1 = "cd /home/ubuntu/trading && ".$command." cd - 2>&1";
        exec($command1, $output1, $return_flag);
        
        for ($i = 0; $i < count($output1); $i++) {
            $outputWithErrors .= $output1[$i]."\n";
        }

        if (file_exists('/home/ubuntu/trading/images/result.png')) {
            $imageFileCreated = true;
            $img = file_get_contents('/home/ubuntu/trading/images/result.png');
            $imgString_64 = base64_encode($img);
        }

        $result = array(
            'command'           => "cd /home/ubuntu/trading && ".$command." cd -",
            'command1'          => "cd /home/ubuntu/trading && ".$command." cd - 2>&1",
            'output'            => $output,
            'output1'           => $output1,
            'outputWithErrors'  => $outputWithErrors,
            'imgdata'           => $imgString_64,
            'is_chart'          => $imageFileCreated,
            'success'           => $return_flag
        );

        if ($imageFileCreated) {
            unlink('/home/ubuntu/trading/images/result.png');
        }
       
        http_response_code(200);
        echo json_encode($result);
    }

?>