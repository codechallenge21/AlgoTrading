
import backtrader
from datetime import datetime
from basestrategy  import baseStrategy

tradingsymbol = 'NIFTY21DEC18000CE'
timeframe = backtrader.TimeFrame.Minutes
timeframeCompression  = 5
fromdate = datetime(2021, 11,3, 0, 0)
todate = datetime(2021, 11, 12, 0, 0)


from datetime import datetime

class WorkingZone(backtrader.Indicator):
    plotinfo = dict(subplot=False)
    alias = ('WZONE', 'WorkingZone',)
    lines = ('wzone','ct')

    def __init__(self):
        super(WorkingZone, self).__init__()
    def next(self):
        
        if self.data.datetime.date(0) != self.data.datetime.date(-1):
            self.ct[0] =1
        else:
            self.ct[0] =self.ct[-1]+1
        if(self.ct[0]>3 and self.ct[0]<70):
            self.lines[0][0] = 1
        else:
            self.lines[0][0] = 0

class VolumeWeightedAveragePrice(backtrader.Indicator):
    plotinfo = dict(subplot=False)
    alias = ('VWAP', 'VolumeWeightedAveragePrice',)
    lines = ('vwap','cumvol','typprice','ct')
    plotlines = dict(VWAP=dict(alpha=0.50, linestyle='-.', linewidth=2.0))

    def __init__(self):
        super(VolumeWeightedAveragePrice, self).__init__()
    def next(self):
        
        if self.data.datetime.date(0) != self.data.datetime.date(-1):
            self.typprice[0]=((self.data.close[0] + self.data.high[0] + self.data.low[0])/3) * self.data.volume[0]
            self.cumvol[0] = self.data.volume[0]
            self.ct[0] =1
        else:
            self.typprice[0]=self.typprice[-1]+((self.data.close[0] + self.data.high[0] + self.data.low[0])/3) * self.data.volume[0]
            self.cumvol[0] = self.cumvol[-1]+self.data.volume[0]
            self.ct[0] =self.ct[-1]+1
        if  self.cumvol[0]>0:
            self.lines[0][0] = self.typprice[0]/self.cumvol[0]
        else: 
            self.lines[0][0] = 0


class Strategy(baseStrategy):
    
    params = dict(
        pRsi = 14,
        pRsiLevel = 60,
        pSma = 20,
        stop_loss=10,
        pRr =3,
        pSmaSL=10,
        multiple = 2,
        volumerate=1.5,
        initsize = 1,
        backtest = True
    )
    def __init__(self):
        self.countloss = 0
        self.rsi = backtrader.indicators.RelativeStrengthIndex(period=self.p.pRsi)
        self.sma20Oi = backtrader.ind.SMA(self.datas[0].oi,period=self.p.pSma, plot=True,subplot=True)
        self.sma20Volume= backtrader.ind.SMA(self.datas[0].volume,period=self.p.pSma, plot=False)
        self.vwap =  VolumeWeightedAveragePrice()
        self.wzone = WorkingZone()
        self.openi = self.datas[0].oi
        self.smalow = backtrader.ind.SMA(self.datas[0].low,period=self.p.pSmaSL, plot=True)
        self.backtest = self.p.backtest
        self.bought = False
        self.order = None
        super(Strategy, self).__init__()
    
    def notify_order(self, order):
        if order.status in [order.Completed]:
            if order.isbuy()==False: # Long
                self.bought = False
        super(Strategy, self).notify_order(order)

    def next(self):
        if self.live_data:
            cash, value = self.broker.get_balance()
        else:
            cash = 'NA'
        for data in self.datas:
            if(self.backtest==False):
                self.log('{} - {} | Cash {} | O: {} H: {} L: {} C: {} V:{}  OI:{} SMAVOLUME:{} SMALOW:{} RSI:{} VWAP:{} SMAOI:{}'.format(                     data.datetime.datetime(),data._name, cash,                     data.open[0], data.high[0], data.low[0], data.close[0], data.volume[0],data.oi[0],                     self.sma20Volume[0],self.smalow[0],self.rsi[0],self.vwap[0],self.sma20Oi[0]))
        self.buysignal  = self.wzone[0]>0 and self.vwap[0]>0 and self.rsi[0]>self.p.pRsiLevel             and self.datas[0].close[0]>self.vwap[0]             and self.sma20Oi[0] > self.datas[0].oi[0]             and self.datas[0].volume[0]>self.sma20Volume[0] * self.p.volumerate
        if (self.live_data or self.backtest) and not self.bought:
            if self.buysignal:  # if fast crosses slow to the upside
                lotsize = self.p.initsize*pow(self.p.multiple,self.countloss)
                self.order = self.buy(size=lotsize)  # enter long
                self.bought = True
        if self.bought :
            if(self.datas[0].close[0]<self.smalow[0]):
                lotsize = self.p.initsize*pow(self.p.multiple,self.countloss)
                self.sell_order = self.sell(size=lotsize)  # enter short

