import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userAuth } from '../../utils/state';
import { useNavigate } from 'react-router-dom';

import CodePane from './code-pane';
import {FadeLoader} from "react-spinners";

import graph_logo from "../../assets/img/market trickks-01.svg";
import { logout, load_scripts } from '../../utils/JWTAuth';

function Build_strategy(props) {
  
  let navigate = useNavigate();
  
  const [auth, setUserAuth] = useRecoilState(userAuth); // rocoil read&writable function with atom variable ...

  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#36D7B7");

  const [logs, setLogs] = useState('');
  const [createdImg64, setCreatedImg64] = useState('');
  const [shownName, setShownName] = useState('unsaved');
  const [filename, setFilename] = useState('My Script');
  const [filenames, setFilenames] = useState([]);
  const [hintname, setHintname] = useState('My Script 1');
  const [fileid, setFileid] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [scripts, setScripts] = useState([]);
  const [originFileName, setOriginFileName] = useState('')

  useEffect(()=>{
    if (auth.isAuth === false) {
      setUserName('');
      navigate('/', {replace: true});

    } else {
      setUserName(auth.user.fname + ' ' + auth.user.lname);
    }
  });

  useEffect(() => {
    async function fetchData() {
      const response = await load_scripts({userID:auth.user.id});
      setScripts(response);
    }
    fetchData();
  }, [auth]); // Or [] if effect doesn't need props or state



  useEffect(() => {
    if (scripts.length !== 0) {
      setFileid(scripts[0].id);
      if (scripts[0].id !== 0 && scripts[0].script_name != "Default") {
        setShownName(scripts[0].script_name);
        setFilename(scripts[0].script_name);
        setOriginFileName(scripts[0].script_name);
        setFileid(scripts[0].id);
      } else {
        setShownName('unsaved');
        setFilename('');
        setOriginFileName('');
        setFileid(0);
      }
  
      let names = [];
      scripts.forEach(script => {
        names.push(script.script_name);
      });
      setFilenames(names)
    }
  }, [scripts])
  
  const findHintName = (names) => {
    // let hintNum = 1;
    // let isOk = false;
    
    // while (isOk){
    //   // for (let i = 0; i < names.length; i ++) {
    //   //   if ('My Script '+hintNum == names[i]) {
    //   //     isOk = false; 
    //   //     break;
    //   //   } else {
    //   //     continue;
    //   //   }
    //   // }
    //   // if (isOk == true) {
    //   //   setHintname('My Script '+hintNum)
    //   //   onSearch = false;
    //   //   // break;
    //   // } else {
    //   //   hintNum ++;
    //   // }


    //   let h_name = 'My Script '+hintNum;
    //   if (!names.includes(h_name)) {
    //     hintNum ++;
    //   } else {
    //     setHintname('My Script '+hintNum);
    //     isOk = true;
    //   }
    // }
  }

  const logging_out = () => {
    logout();
    setUserAuth({
      isAuth: false,
      user: null
    })
    navigate('/', {replace: true});
  };

  const setResultOfBackTest = (resultData) => {
    
    if(resultData['success'] === 1) {
      setLogs(resultData['outputWithErrors']);
      document.querySelector('textarea#logs').style.color = "#9e4747";
      
      document.querySelector('ul > li > a#console-tab').setAttribute('class', 'nav-link active');
      document.querySelector('ul > li > a#console-tab').setAttribute('aria-selected', 'true');
      document.querySelector('ul > li > a#chart-tab').setAttribute('class', 'nav-link');
      document.querySelector('ul > li > a#chart-tab').setAttribute('aria-selected', 'true');
      
      document.querySelector('.tab-content div#console').setAttribute('class', 'tab-pane fade show active');
      document.querySelector('.tab-content div#chart').setAttribute('class', 'tab-pane fade');
      
    } else if (resultData['is_chart'] === true) {
      setLogs(resultData['outputWithErrors']);
      document.querySelector('textarea#logs').style.color = "#47779e";
      
      setCreatedImg64(resultData["imgdata"]);
      document.querySelector('ul > li > a#chart-tab').setAttribute('class', 'nav-link active');
      document.querySelector('ul > li > a#chart-tab').setAttribute('aria-selected', 'true');
      document.querySelector('ul > li > a#console-tab').setAttribute('class', 'nav-link');
      document.querySelector('ul > li > a#console-tab').setAttribute('aria-selected', 'false');
      
      document.querySelector('.tab-content div#chart').setAttribute('class', 'tab-pane fade show active');
      document.querySelector('.tab-content div#console').setAttribute('class', 'tab-pane fade');
      
    } else {
      setLogs(resultData['outputWithErrors']);
      document.querySelector('textarea#logs').style.color = "#47779e";
      
      document.querySelector('ul > li > a#console-tab').setAttribute('class', 'nav-link active');
      document.querySelector('ul > li > a#console-tab').setAttribute('aria-selected', 'true');
      document.querySelector('ul > li > a#chart-tab').setAttribute('class', 'nav-link');
      document.querySelector('ul > li > a#chart-tab').setAttribute('aria-selected', 'true');
      
      document.querySelector('.tab-content div#console').setAttribute('class', 'tab-pane fade show active');
      document.querySelector('.tab-content div#chart').setAttribute('class', 'tab-pane fade');
    }
  }

  return (
    <div className="wrapper d-flex align-items-stretch" style={{backgroundColor:"rgb(50 50 50)"}}>
      <nav id="sidebar">
        <div className="p-4 pt-5">
          {/* <a href="#" className="img logo rounded-circle mb-5" style={{backgroundImage: 'url(./assets/img/logo.jpg)'}}>ALGO LOGO</a> */}
          <a href="#" className="img logo rounded-circle mb-5 text-center" ><img src={graph_logo} height="60%" /></a>
          <ul className="list-unstyled components mb-5">
            <li>
              <a href="#"><i className="bi bi-boxes"></i> &nbsp;Strategies</a>
            </li>
            <li className="active">
                <a href=""><i className="bi bi-braces"></i> &nbsp;Build Strategy</a>
            </li>
            <li>
              <a href="#"><i className="bi bi-currency-exchange"></i> &nbsp;My Trading</a>
            </li>
          </ul>

          <div className="footer text-center">
            <p>
              Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved <i className="icon-heart" aria-hidden="true"></i> by <a href="#" target="_blank" >algo@trade.com</a>
            </p>
          </div>

        </div>
      </nav>

      <div id="content" className="container p-2 p-md-3">

        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">

            <button type="button" id="sidebarCollapse" className="btn btn-sm btn-primary">
              <i className="fa fa-bars"></i>
            </button>
            <h4 className="ml-2" style={{marginTop:"7px"}}>Build Strategy</h4>
            <button className="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i className="fa fa-bars"></i>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="nav navbar-nav ml-auto">
                <li className="nav-item active">
                    {/* <a href="#" className="img logo rounded-circle" style={{backgroundImage: 'url(./assets/img/logo.jpg)'}}></a> */}
                    <a className="nav-link" href="">Hi, {userName} &nbsp;&nbsp;&nbsp;<span onClick={logging_out}><i className="bi bi-box-arrow-right"></i></span></a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
          
        <div className="mt-2 p-1" style={{textAlign:'left'}}>
          
          <div>
            <CodePane 
              setResultOfBackTest={setResultOfBackTest} 
              shownName = {shownName}
              setShownName = {setShownName}
              filename = {filename}
              setFilename = {setFilename}
              openModal = {openModal}
              setOpenModal = {setOpenModal}
              loading = {loading}
              setLoading = {setLoading}
              setLogs = {setLogs}
              setCreatedImg64 = {setCreatedImg64}
              setOpenModal = {setOpenModal}
              fileid = {fileid}
              setFileid = {setFileid}
              filenames = {filenames}
              setFilenames = {setFilenames}
              setOriginFileName = {setOriginFileName}
              originFileName = {originFileName}
              scripts = {scripts}
              setScripts = {setScripts}
              hintname = {hintname}
              setHintname = {setHintname}
            />
          </div>
          <div className="sweet-loading text-center">
            <FadeLoader color={color} loading={loading} height={20} width={10} radius={10} margin={10} />
          </div>
        </div>
                
        <div className="mt-1 p-1">
          {/* <p className="test-result ml-4 mb-1" style={{textAlign:"left"}}><b>BackTest Result</b></p> */}

          <ul className="nav nav-tabs" id="tabTestResult" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="chart-tab" data-toggle="tab" href="#chart" role="tab" aria-controls="chart" aria-selected="true">Chart</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="console-tab" data-toggle="tab" href="#console" role="tab" aria-controls="console" aria-selected="false">Log</a>
            </li>
          </ul>

          <div className="tab-content" id="testResultContent">

            <div className="tab-pane fade show active" id="chart" role="tabpanel" aria-labelledby="chart-tab">
              <div className="container text-center pt-2" style={{foreGroundColor:"lightgray"}}>
                <img className="text-center" src={`data:image/png;base64,${createdImg64}`} style={{width:'100%'}} alt="" />
              </div>
            </div>
            <div className="tab-pane fade" id="console" role="tabpanel" aria-labelledby="console-tab">
              <div className="container text-center pt-2">
                <textarea id="logs" readOnly={true} defaultValue={logs}></textarea>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Build_strategy;
