import backtrader as bt
from datetime import datetime
from backtrader import Order
from strategies.utility.db import Db
import logging as  logger

class Strategy(bt.Strategy):
    params = dict(
        jsonparam={},
        backtest=False,
    )
    
    def __init__(self):
        self.db = Db(self.p.jsonparam["host"],self.p.jsonparam["user"],self.p.jsonparam["password"],self.p.jsonparam["database"])
        self.rsi = bt.ind.RSI(self.data.close,period=14, plot=True)
        status = self.db.getstatus_tokens(self.broker.currency)
        self.initvarbyjson(status)

    def init_status(self):
        status = self.db.inittoken
        self.initvarbyjson(status)
        self.write_status()
        
    def initvarbyjson(self,status):
        self.deals_id = status["deals_id"]
        self.dcalevel = status["dcalevel"]
        self.dcatp = status["dcatp"]
        self.dcalimit = status["dcalimit"]
        self.dcatrlevel = status["dcatrlevel"]
        self.trprice = status["trprice"]
        self.openprice = status["openprice"]
        self.stoploss = status["stoploss"]
        self.tporderid = status["tporderid"]
        self.dcaorderid = status["dcaorderid"]
        self.averageprice = status["averageprice"]
        self.totalqty=status["totalqty"]
    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        try:
            dt = dt or self.date[0]
        except Exception as e:
            dt = datetime.datetime.utcnow()
        if isinstance(dt, float):
            dt = bt.num2date(dt)
        logger.debug(f'{dt.isoformat()} {txt}')
        
    def next(self):
        if(self.live_data or self.p.backtest):
            self.log(
                f'{len(self)} '
                f'{self.open[0]:.2f} ' 
                f'{self.high[0]:.2f} '
                f'{self.low[0]:.2f} '
                f'{self.close[0]:.2f} '
                f'{self.volume[0]:.2f} '
                # f'{self.range[0]:.2f} '
            )            

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