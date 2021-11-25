import backtrader as bt
from datetime import datetime
from backtrader import Order
class Strategy(bt.Strategy):
    params = dict(
        vperiod = 20,
        minPrice = 1,
        maxPrice = 10,
        btc_sup = 1,
        btc_res=10,
        marketplace="USDT",
        backtest=False,
        jsonparam={}
    )
    def __init__(self):
        
        self.livecount = 0
        self.p.minPrice = self.p.jsonparam["minPrice"]
        self.p.maxPrice = self.p.jsonparam["maxPrice"]
        self.p.btc_sup = self.p.jsonparam["btc_sup"]
        self.p.btc_res = self.p.jsonparam["btc_res"]

        self.smavolume = bt.ind.SMA(self.data.volume,period=self.p.vperiod, plot=False)
        self.signalLong = bt.ind.CrossOver(self.data.volume,self.smavolume, plot=False)
    def next(self):
        if(self.live_data or self.p.backtest):

            cond1 = self.data2.close[0]>self.p.minPrice and self.data2.close[0]<self.p.maxPrice
            cond2 = self.data1.close[0]>self.p.btc_sup and self.data1.close[0]<self.p.btc_res
            print('{} - {} | Cond:{}-{} Signal:{} Volume:{} SMAVolume:{} Close4H: {} PriceBtc: {}'.format(self.datas[0].datetime.datetime(),self.data._name,
                cond1,cond2,self.signalLong[0],self.data.volume[0], self.smavolume[0], self.data2.close[0], self.data1.close[0]))
            
            if cond1 and cond2 and self.signalLong[0]==1:
                print('****** {} - {} Buy signal'.format(self.datas[0].datetime.datetime(),self.data._name))

                #self.order = self.buy(size=1)  # enter long

    def notify_data(self, data, status, *args, **kwargs):
        dn = data._name
        dt = datetime.now()
        msg= 'Data Status: {}'.format(data._getstatusname(status))
        #print(dt,dn,msg)
        if data._getstatusname(status) == 'LIVE':
            self.livecount=self.livecount+1
            if(self.livecount==3):
                print("System is ready for live:"+self.broker.currency)
                self.live_data = True
        else:
            self.live_data = False