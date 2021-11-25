from ccxtbt import CCXTStore
from ccxtbt import CCXTFeed
import backtrader as bt
from datetime import datetime, timedelta
import json
import importlib
import sys

strategyname = "dca"
configjson = "config.json"
backtest = False
filename = 'backtest.png'
coinindex = 0
if(len(sys.argv)>1):
    strategyname = sys.argv[1]
    coinindex = int(sys.argv[2])
    if (len(sys.argv)>3):
        configjson =sys.argv[3]
    if (len(sys.argv)>4 and sys.argv[4]=="backtest"):
        backtest = True

StrategyStore = importlib.import_module("strategies.{}.strategy".format(strategyname),package='None')

with open('./strategies/{}/{}'.format(strategyname,configjson), 'r') as f:
    params = json.load(f)
# Create our store
config = {'apiKey': params["apiKey"],
        'secret': params["secret"],
        'enableRateLimit': True,
        }
marketplace = params["marketplace"]
tokeninfo =params["tokenlist"][coinindex] 
currency = tokeninfo["token"]
compression = params["compression"]
jsonparam = {
    'token':tokeninfo,
    'params':params
}

cerebro = bt.Cerebro(quicknotify=True)
cerebro.addstrategy(StrategyStore.Strategy,jsonparam = params,backtest = backtest )

if backtest == False:

    store = CCXTStore(exchange='binance', currency=currency, config=config, retries=5, debug=False)
    broker_mapping = {
        'order_types': {
            bt.Order.Market: 'market',
            bt.Order.Limit: 'limit',
            bt.Order.Stop: 'stop-loss', #stop-loss for kraken, stop for bitmex
            bt.Order.StopLimit: 'stop limit'
        },
        'mappings':{
            'closed_order':{
                'key': 'status',
                'value':'closed'
            },
            'canceled_order':{
                'key': 'result',
                'value':1}
        }
    }

    broker = store.getbroker(broker_mapping=broker_mapping)
    cerebro.setbroker(broker)

    hist_start_date = datetime.utcnow() - timedelta(minutes=50*compression)
    data = store.getdata(dataname=currency+'/'+marketplace, name=currency,
                        timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                        compression=compression, ohlcv_limit=50, drop_newest=True)
    cerebro.adddata(data)

if backtest :
    fromdate = datetime(2021, 11,3, 0, 0)
    todate = datetime(2021, 11, 3, 8, 0)    
    cerebro.broker.setcash(10000.0)

    cerebro.adddata(CCXTFeed(dataname=currency+'/'+marketplace, name=currency,
                        timeframe=bt.TimeFrame.Minutes, fromdate=fromdate,todate=todate,
                        compression=compression,exchange='binance', ohlcv_limit=1440, currency=currency, config=config, retries=5 ))
    
cerebro.run()  # run it all
if backtest :
    cerebro.plot(path = filename,width=16, height=9,dpi=100) #cerebro.plot()  # and plot it with a single command

