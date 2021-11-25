import logging
logging.disable(logging.DEBUG)

import datetime  
import  backtrader as bt
from angelbt import ANGELStore
from datetime import datetime, timedelta
from angelbt import ZerodhaFeed

#from strategies.mystrategy import Strategy
import importlib
import sys
backtest = True
filename = 'savefig.png'
strategyname = ''
strategy = None

if(len(sys.argv)>2):
    strategyname = sys.argv[1]
    if (sys.argv[2]=="live"):
        backtest = False
    filename =sys.argv[3]
StrategyStore = importlib.import_module("strategies."+strategyname,package='None')

tradingsymbol = StrategyStore.tradingsymbol
timeframe = StrategyStore.timeframe
timeframeCompression  = StrategyStore.timeframeCompression
fromdate = StrategyStore.fromdate
todate = StrategyStore.todate

cerebro = bt.Cerebro(quicknotify=True) 

if backtest == False:
    cerebro.addstrategy(StrategyStore.Strategy,backtest = backtest)  # Add the trading strategy
    config = {'api_key':"pCNKyY2s",
        'client_id':"P193991",
        'client_pw':"mapatel123"
        }
    store = ANGELStore(config=config,retries=5,backtest=backtest)
    broker = store.getbroker()
    cerebro.setbroker(broker)
    hist_start_date = datetime.utcnow() - timedelta(minutes=60*24*3)
    data = store.getdata(dataname=tradingsymbol, name=tradingsymbol,
                        timeframe=timeframe, fromdate=hist_start_date,
                        compression=timeframeCompression)
    cerebro.adddata(data)

if backtest :
    cerebro.addstrategy(StrategyStore.Strategy,backtest = backtest)  # Add the trading strategy
    cerebro.broker.setcash(100000.0)
    cerebro.adddata(ZerodhaFeed(
                                dataname=tradingsymbol, name=tradingsymbol,
                                timeframe=timeframe,compression=timeframeCompression,
                                fromdate=fromdate,
                                todate=todate,
                                config=None))
cerebro.run()  # run it all
if backtest :
    cerebro.plot(path = filename,width=16, height=9,dpi=100) #cerebro.plot()  # and plot it with a single command

