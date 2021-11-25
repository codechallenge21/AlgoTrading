from ccxtbt import CCXTStore
from ccxtbt import CCXTFeed
import backtrader as bt
from datetime import datetime, timedelta
import json
import importlib
import sys

strategyname = "strategies.volume.strategy"
configjson = "strategies/volume/config.json"
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

StrategyStore = importlib.import_module(strategyname,package='None')

with open('./'+configjson, 'r') as f:
    params = json.load(f)
# Create our store
config = {'apiKey': params["apiKey"],
        'secret': params["secret"],
        'enableRateLimit': True,
        }
marketplace = params["marketplace"]
currency = params["tokenlist"][coinindex]["token"]
minPrice =  params["tokenlist"][coinindex]["min"]
maxPrice =  params["tokenlist"][coinindex]["max"]
btc_sup =   params["btc_sup"]
btc_res =   params["btc_res"]

jsonparam = {
    'minPrice':minPrice,
    'maxPrice':maxPrice,
    'btc_sup':btc_sup,
    'btc_res':btc_res
}

cerebro = bt.Cerebro(quicknotify=True)
cerebro.addstrategy(StrategyStore.Strategy,jsonparam = jsonparam,backtest = backtest )

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

    hist_start_date = datetime.utcnow() - timedelta(minutes=50)
    data = store.getdata(dataname=currency+'/'+marketplace, name=currency+"_1min",
                        timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                        compression=1, ohlcv_limit=50, drop_newest=True)
    cerebro.adddata(data)

    databtc = store.getdata(dataname='BTC/'+marketplace, name="BTC_1min",
                        timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                        compression=1, ohlcv_limit=50, drop_newest=True)
    cerebro.adddata(databtc)

    hist_start_date = datetime.utcnow() - timedelta(hours=200)
    data4h = store.getdata(dataname=currency+'/'+marketplace, name=currency+"_4h",
                        timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                        compression=240, ohlcv_limit=50, drop_newest=True)
    cerebro.adddata(data4h)

    cerebro.run()

if backtest :
    fromdate = datetime(2021, 11,3, 0, 0)
    todate = datetime(2021, 11, 3, 8, 0)    
    cerebro.broker.setcash(10000.0)

    cerebro.adddata(CCXTFeed(dataname=currency+'/USDT', name=currency+"USDT_1min",
                        timeframe=bt.TimeFrame.Minutes, fromdate=fromdate,todate=todate,
                        compression=1,exchange='binance', ohlcv_limit=1440, currency=currency, config=config, retries=5 ))
    cerebro.adddata(CCXTFeed(dataname='BTC/USDT', name="BTCUSDT_1min",
                        timeframe=bt.TimeFrame.Minutes, fromdate=fromdate,todate=todate,
                        compression=1,exchange='binance', ohlcv_limit=1440,currency=currency, config=config, retries=5 ))
    cerebro.adddata(CCXTFeed(dataname=currency+'/USDT', name=currency+"USDT_4h",
                        timeframe=bt.TimeFrame.Minutes, fromdate=fromdate,todate=todate,
                        compression=240,exchange='binance', ohlcv_limit=500,currency=currency, config=config, retries=5 ))
    
cerebro.run()  # run it all
if backtest :
    cerebro.plot(path = filename,width=16, height=9,dpi=100) #cerebro.plot()  # and plot it with a single command

