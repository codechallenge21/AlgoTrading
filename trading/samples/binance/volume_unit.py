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
        buyamount=10,
        tp=2,
        sl=10,
        marketplace="USDT",
        backtest=False
    )
    def __init__(self):

        self.livecount = 0
        self.smavolume = bt.ind.SMA(self.data.volume,period=self.p.vperiod, plot=False)
        self.signalLong = bt.ind.CrossOver(self.data.volume,self.smavolume, plot=False)
        print('param',self.p.btc_res,self.p.btc_sup)
    def next(self):
        if(self.live_data or self.p.backtest):
            if self.p.backtest==False:
               cash, value = self.broker.get_wallet_balance(marketplace)
            else:
               cash = self.broker.get_cash()

            cond1 = self.data2.close[0]>self.p.minPrice and self.data2.close[0]<self.p.maxPrice
            cond2 = self.data1.volume[0]>self.p.btc_sup and self.data1.volume[0]<self.p.btc_res
            print('{} - {} | Cash:{} Cond:{}-{} Signal:{} Volume:{} SMAVolume:{} Close4H: {} VolumeBtc: {}'.format(self.datas[0].datetime.datetime(),self.data._name,
                cash,cond1,cond2,self.signalLong[0],self.data.volume[0], self.smavolume[0], self.data2.close[0], self.data1.volume[0]))
            
            if cond1 and cond2 and self.signalLong[0]==1:
                print('position',self.position)
                print('enter buy')
                self.order = self.buy(size=1)  # enter long
                self.sell(size=1, exectype=Order.Stop, price=self.data.close[0]*(100-sl)/100)
                self.sell(size=1, exectype=Order.Limit, price=self.data.close[0]*(100+tp)/100)
                print('position',self.position)

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