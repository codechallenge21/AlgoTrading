import React, { useEffect, useRef, useState} from "react";

import "../../index.css";

import Editor from "@monaco-editor/react";
import Modal from "react-modal";
import {save_file, run_script, stop_script} from "../../utils/apis";

const fileUrl = '../../../py_scripts/strategy_roman.py';
const defaultFileContent = `
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
                self.log('{} - {} | Cash {} | O: {} H: {} L: {} C: {} V:{}  OI:{} SMAVOLUME:{} SMALOW:{} RSI:{} VWAP:{} SMAOI:{}'.format( \
                    data.datetime.datetime(),data._name, cash, \
                    data.open[0], data.high[0], data.low[0], data.close[0], data.volume[0],data.oi[0], \
                    self.sma20Volume[0],self.smalow[0],self.rsi[0],self.vwap[0],self.sma20Oi[0]))
        self.buysignal  = self.wzone[0]>0 and self.vwap[0]>0 and self.rsi[0]>self.p.pRsiLevel \
            and self.datas[0].close[0]>self.vwap[0] \
            and self.sma20Oi[0] > self.datas[0].oi[0] \
            and self.datas[0].volume[0]>self.sma20Volume[0] * self.p.volumerate
        if (self.live_data or self.backtest) and not self.bought:
            if self.buysignal:  # if fast crosses slow to the upside
                lotsize = self.p.initsize*pow(self.p.multiple,self.countloss)
                self.order = self.buy(size=lotsize)  # enter long
                self.bought = True
        if self.bought :
            if(self.datas[0].close[0]<self.smalow[0]):
                lotsize = self.p.initsize*pow(self.p.multiple,self.countloss)
                self.sell_order = self.sell(size=lotsize)  # enter short

`;

Modal.setAppElement('#root');

function CodePane(props) {
  
  const [defaultCode, setDefaultCode] = useState('');
  const editorRef = useRef(null);
  const [filename, setFilename] = useState('mystrategy');
  const [runningTimer, setRunningTimer] = useState(0);
  const [timer, setTimer] = useState(0);
  // const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => setRunningTimer(runningTimer + 1), 1000);
    } else {
      setRunningTimer(0)
    } 
  });

  useEffect(() => {
    setDefaultCode(defaultFileContent);
  })
  
  const handleFileChosen = async (file) => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  }

  const readAllFiles = async (AllFiles) => {
    const results = await Promise.all(AllFiles.map(async (file) => {
      const fileContents = await handleFileChosen(file);
      return fileContents;
    }));
    console.log(results);
    return results;
  }

  const startTest = async () => {
    setTimer(setInterval(setRunningTimer(runningTimer+1), 1000));
  };
  
  function toggleModal() {
    props.setOpenModal(!props.openModal);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor; 
  }
  
  function open_modal() {
    props.setOpenModal(true);
  }

  const saveFile = async () => {

    if (filename == '') {
      alert('Filename must be entered!');
      return
    }
    
    var names = filename.split('.py');
    var data = {
      content: editorRef.current.getValue(),
      file: names[0]
    }
    
    props.setShownName(names[0]+'.py')
    if (props.openModal) { toggleModal() }

    props.setLoading(true);
    document.querySelector('#btn-code-save').innerHTML = 'Saving...';
    document.querySelector('#btn-code-save').setAttribute("disabled", "disabled");
    document.querySelector('#btn-code-test').setAttribute("disabled", "disabled");
    
    var fileName = await save_file(data);
    console.log(fileName);
    
    document.querySelector('#btn-code-save').removeAttribute("disabled");
    document.querySelector('#btn-code-test').removeAttribute("disabled");
    document.querySelector('#btn-code-save').innerHTML = 'Save';
    props.setLoading(false);

  }

  const testValue = async () => {
    props.setLogs('');
    props.setCreatedImg64('');

    // await saveFile();
    
    var names = filename.split('.py');
    var data = {
      content: editorRef.current.getValue(),
      file: names[0],
      type: 'start_test'
    }
    
    props.setLoading(true);
    document.querySelector('#btn-code-save').setAttribute("disabled", "disabled");
    document.querySelector('#btn-code-test').style.display = 'none';
    document.querySelector('#btn-code-stop').style.display = 'block';
    startTest();
    
    var result = await run_script(data);
    console.log(result);

    document.querySelector('#btn-code-save').removeAttribute("disabled");
    document.querySelector('#btn-code-test').style.display = 'block';
    document.querySelector('#btn-code-stop').style.display = 'none';
    props.setLoading(false);

    setTimer(0);
    setRunningTimer(0);

    props.setResultOfBackTest(result);
  }

  const stopTest = async () => {

    props.setLogs('');
    props.setCreatedImg64('');

    var names = filename.split('.py');
    var data = {
      content: editorRef.current.getValue(),
      file: names[0],
      type: 'stop_test'
    }
    
    stop_script(data);
    
    // document.querySelector('#btn-code-test').style.display = 'block';
    // document.querySelector('#btn-code-stop').style.display = 'none';
    // props.setLoading(false);

    // setTimer(0);
    // setRunningTimer(0);
  }

  return (
   <>
      <Modal
        isOpen={props.openModal}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="mymodal"
        // style={customStyles}
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
        <div className="mb-1" name="modal-title">Enter File Name.</div>
        <input type="text" name="filename" value={filename} onChange={(e) => setFilename(e.target.value)} className="w-100 mb-3"/>
        <button onClick={toggleModal} className="btn btn-dark mb-1 float-right">Cancel</button>
        <button onClick={saveFile} className="btn btn-info mb-1 mr-2 float-right">Save</button>
      </Modal>
     <Editor
       height="40vh"
       defaultLanguage="python"
       defaultValue={defaultCode}
       onMount={handleEditorDidMount}
       theme= 'vs-dark'
     />
     <button className="btn btn-sm btn-danger mt-1 float-right" id="btn-code-test" onClick={filename==''?open_modal:testValue}>
       <i className="bi bi-play-fill" style={{"color":"#ffffff"}}></i> BackTest 
     </button>
     <button className="btn btn-sm btn-danger mt-1 float-right" id="btn-code-stop" onClick={stopTest}>
       <i className="bi bi-stop-fill" style={{"color":"#36D7B7"}}></i> Testing... {runningTimer}s
     </button>
     <button href="#" role="button" className="btn btn-sm btn-info mt-1 mr-2 float-right" id="btn-code-save" onClick={filename==''?open_modal:saveFile}>Save</button>
      
   </>
  );
}


export default CodePane;