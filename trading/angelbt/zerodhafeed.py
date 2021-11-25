
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from collections import deque
from datetime import datetime

import backtrader as bt
from backtrader.feed import DataBase
from backtrader.utils.py3 import with_metaclass

from .angelstore import ANGELStore

class MetaZerodhaFeed(DataBase.__class__):
    def __init__(cls, name, bases, dct):
        # Initialize the class
        super(MetaZerodhaFeed, cls).__init__(name, bases, dct)

        # Register with the store
        ANGELStore.DataCls = cls


class ZerodhaFeed(with_metaclass(MetaZerodhaFeed, DataBase)):

    params = (
        ('historical', False),  # only historical download
        ('backfill_start', False),  # do backfilling at the start
        ('fetch_ohlcv_params', {}),
        ('ohlcv_limit', 8000),
        ('drop_newest', True),
        ('debug', False)
    )

    _store = ANGELStore

    # States for the Finite State Machine in _load
    _ST_LIVE, _ST_HISTORBACK, _ST_OVER = range(3)
    lines = ('oi',)
    def __init__(self, **kwargs):
        self.store = self._store(**kwargs)
        self._data = deque() 
        self._last_id = ''  # last processed trade id for ohlcv
        self._last_ts = None # last processed timestamp for ohlcv

    def start(self, ):
        DataBase.start(self)

        if self.p.fromdate:
            self._state = self._ST_HISTORBACK
            self.put_notification(self.DELAYED)
            self._fetch_ohlcv(self.p.fromdate)

        else:
            self._state = self._ST_LIVE
            self.put_notification(self.LIVE)

    def _load(self):
        if self._state == self._ST_OVER:
            return False

        while True:
            if self._state == self._ST_LIVE:
                if self._timeframe == bt.TimeFrame.Ticks:
                    return self._load_ticks()
                else:
                    self._fetch_ohlcv()
                    ret = self._load_ohlcv()
                    return ret

            elif self._state == self._ST_HISTORBACK:
                ret = self._load_ohlcv()
                if ret:
                    return ret
                else:
                    # End of historical data
                    if self.p.historical:  # only historical
                        self.put_notification(self.DISCONNECTED)
                        self._state = self._ST_OVER
                        return False  # end of historical
                    else:
                        self._state = self._ST_LIVE
                        self.put_notification(self.LIVE)
                        continue

    def _fetch_ohlcv(self, fromdate=None):
        """Fetch OHLCV data into self._data queue"""
        granularity = self.store.get_granularity(self._timeframe, self._compression)

        if fromdate:
            since = int((fromdate - datetime(1970, 1, 1)).total_seconds() * 1000)
        else:
            if self._last_ts is not None:
                since = self._last_ts
            else:
                since = int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds() * 1000)

        limit = self.p.ohlcv_limit

        while True:
            dlen = len(self._data)
            data = self.store.fetch_ohlcv(self.p.dataname, timeframe=granularity,
                                                    since=since, limit=limit, 
                                                    stf=self._timeframe, scomp=self._compression,
                                                    params=self.p.fetch_ohlcv_params)
            # exchanges which return partial data
            if len(data)>0 and self.p.drop_newest:
                del data[-1]
            for ohlcv in data:

                if None in ohlcv:
                    continue

                tstamp = datetime.timestamp(ohlcv["date"])*1000

                # Prevent from loading incomplete data
                # if tstamp > (time.time() * 1000):
                #    continue

                if self._last_ts is None or tstamp > self._last_ts:
                    self._data.append(ohlcv)
                    self._last_ts = tstamp

            if dlen == len(self._data):
                break

    def _load_ticks(self):
        if self._last_id is None:
            # first time get the latest trade only
            trades = [self.store.fetch_trades(self.p.dataname)[-1]]
        else:
            trades = self.store.fetch_trades(self.p.dataname)

        for trade in trades:
            trade_id = trade['id']

            if trade_id > self._last_id:
                trade_time = datetime.strptime(trade['datetime'], '%Y-%m-%dT%H:%M:%S.%fZ')
                self._data.append((trade_time, float(trade['price']), float(trade['amount'])))
                self._last_id = trade_id

        try:
            trade = self._data.popleft()
        except IndexError:
            return None  # no data in the queue

        trade_time, price, size = trade

        self.lines.datetime[0] = bt.date2num(trade_time)
        self.lines.open[0] = price
        self.lines.high[0] = price
        self.lines.low[0] = price
        self.lines.close[0] = price
        self.lines.volume[0] = size
        self.lines.oi[0] = size
        return True

    def _load_ohlcv(self):
        try:
            ohlcv = self._data.popleft()
        except IndexError:
            return None  # no data in the queue

        tstamp =ohlcv["date"]
        open =ohlcv["open"]
        high = ohlcv["high"]
        low = ohlcv["low"]
        close=ohlcv["close"]
        volume=ohlcv["volume"]
        oi = ohlcv["oi"]
        
        
        dtime = bt.date2num(tstamp)
        self.lines.datetime[0] = dtime
        self.lines.open[0] = open
        self.lines.high[0] = high
        self.lines.low[0] = low
        self.lines.close[0] = close
        self.lines.volume[0] = volume
        self.lines.oi[0] = oi
        

        return True

    def haslivedata(self):
        return self._state == self._ST_LIVE and self._data

    def islive(self):
        return not self.p.historical
