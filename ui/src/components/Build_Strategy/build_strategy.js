import React, {createElement, useState} from 'react';
// import logo from './logo.svg';
import Portfolio from '../Portfolio'
import CodePane from './code-pane';
import {FadeLoader} from "react-spinners";
// import './App.css';

function Build_strategy() {
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#36D7B7");

  const [logs, setLogs] = useState('');
  const [createdImg64, setCreatedImg64] = useState('');
  const [shownName, setShownName] = useState('unsaved');
  const [openModal, setOpenModal] = useState(false);

  const showEditPencil = (filename) => {
    setShownName(filename);
  }

  const setResultOfBackTest = (resultData) => {

    setLogs(resultData["output"]);
    if (resultData['is_chart']) {
      setCreatedImg64(resultData["imgdata"]);
      document.querySelector('ul > li > a#console-tab').setAttribute('class', 'nav-link');
      document.querySelector('ul > li > a#chart-tab').setAttribute('class', 'nav-link active');
      document.querySelector('div#console').setAttribute('class', 'tab-pane fade');
      document.querySelector('div#chart').setAttribute('class', 'tab-pane fade show active');
    } else {
      setLogs(resultData['output']);
      document.querySelector('ul > li > a#chart-tab').setAttribute('class', 'nav-link');
      document.querySelector('ul > li > a#console-tab').setAttribute('class', 'nav-link active');
      document.querySelector('div#chart').setAttribute('class', 'tab-pane fade');
      document.querySelector('div#console').setAttribute('class', 'tab-pane fade show active');
    }
  }

  return (
    <div className="wrapper d-flex align-items-stretch" style={{backgroundColor:"rgb(50 50 50)"}}>
      <nav id="sidebar">
        <div className="p-4 pt-5">
          {/* <a href="#" className="img logo rounded-circle mb-5" style={{backgroundImage: 'url(./assets/img/logo.jpg)'}}>ALGO LOGO</a> */}
          <a href="#" className="img logo rounded-circle mb-5" >ALGO LOGO</a>
          <ul className="list-unstyled components mb-5">
            <li>
              <a href="#">Strategies</a>
              {/* <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Strategies</a>
              <ul className="collapse list-unstyled" id="homeSubmenu">
                <li>
                    <a href="#">Home 1</a>
                </li>
                <li>
                    <a href="#">Home 2</a>
                </li>
                <li>
                    <a href="#">Home 3</a>
                </li>
              </ul> */}
            </li>
            <li className="active">
                <a href="">Build Strategy</a>
            </li>
            <li>
              <a href="#">My Trading</a>
            </li>
          </ul>

          <div className="footer">
            <p>
              {/* <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. --> */}
              Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i className="icon-heart" aria-hidden="true"></i> by <a href="#" target="_blank">algo@algo.com</a>
              {/* <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. --> */}
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
            <h4 className="ml-2">Build Strategy</h4>
            <button className="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i className="fa fa-bars"></i>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="nav navbar-nav ml-auto">
                <li className="nav-item active">
                    {/* <a href="#" className="img logo rounded-circle" style={{backgroundImage: 'url(./assets/img/logo.jpg)'}}></a> */}
                    <a className="nav-link" href="#">Alexandr</a>
                </li>
                {/* <li className="nav-item">
                    <a className="nav-link" href="#">About</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Portfolio</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Contact</a>
                </li> */}
              </ul>
            </div>
          </div>
        </nav>
          
        <div className="mt-4 p-1" style={{textAlign:'left'}}>
          <span className="btn btn-sm btn-light mb-1 p-0 ml-0" style={{margin:"0px 0px", cursor:"pointer"}} onClick={()=>{setOpenModal(true)}}><b><i><span name="shownName" id="shown-name">{shownName}</span></i></b> script</span>
          
          <div>
            <CodePane 
              setResultOfBackTest={setResultOfBackTest} 
              setShownName = {showEditPencil}
              openModal = {openModal}
              setOpenModal = {setOpenModal}
              loading = {loading}
              setLoading = {setLoading}
              setLogs = {setLogs}
              setCreatedImg64 = {setCreatedImg64}
            />
          </div>
          <div className="sweet-loading text-center">
            <FadeLoader color={color} loading={loading} height={20} width={10} radius={10} margin={10} />
          </div>
        </div>
                
        <div className="mt-4 p-1">
          <p className="test-result ml-4 mb-1" style={{textAlign:"left"}}><b>BackTest Result</b></p>

          <ul className="nav nav-tabs" id="tabTestResult" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="chart-tab" data-toggle="tab" href="#chart" role="tab" aria-controls="chart" aria-selected="true">Chart</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="console-tab" data-toggle="tab" href="#console" role="tab" aria-controls="console" aria-selected="false">Console</a>
            </li>
          </ul>

          <div className="tab-content" id="testResultContent">

            <div className="tab-pane fade show active" id="chart" role="tabpanel" aria-labelledby="chart-tab">
              <div className="container text-center pt-2" style={{foreGroundColor:"lightgray"}}>
                <img className="text-center p-5" src={`data:image/png;base64,${createdImg64}`} style={{width:'100%'}} alt="" />
              </div>
            </div>
            <div className="tab-pane fade" id="console" role="tabpanel" aria-labelledby="console-tab">
              <div className="container text-center pt-2">
                <textarea readOnly={true} style={{width:"100%", height:"30vh", border:"none", backgroundColor:"lightgray", overflow:"scroll", fontSize:"80%"}} defaultValue={logs}></textarea>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Build_strategy;
