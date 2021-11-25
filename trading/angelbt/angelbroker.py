from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import collections
import json

from backtrader import BrokerBase, OrderBase, Order
from backtrader.position import Position
from backtrader.utils.py3 import queue, with_metaclass

from .angelstore import ANGELStore


class ANGELOrder(OrderBase):
    def __init__(self, owner, data, angel_order):
        self.owner = owner
        self.data = data
        self.angel_order = angel_order
        self.executed_fills = []
        self.ordtype = self.Buy if angel_order['transactiontype'] == 'BUY' else self.Sell
        self.size = float(angel_order['quantity'])

        super(ANGELOrder, self).__init__()


class MetaANGELBroker(BrokerBase.__class__):
    def __init__(cls, name, bases, dct):
        '''Class has already been created ... register'''
        # Initialize the class
        super(MetaANGELBroker, cls).__init__(name, bases, dct)
        ANGELStore.BrokerCls = cls


class ANGELBroker(with_metaclass(MetaANGELBroker, BrokerBase)):

    order_types = {Order.Market: 'MARKET',
                   Order.Limit: 'LIMIT',
                   Order.Stop: 'STOPLOSS_MARKET',  # stop-loss for kraken, stop for bitmex
                   Order.StopLimit: 'STOPLOSS_LIMIT'}

    mappings = {
        'closed_order': {
            'key': 'status',
            'value': 'completed'
        },
        'canceled_order': {
            'key': 'status',
            'value': 'canceled'},
        'rejected_order': {
            'key': 'status',
            'value': 'rejected'}
    }

    def __init__(self, broker_mapping=None, debug=False, **kwargs):
        super(ANGELBroker, self).__init__()

        if broker_mapping is not None:
            try:
                self.order_types = broker_mapping['order_types']
            except KeyError:  # Might not want to change the order types
                pass
            try:
                self.mappings = broker_mapping['mappings']
            except KeyError:  # might not want to change the mappings
                pass

        self.store = ANGELStore(**kwargs)

        self.positions = collections.defaultdict(Position)

        self.debug = debug
        self.indent = 4  # For pretty printing dictionaries

        self.notifs = queue.Queue()  # holds orders which are notified

        self.open_orders = list()

        self.startingcash = self.store._cash
        self.startingvalue = self.store._value


    def get_balance(self):
        self.store.get_balance()
        self.cash = self.store._cash
        self.value = self.store._value
        return self.cash, self.value

    def getcash(self):
        # Get cash seems to always be called before get value
        # Therefore it makes sense to add getbalance here.
        # return self.store.getcash(self.currency)
        self.cash = self.store._cash
        return self.cash

    def getvalue(self, datas=None):
        # return self.store.getvalue(self.currency)
        self.value = self.store._value
        return self.value

    def get_notification(self):
        try:
            return self.notifs.get(False)
        except queue.Empty:
            return None

    def notify(self, order):
        self.notifs.put(order)

    def getposition(self, data, clone=True):
        # return self.o.getposition(data._dataname, clone=clone)
        pos = self.positions[data._dataname]
        if clone:
            pos = pos.clone()
        return pos

    def next(self):
        if self.debug:
            print('Broker next() called')

        for o_order in list(self.open_orders):
            oID = o_order.angel_order['orderid']

            # Print debug before fetching so we know which order is giving an
            # issue if it crashes
            if self.debug:
                print('Fetching Order ID: {}'.format(oID))

            # Get the order
            angel_order = self.store.fetch_order(oID)
            print('oID',oID)
            # Check for new fills
            if 'status' in angel_order and angel_order['status'] is not None:
                o_order.execute(angel_order['updatetime'],float(angel_order['quantity']), angel_order['price'],
                                0, 0.0, 0.0,
                                0, 0.0, 0.0,
                                0.0, 0.0,
                                0, 0.0)
                o_order.executed_fills.append(angel_order['orderid'])
                # for fill in angel_order['trades']:
                #     if fill not in o_order.executed_fills:

            if self.debug:
                print(json.dumps(angel_order, indent=self.indent))

            # Check if the order is closed
            if angel_order[self.mappings['closed_order']['key']] == self.mappings['closed_order']['value']:
                pos = self.getposition(o_order.data, clone=False)
                pos.update(o_order.size, o_order.price)
                o_order.completed()
                self.notify(o_order)
                self.open_orders.remove(o_order)
                self.get_balance()

            # Manage case when an order is being Canceled from the Exchange
            #  from https://github.com/juancols/bt-ccxt-store/
            if angel_order[self.mappings['canceled_order']['key']] == self.mappings['canceled_order']['value']:
                self.open_orders.remove(o_order)
                o_order.cancel()
                self.notify(o_order)

    def _submit(self, owner, data, exectype, side, amount, price, params):
        if amount == 0 or price == 0:
        # do not allow failing orders
            return None
        order_type = self.order_types.get(exectype) if exectype else 'market'
        # Extract CCXT specific params if passed to the order
        print(data.p.dataname,order_type,side,amount,price)
        ret_ord = self.store.create_order(symbol=data.p.dataname, order_type=order_type, side=side,
                                            amount=amount, price=price)
        _order = self.store.fetch_order(ret_ord)
        print('ret_ord',ret_ord,_order)
        order = ANGELOrder(owner, data, _order)
        order.price = _order['price']
        self.open_orders.append(order)

        self.notify(order)
        return order

    def buy(self, owner, data, size, price=0, plimit=None,
            exectype=None, valid=None, tradeid=0, oco=None,
            trailamount=None, trailpercent=None,
            **kwargs):
        del kwargs['parent']
        del kwargs['transmit']
        return self._submit(owner, data, exectype, 'buy', size, price if price is not None else 0, kwargs)

    def sell(self, owner, data, size, price=0, plimit=None,
             exectype=None, valid=None, tradeid=0, oco=None,
             trailamount=None, trailpercent=None,
             **kwargs):
        del kwargs['parent']
        del kwargs['transmit']
        return self._submit(owner, data, exectype, 'sell', size, price if price is not None else 0, kwargs)

    def cancel(self, order):

        oID = order.angel_order['orderid']

        if self.debug:
            print('Broker cancel() called')
            print('Fetching Order ID: {}'.format(oID))

        # check first if the order has already been filled otherwise an error
        # might be raised if we try to cancel an order that is not open.
        angel_order = self.store.fetch_order(oID)

        if self.debug:
            print(json.dumps(angel_order, indent=self.indent))

        if angel_order[self.mappings['closed_order']['key']] == self.mappings['closed_order']['value']:
            return order

        angel_order = self.store.cancel_order(oID)

        if self.debug:
            print(json.dumps(angel_order, indent=self.indent))
            print('Value Received: {}'.format(angel_order[self.mappings['canceled_order']['key']]))
            print('Value Expected: {}'.format(self.mappings['canceled_order']['value']))

        if angel_order[self.mappings['canceled_order']['key']] == self.mappings['canceled_order']['value']:
            self.open_orders.remove(order)
            order.cancel()
            self.notify(order)
        return order

    def get_orders_open(self, safe=False):
        return self.store.fetch_open_orders()