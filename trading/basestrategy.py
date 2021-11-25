import backtrader as bt
from datetime import datetime
import logging

class baseStrategy(bt.Strategy):
    def __init__(self):
        super(baseStrategy, self).__init__()
        
    def log(self, txt, dt=None):
        ''' Logging function for this strategy'''
        dt = dt or self.datas[0].datetime.date(0)
        logging.info('%s, %s' % (dt.isoformat(), txt))
        print('%s, %s' % (dt.isoformat(), txt))

    def notify_order(self, order):
        #Check if order has been completed
        if order.status in [order.Completed]:
            if order.isbuy(): # Long
                self.log(
                    'LONG EXECUTED Ref: %d,Size %.4f, Price: %.4f, Cost: %.2f, Comm: %.2f' %
                    (order.ref,
                     order.executed.size,
                     order.executed.price,
                     order.executed.value,
                     order.executed.comm)
                    )
                
                self.buy_price = order.executed.price
                self.buy_comm = order.executed.comm
                
            else: # Short
                self.log(
                    'SHORT EXECUTED Ref: %d, Size %.4f, Price: %.4f, Cost: %.2f, Comm: %.2f' %
                    (order.ref,
                     order.executed.size,
                     order.executed.price,
                     order.executed.value,
                     order.executed.comm)
                    )
                
                self.sell_price = order.executed.price
                self.sell_comm = order.executed.comm
  
        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Ref %03d : SL/TP Order Canceled/Margin/Rejected'
                     % (order.ref))

    def notify_trade(self, trade):
        if trade.justopened:
            self.log('Trade Opened  - Size {%.4f} @Price {%.4f}'
                    %(trade.size, trade.price))
        elif trade.isclosed:
            if(trade.pnlcomm>0):
                self.countloss = 0
            else:
                self.countloss = self.countloss +1
            self.log('Trade Closed  - Profit {%.4f}' % (trade.pnlcomm))

        else:  # trade updated
            self.log('Trade Updated - Size %.4f @Price {%.4f}' % (trade.size, trade.price))    
    
    def notify_data(self, data, status, *args, **kwargs):
        dn = data._name
        dt = datetime.now()
        msg = 'Data Status: {}, Order Status: {}'.format(data._getstatusname(status), status)
        #print(dt, dn, msg)
        logging.info(msg)
        if data._getstatusname(status) == 'LIVE':
            self.live_data = True
        else:
            self.live_data = False

    