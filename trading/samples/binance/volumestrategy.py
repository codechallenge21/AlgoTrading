from ccxtbt import CCXTStore
import backtrader as bt
from datetime import datetime, timedelta
import json

class VolumeTrader(bt.Strategy):
    params = dict(
        vperiod = 20,
        minPrice = 1,
        maxPrice = 10,
        btc_sup = 1,
        btc_res=10
    )
    def __init__(self):

        self.livecount = 0
        self.smavolume = bt.ind.SMA(self.data.volume,period=self.p.vperiod, plot=False)
        self.signalLong = bt.ind.CrossOver(self.data.volume,self.smavolume)

    def next(self):

        if(self.live_data):
            cash, value = self.broker.get_wallet_balance('USDT')
            print('{} - {} | Cash:{} Volume:{} SMAVolume:{} Close4H: {} VolumeBtc: {}'.format(data.datetime.datetime(),data._name,
                cash,data.volume[0], self.smavolume[0], self.data2.close[0], self.data1.volume[0]))
            if self.data2.close[0]>self.p.minPrice and self.data2.close[0]<self.p.maxPrice and \
                self.data1.volume[0]>self.p.btc_sup and self.data1.volume[0]<self.p.btc_res and \
                self.signalLong[0]==1 :
                self.order = self.buy(size=0.01)  # enter long

    def notify_data(self, data, status, *args, **kwargs):
        dn = data._name
        dt = datetime.now()
        msg= 'Data Status: {}'.format(data._getstatusname(status))
        print(dt,dn,msg)
        if data._getstatusname(status) == 'LIVE':
            self.livecount=self.livecount+1
            if(self.livecount==3):
                print("System is ready for live")
                self.live_data = True
        else:
            self.live_data = False

cerebro = bt.Cerebro(quicknotify=True)
cerebro.addstrategy(VolumeTrader)

with open('./config.json', 'r') as f:
    params = json.load(f)
# Create our store
config = {'apiKey': params["apiKey"],
          'secret': params["secret"],
          'enableRateLimit': True,
          }

# Create our store
# config = {'apiKey': "iALoKUiAKslA8at6xlKkYTfHLrFGsB2TupQVPd1Rzn9HFdcfPOps0yM5iJurhl77",
#           'secret': "nIrwG5etQTlz2RgRhreXXl7oU7PlKT6yi3q0nrxaCst2gheidjPAcWibc5UkISMF",
#           'enableRateLimit': True,
#           }

currency = "SOL"

# IMPORTANT NOTE - Kraken (and some other exchanges) will not return any values
# for get cash or value if You have never held any BNB coins in your account.
# So switch BNB to a coin you have funded previously if you get errors
store = CCXTStore(exchange='binance', currency=currency, config=config, retries=5, debug=False)


# Get the broker and pass any kwargs if needed.
# ----------------------------------------------
# Broker mappings have been added since some exchanges expect different values
# to the defaults. Case in point, Kraken vs Bitmex. NOTE: Broker mappings are not
# required if the broker uses the same values as the defaults in CCXTBroker.
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

# Get our data
# Drop newest will prevent us from loading partial data from incomplete candles
hist_start_date = datetime.utcnow() - timedelta(minutes=50)
data = store.getdata(dataname=currency+'/USDT', name=currency+"USDT_1min",
                     timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                     compression=1, ohlcv_limit=50, drop_newest=True)
cerebro.adddata(data)

hist_start_date = datetime.utcnow() - timedelta(minutes=50)
databtc = store.getdata(dataname='BTC/USDT', name=currency+"USDT_1min",
                     timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                     compression=1, ohlcv_limit=50, drop_newest=True)
cerebro.adddata(databtc)

hist_start_date = datetime.utcnow() - timedelta(hours=200)
data4h = store.getdata(dataname=currency+'/USDT', name=currency+"USDT_4h",
                      timeframe=bt.TimeFrame.Minutes, fromdate=hist_start_date,
                      compression=240, ohlcv_limit=50, drop_newest=True)
cerebro.adddata(data4h)

cerebro.run()