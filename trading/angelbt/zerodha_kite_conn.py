import logging
from kiteconnect import KiteConnect

logging.basicConfig(level=logging.DEBUG)

class KiteWrapper:
    def __init__(self, api_key = "9oj53b15vbkubvuy",
                    api_secret="dt2p6bkvy6molwv5djxceijtpz4ml8zd",
                    request_token="RKU3Miw1k8lj0dlSuVExICPHSPW2Ox2J",
                    access_token="qA6fDOPJ11mcyvVSGJFkCRBXZY5EN4vc"):
        # https://kite.zerodha.com/connect/login?v=3&api_key=9oj53b15vbkubvuy
        self.kite = KiteConnect(api_key=api_key)
        if access_token=="" or  access_token is None:
            data = self.kite.generate_session(request_token=request_token, api_secret=api_secret)
            self.kite.set_access_token(data["access_token"])
            print('access token',data["access_token"])
        else:
            self.kite.set_access_token(access_token)
        self.instruments = {}
        _instruments = self.kite.instruments()
        for inst in _instruments:
            self.instruments[inst["tradingsymbol"]] = inst
    def instruments(self):
        return self.kite.instruments()

    def fetch_ohlc(self,symbol,interval,from_date,to_date=None,continuous=False, oi=True):
        
        inst = self.instruments[symbol]
        data=[]
        if(inst is None):
            print('invalid symbol for ',symbol)
        else:
            
            data = self.kite.historical_data(inst["instrument_token"], from_date, to_date, interval, continuous, oi)
        
        return data


# kite = KiteWrapper()

# #data = kite.fetch_ohlc(symbol="BANKNIFTY21N1139400PE",from_date="2021-11-09 00:00:00",to_date="2021-11-10 18:00:00",interval="30minute")
# data = kite.fetch_ohlc(symbol="BANKNIFTY21N1139400PE",from_date="2021-11-09 00:00:00",to_date="2021-11-10 18:00:00",interval="30minute")
# logging.info(data)

