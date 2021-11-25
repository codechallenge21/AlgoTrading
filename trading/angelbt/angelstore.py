
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import time
from datetime import datetime, timedelta
from functools import wraps
import logging
import backtrader as bt
from backtrader.metabase import MetaParams
from backtrader.utils.py3 import with_metaclass
from .zerodha_kite_conn import KiteWrapper
from smartapi import SmartConnect
import requests

class MetaSingleton(MetaParams):
    '''Metaclass to make a metaclassed class a singleton'''

    def __init__(cls, name, bases, dct):
        super(MetaSingleton, cls).__init__(name, bases, dct)
        cls._singleton = None

    def __call__(cls, *args, **kwargs):
        if cls._singleton is None:
            cls._singleton = (
                super(MetaSingleton, cls).__call__(*args, **kwargs))

        return cls._singleton


class ANGELStore(with_metaclass(MetaSingleton, object)):

    # Supported granularities
    _GRANULARITIES = {
        (bt.TimeFrame.Minutes, 1): 'minute',
        (bt.TimeFrame.Minutes, 3): '3minute',
        (bt.TimeFrame.Minutes, 5): '5minute',
        (bt.TimeFrame.Minutes, 10): '10minute',
        (bt.TimeFrame.Minutes, 15): '15minute',
        (bt.TimeFrame.Minutes, 60): '60minute',
        (bt.TimeFrame.Days, 1): 'day',
    }

    BrokerCls = None  # broker class will auto register
    DataCls = None  # data class will auto register

    @classmethod
    def getdata(cls, *args, **kwargs):
        '''Returns ``DataCls`` with args, kwargs'''
        return cls.DataCls(*args, **kwargs)

    @classmethod
    def getbroker(cls, *args, **kwargs):
        '''Returns broker with *args, **kwargs from registered ``BrokerCls``'''
        return cls.BrokerCls(*args, **kwargs)

    def __init__(self, config,retries=5, backtest=True,debug=False):
        self.kite = KiteWrapper()
        self.instruments={}
        self.retries = retries
        self.debug = debug
        if backtest==False:
            self.angelbroker=SmartConnect(api_key=config["api_key"])
            self.angelbroker.generateSession(config["client_id"],config["client_pw"])
            resp = requests.get(url='https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json')
            instruments = resp.json() 
            self.get_balance()
            for inst in instruments:
                self.instruments[inst["token"]] = inst
        else:
            self.angelbroker = None
        


    def get_granularity(self, timeframe, compression):

        granularity = self._GRANULARITIES.get((timeframe, compression))
        if granularity is None:
            print('granularity is none')
            raise ValueError("backtrader  module doesn't support fetching OHLCV "
                             "data for time frame %s, comression %s" % \
                             (bt.TimeFrame.getname(timeframe), compression))
        
        return granularity

    def retry(method):
        @wraps(method)
        def retry_method(self, *args, **kwargs):
            for i in range(self.retries):
                if self.debug:
                    print('{} - {} - Attempt {}'.format(datetime.now(), method.__name__, i))
                try:
                    return method(self, *args, **kwargs)
                except :
                    if i == self.retries - 1:
                        raise
                time.sleep(5)

        return retry_method

    @retry
    def get_balance(self):
        rms = self.angelbroker.rmsLimit()
        self._cash = float(rms["data"]["availablecash"])
        self._value = float(rms["data"]["net"])

    @retry
    def getposition(self):
        return self._value
    @retry
    def fetch_order(self, oid):
        selectedorder=None
        time.sleep(1)
        orders = self.angelbroker.orderBook()
        if orders is not None and orders["data"] is not None:
            for order in orders["data"]:
                if order["orderid"]!=oid:
                    selectedorder = order
                    break
        return selectedorder

    @retry
    def fetch_open_orders(self,symbol=None):
        openorders = []
        time.sleep(1)
        
        orders = self.angelbroker.orderBook()
        if orders is not None and orders["data"] is not None:
            for order in orders["data"]:
                if order["orderstatus"]=="open pending" :
                    if symbol is None or order["tradingsymbol"]==self.getInstrumentBySymbol(symbol)["symbol"]:
                        openorders.append(order)
        return openorders

    def fetch_orders(self,symbol=None):
        openorders = []
        time.sleep(1)
        
        orders = self.angelbroker.orderBook()
        if orders is not None and orders["data"] is not None:
            for order in orders["data"]:
                if symbol is None or order["tradingsymbol"]==self.getInstrumentBySymbol(symbol)["symbol"]:
                    openorders.append(order)
        return openorders

    @retry
    def cancel_order(self, order_id):
        status = self.angelbroker.cancelOrder(order_id=order_id,variety="normal")
        return self.fetch_order(status["data"]["orderid"])

    @retry
    def fetch_trades(self,symbol=None):
        filteredTrades = []
        time.sleep(1)
        
        trbook = self.angelbroker.tradeBook()
        if symbol is None:
            filteredTrades = trbook
        else:
            for trade in trbook["data"]:
                if trade["tradingsymbol"]==self.getInstrumentBySymbol(symbol)["symbol"]:
                    trbook.append(trade)
        return filteredTrades

    @retry
    def fetch_ohlcv(self, symbol, timeframe, since, limit, stf, scomp,params={}):
        if self.debug:
            print('Fetching: {}, TF: {}, Since: {}, Limit: {}'.format(symbol, timeframe, since, limit))
        _since = since
        if _since is None:
            if stf==bt.TimeFrame.Minutes :
                _since = datetime.utcnow()-timedelta(minutes=limit*scomp)
            elif stf==bt.TimeFrame.Days:
                _since = datetime.utcnow()-timedelta(days=limit*scomp)
            _since = int((_since - datetime(1970, 1, 1)).total_seconds() * 1000)
        
        dt_object = datetime.fromtimestamp(_since/1000)
        from_date = dt_object.strftime("%Y-%m-%d %H:%M:%S")
        to_date = dt_object
        if stf==bt.TimeFrame.Minutes :
            to_date = to_date+timedelta(minutes=limit*scomp)
        elif stf==bt.TimeFrame.Days:
            to_date = to_date+timedelta(days=limit*scomp)
        
        return self.kite.fetch_ohlc(symbol, interval=timeframe, from_date=from_date, to_date=to_date)
    
    @retry
    def create_order(self, symbol, order_type, side, amount, price):
        # returns the order
        inst = self.getInstrumentBySymbol(symbol)
        orderparams = {
            "variety": "NORMAL",

            "tradingsymbol": inst["symbol"],
            "symboltoken": inst["token"],

            "transactiontype": "BUY" if side=='buy' else "SELL",
            "exchange": inst["exch_seg"],
            "ordertype": order_type,
            "producttype": "INTRADAY",
            "duration": "DAY",
            "price": price,
            "squareoff": "0",
            "stoploss": "0",
            "quantity": amount
        }
        orderId=self.angelbroker.placeOrder(orderparams)
        return orderId
    def getInstrumentBySymbol(self, symbol):
        instrument = None
        kiteinst = self.kite.instruments[symbol]
        if kiteinst is not None:
            instrument =self.instruments[kiteinst["exchange_token"]] 
        return instrument