import sys
import json
from subprocess import Popen
import os
import signal

strategyname = "dca"
configjson = "config.json"

if(len(sys.argv)>1):
    strategyname = sys.argv[1]
    configjson = sys.argv[2]

with open('./strategies/{}/{}'.format(strategyname,configjson), 'r') as f:
    params = json.load(f)

coinlength = len(params["tokenlist"])
for coinindex in range(coinlength):
    command = ['python', 'unit_runner_single.py', strategyname,str(coinindex),str(configjson)]
    proc = Popen(command)
    #//to kill child process when parent die
    import os
    import signal
    child_pid = proc.pid
    def kill_child():
        if child_pid is None:
            pass
        else:
            os.kill(child_pid, signal.SIGTERM)

    import atexit
    atexit.register(kill_child)


import time
while True:
  time.sleep(3)
