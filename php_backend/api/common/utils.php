<?php
    // include_once './database.php';
    // header("Access-Control-Allow-Origin: *");
    // header("Content-Type: application/json; charset=UTF-8");
    // header("Access-Control-Allow-Methods: POST");
    // header("Access-Control-Max-Age: 3600");
    // header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    
    // ini_set('display_errors', '1');
    // ini_set('display_startup_errors', '1');
    // error_reporting(E_ALL);
        
    // asynchronously getting the output lines from the shell script...

class ExecAsync {

    public function __construct($cmd) {
        $this->cmd = $cmd;
        $this->cacheFile = ".cache-pipe-".uniqid();
        $this->lineNumber = 0;
    }

    public function getLine() {
        $file = new SplFileObject($this->cacheFile);
        $file->seek($this->lineNumber);
        if($file->valid())
        {
            $this->lineNumber++;
            $current = $file->current();
            return $current;
        } else
            return NULL;
    }

    public function hasFinished() {
        if(file_exists(".status-".$this->cacheFile) ||
            (!file_exists(".status-".$this->cacheFile) && !file_exists($this->cacheFile)))
        {
            unlink($this->cacheFile);
            unlink(".status-".$this->cacheFile);
            $this->lineNumber = 0;
            return TRUE;
        } else
            return FALSE;
    }

    public function run() {
        if($this->cmd) {
            $out = exec('{ '.$this->cmd." > ".$this->cacheFile." && echo finished > .status-".$this->cacheFile.";} > /dev/null 2>/dev/null &");
        }
    }
}
?>
<?php
/*  ================================ Usage of above ================================
    $command = new ExecAsync("command to execute");
    //run the command
    $command->run();
    *We want to read from the command output as long as
    *there are still lines left to read
    *and the command hasn't finished yet

    *if getLine returns NULL it means that we have caught up
    *and there are no more lines left to read
    while(($line = $command->getLine()) || !$command->hasFinished())
    {
        if($line !== NULL)
        {
            echo $line."\n";
            flush();
        } else
        {
            usleep(10);
        }
    }
*/
?>





<?php
/* An easy way to keep in track of external processes.
* Ever wanted to execute a process in php, but you still wanted to have somewhat controll of the process ? Well.. This is a way of doing it.
* @compability: Linux only. (Windows does not work).
* @author: Peec
*/
class Process{
    private $pid;
    private $command;

    public function __construct($cl=false){
        if ($cl != false){
            $this->command = $cl;
            $this->runCom();
        }
    }
    private function runCom(){
        $command = 'nohup '.$this->command.' > /dev/null 2>&1 & echo $!';
        exec($command ,$op);
        $this->pid = (int)$op[0];
    }

    public function setPid($pid){
        $this->pid = $pid;
    }

    public function getPid(){
        return $this->pid;
    }

    public function status(){
        $command = 'ps -p '.$this->pid;
        exec($command, $op);
        if (!isset($op[1]))return false;
        else return true;
    }

    public function start(){
        if ($this->command != '')$this->runCom();
        else return true;
    }

    public function stop(){
        $command = 'kill '.$this->pid;
        exec($command);
        if ($this->status() == false)return true;
        else return false;
    }
}
?>

<?php
/*    ================================ Usage of above ================================
    // You may use status(), start(), and stop(). notice that start() method gets called automatically one time.
    $process = new Process('ls -al');

    // or if you got the pid, however here only the status() metod will work.
    $process = new Process();
    $process.setPid(my_pid);
*/
?>

<?php
/*
    // Then you can start/stop/ check status of the job.
    $process.stop();
    $process.start();
    if ($process.status()){
        echo "The process is currently running";
    }else{
        echo "The process is not running.";
    }
*/
?>






<?php
/*
	Method to execute a command in the terminal
	Uses :
	
	1. system
	2. passthru
	3. exec
	4. shell_exec

*/
function terminal($command)
{
	//system
	if(function_exists('system'))
	{
		ob_start();
		system($command , $return_var);
		$output = ob_get_contents();
		ob_end_clean();
	}
	//passthru
	else if(function_exists('passthru'))
	{
		ob_start();
		passthru($command , $return_var);
		$output = ob_get_contents();
		ob_end_clean();
	}
	
	//exec
	else if(function_exists('exec'))
	{
		exec($command , $output , $return_var);
		// $output = implode(&quot;n&quot; , $output);
	}
	
	//shell_exec
	else if(function_exists('shell_exec'))
	{
		$output = shell_exec($command) ;
	}
	
	else
	{
		$output = 'Command execution not possible on this system';
		$return_var = 1;
	}
	
	// return array('output' =&gt; $output , 'status' =&gt; $return_var);
}
?>

<?php
/*  ================================ Usage of above ================================
    $o = terminal('ls');
    if($status == 0)
    {
        echo $o['output'];
    }
    else
    {
        //some problem
    }
*/
?>



<?php //   =========== Utility Functions ============
    function getScriptNamesFromDB($user_id) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "SELECT * FROM " . $table_name . " WHERE user_id = '".$user_id."' order by last_time desc";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $num = $stmt->rowCount();

        $scripts = [];
        if($num > 0){
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($scripts, $row);
            }
        } 
        return $scripts;
    }

    function getScriptByIdFromDB($tbl, $id) {
        $table_name = $tbl;
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "SELECT * FROM " . $table_name . " WHERE id = '".$id."' ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $num = $stmt->rowCount();

        $scripts = [];
        if($num > 0){
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($scripts, $row);
            }
        }
        return $scripts;
    }

    function dbCachedClear($id) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();

        $query = "DELETE FROM " . $table_name . " WHERE id = '".$id."'";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        return;
    }

    function saveToDB($id, $user_id, $path, $name) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();

        if($id == 0){
            $query = "INSERT INTO ".$table_name." (user_id, script_path, script_name) 
                    VALUES ('".$user_id."', '".$path."', '".$name."')";
            $stmt = $conn->prepare($query);

            if($db_status = $stmt->execute()){
                $id = $conn->lastInsertId();
                return (array( 
                    "message"       => "New script added.", 
                    "type"          => "script_save",
                    "db_status"     => $db_status,
                    'db_return'         => $id
                    )
                );
            } else {
                return (array( 
                    "message"       => "New script add failed.", 
                    "type"          => "script_save",
                    "db_status"     => $db_status,
                    "db_return"     => $id
                    )
                );
            }
          
        } else {
            $query = "UPDATE " . $table_name . "
                        SET script_name = '".$name."' WHERE id = '".$id."'";

            $stmt = $conn->prepare($query);

            if($db_status = $stmt->execute()){
                $id = $conn->lastInsertId();
                return (array( 
                    "message"       => "Script Updated.", 
                    "type"          => "script_save",
                    "db_status"     => $db_status,
                    "db_return"     => $id
                    )
                );
            } else {
                return (array( 
                    "message"       => "Script Updated.", 
                    "type"          => "script_save",
                    "db_status"     => $db_status,
                    "db_return"     => $id
                    )
                );
            }
        }

    }
   
    function insertScriptToDB($user_id, $path, $name) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "INSERT INTO ".$table_name." (user_id, script_path, script_name) 
                VALUES ('".$user_id."', '".$path."', '".$name."')";
        $stmt = $conn->prepare($query);

        if($db_status = $stmt->execute()){
            $id = $conn->lastInsertId();
            if ($id != 0) {
                return (array( 
                    "message"       => "New script added.", 
                    "type"          => "script_add",
                    "db_status"     => $db_status,
                    'db_return'     => $id
                    )
                );

            } else {
                return (array( 
                    "message"       => "New script add failed", 
                    "type"          => "script_add",
                    "db_status"     => $db_status,
                    'db_return'     => $id
                    )
                );
            }
        }
    }

    function updateScriptInDB($id, $name, $time) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "UPDATE " . $table_name . "
                        SET script_name = '".$name."', 
                            last_time = '".$time."'
                        WHERE id = '".$id."'";

        $stmt = $conn->prepare($query);

        if($db_status = $stmt->execute()){
            $id = $conn->lastInsertId();
            return (array( 
                "message"       => "Script Updated.", 
                "type"          => "script_edit",
                "db_status"     => $db_status,
                "db_return"     => $id
                )
            );
        } else {
            return (array( 
                "message"       => "Script Update failed", 
                "type"          => "script_edit",
                "db_status"     => $db_status,
                'db_return'     => $id
                )
            );
        }
    }

    function deleteScriptsByNameFromDB($name) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "DELETE FROM " . $table_name . "
                        WHERE script_name = '".$name."'";

        $stmt = $conn->prepare($query);

        if($db_status = $stmt->execute()){
            $cnt = $stmt->rowCount();
            return (array( 
                "message"       => "Script deleted.", 
                "type"          => "script_delete",
                "db_status"     => $db_status,
                "db_return"     => $cnt
                )
            );
        } else {
            return (array( 
                "message"       => "Script delete failed", 
                "type"          => "script_delete",
                "db_status"     => $db_status,
                'db_return'     => $cnt
                )
            );
        }
    }

    function deleteScriptByIdFromDB($id) {
        $table_name = 'strategies';
        $databaseService = new DatabaseService();
        $conn = $databaseService->getConnection();
        
        $query = "DELETE FROM " . $table_name . "
                        WHERE id = '".$id."'";

        $stmt = $conn->prepare($query);

        if($db_status = $stmt->execute()){
            $cnt = $stmt->rowCount();
            return (array( 
                "message"       => "Script deleted.", 
                "type"          => "script_delete",
                "db_status"     => $db_status,
                "db_return"     => $cnt
                )
            );
        } else {
            return (array( 
                "message"       => "Script delete failed", 
                "type"          => "script_delete",
                "db_status"     => $db_status,
                'db_return'     => $cnt
                )
            );
        }
    }

    function addScriptContentToTableData($scriptNames, $path) {
        $scriptData = [];
        for ($i = 0; $i < count($scriptNames); $i ++) {
            if (!file_exists($path.'/'.$scriptNames[$i]['script_name'].'.py')) {
                dbCachedClear($scriptNames[$i]['id']);
                continue;
            }
            $fileContent = '...';
            if ($i == 0) {
                $fileContent = file_get_contents($path.'/'.$scriptNames[$i]['script_name'].'.py');
            }
            $scriptInfo = array(
                'id'            => $scriptNames[$i]['id'], 
                'script_name'   => $scriptNames[$i]['script_name'], 
                'last_time'     => $scriptNames[$i]['last_time'],
                'content'       => $fileContent
            );
            array_push($scriptData, $scriptInfo);
        }
        
        $path = '/home/ubuntu/trading/strategies/';
        $defaultFileContent = file_get_contents($path.'mystrategy.py');
        $defaultScript = array(
            'id'            => 0, 
            'script_name'   => 'Default' , 
            'content'       => $defaultFileContent,
            'last_time'     => date('Y-m-d H:i:s')
        );
        array_push($scriptData, $defaultScript);
        
        return $scriptData;
    }
?>