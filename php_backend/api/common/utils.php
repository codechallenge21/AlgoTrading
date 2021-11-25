<?php
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