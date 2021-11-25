
if backtest == False:
    cerebro.addstrategy(Strategy,backtest = backtest)  # Add the trading strategy
    config = {'api_key':"pCNKyY2s",
        'client_id':"P193991",
        'client_pw':"mapatel123"
        }
    store = ANGELStore(config=config,retries=5,backtest=backtest)
    broker = store.getbroker()
    cerebro.setbroker(broker)
    hist_start_date = datetime.utcnow() - timedelta(minutes=60*24*3)
    data = store.getdata(dataname=tradingsymbol, name=tradingsymbol,
                        timeframe=timeframe, fromdate=hist_start_date,
                        compression=timeframeCompression)
    cerebro.adddata(data)

if backtest :
    cerebro.addstrategy(Strategy,backtest = backtest)  # Add the trading strategy
    cerebro.broker.setcash(100000.0)
    cerebro.adddata(ZerodhaFeed(
                                dataname=tradingsymbol, name=tradingsymbol,
                                timeframe=timeframe,compression=timeframeCompression,
                                fromdate=fromdate,
                                todate=todate,
                                config=None))
cerebro.run()  # run it all
if backtest :
    cerebro.plot(path = filename,width=16, height=9,dpi=100) #cerebro.plot()  # and plot it with a single command

