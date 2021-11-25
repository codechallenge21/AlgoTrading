import logging
logging.disable(logging.DEBUG)

import datetime  
import backtrader as bt
from angelbt import ANGELStore
from datetime import datetime, timedelta
from angelbt import ZerodhaFeed

import sys
backtest = True
filename = 'savefig.png'
strategyname = ''
if(len(sys.argv)>2):
    strategyname = sys.argv[1]
    if (sys.argv[2]=="live"):
        backtest = False
    filename =sys.argv[3]
cerebro = bt.Cerebro(quicknotify=True) 
