<?php

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
    $return_flag = 0;
    
    $imageFileCreated = false;
    $data = json_decode(file_get_contents("php://input"));

    if ($data->type == 'start_test') {
        $command = escapeshellcmd('python3 /home/ubuntu/trading/backtest.py '.$data->file.' backtest ./images/result.png  | cat >/dev/null 2>&1');
        $output = shell_exec("cd /home/ubuntu/trading && ".$command." && cd -");
        // exec($command, $output, $return_flag);
        // if ($return_flag != 0) {
        //     var_dump($output);
        // }

        if (file_exists('/home/ubuntu/trading/images/result.png')) {
            $imageFileCreated = true;
            $img = file_get_contents('/home/ubuntu/trading/images/result.png');
            $imgString_64 = base64_encode($img);
        }

        if (file_exists('./result.png')) {
            $imageFileCreated = true;
            rename('./result.png', '../../trading/images/result.png');
            $img = file_get_contents('../../trading/images/result.png');
            $imgString_64 = base64_encode($img);
        }
    
        $result = array(
            'console_CLI'   => $command,
            'output'        => $output,
            'imgdata'       => $imgString_64,
            'is_chart'      => $imageFileCreated,
            'is_success'    => $return_flag,
        );

        // if (!file_exists('./savefig.png')) {
        //     $result->is_chart = false;
        // } else {
        //     unlink('./savefig.png');
        // }
        http_response_code(200);
        echo json_encode($result);
    
    }

?>