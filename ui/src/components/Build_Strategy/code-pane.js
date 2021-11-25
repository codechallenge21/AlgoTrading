import React, { useEffect, useRef, useState} from "react";
import { useRecoilState } from 'recoil';
import { userAuth } from '../../utils/state';

import "../../index.css";

import Editor from "@monaco-editor/react";
import Modal from "react-modal";
import {save_file, run_script, stop_script} from "../../utils/apis";
import { logout, load_scripts, get_script_content } from '../../utils/JWTAuth';

import { ToastContainer, toast, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { findDOMNode } from "react-dom";


Modal.setAppElement('#root');

function CodePane(props) {
  
  const [auth, setUserAuth] = useRecoilState(userAuth); // rocoil read&writable function with atom variable ...
  
  const [defaultCode, setDefaultCode] = useState('');
  // const [scripts, setScripts] = useState([]);
  const editorRef = useRef(null);
  
  const [runningTimer, setRunningTimer] = useState(0);
  const [timer, setTimer] = useState(0);

  const [modalTitle, setModalTitle] = useState('Save Script');
  const [confirm_modal, setConfirmModal] = useState(false);
  
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => setRunningTimer(runningTimer + 1), 1000);
    } else {
      setRunningTimer(0)
    }
  });


  const findHintname = (names) => {
    let hintNum = 1;
    let isOk = false;
    console.log(isOk);
    while(!isOk) {
      var h_name = 'My Script '+hintNum;
      if (names.includes(h_name)) {
        hintNum ++;
      } else {
        props.setHintname(h_name);
        isOk = true;
      }
    }
  }

  useEffect(() => {
    if (props.filenames.length !== 0) {
      findHintname(props.filenames)
      console.log(props.hintname);
    }
  }, [props.filenames])

  useEffect(() => {
    if (props.scripts.length !== 0 && editorRef.current !== null) {
      // setDefaultCode(props.scripts[0].content);
      editorRef.current.setValue(props.scripts[0].content);
    }
  },[editorRef.current]);

  // useEffect(() => {
  //   async function fetchData() {
  //     if (editorRef.current !== null) {
  //       const response = await load_scripts({userID:auth.user.id});
  //       if (response.length !== 0) {
  //         setScripts(response);
  //         setDefaultCode(response[0].content);
  //         editorRef.current.setValue(response[0].content);
  //       }
  //     }
  //   }
  //   fetchData();
  //   console.log(editorRef.current);
  // }, []); // Or [] if effect doesn't need props or state

  const getFileContent = async (file_id, file_name) => {
    let data = {
      user_id: auth.user.id,
      file_id: file_id,
      file_name: file_name
    }
    props.setLoading(true);
    let result = await get_script_content(data);
    console.log(result);
    // setDefaultCode(content);
    if (result.success == '1') {
      
      setDefaultCode(result.content);
      props.setFileid(file_id);
      props.setShownName(file_name);
      props.setFilename(file_name);
      props.setOriginFileName(file_name);
      editorRef.current.setValue(result.content);

      props.setLoading(false);

    } else {
      props.setLoading(false);
      toast.info(result.message, {
        transition: Slide
      });

    }
  }

  // const getDefaultScript = () => {
  //   new_script();
  // }

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor; 
  }
 
  const startTest = async () => {
    setTimer(setInterval(setRunningTimer(runningTimer+1), 1000));
  };
  
  const toggleModal = () => {
    props.setFilename(props.shownName);
    props.setOpenModal(!props.openModal);
  }

  const open_modal = () => {
    console.log('Hint Name::: ', props.hintname)
    props.setOpenModal(true);
  }

  const rename_modal = () => {
    if (props.shownName === 'unsaved') {
      setModalTitle('Save Script');
      props.setFilename(props.hintname)
    } else {
      setModalTitle('Rename Script');
      props.setFilename(props.shownName)
    }
    open_modal();
  }

  const save_modal = () => {
    setModalTitle('Save Script');
    if (props.shownName === 'unsaved') {
      props.setFilename(props.hintname)
    }
    open_modal();
  }

  const checkFileName = () => {
    console.log("File already Exists??? ", props.filenames.includes(props.filename))

    if (
          ((props.shownName === 'unsaved') && props.filenames.includes(props.filename))
       || ((props.originFileName !== props.filename) && props.filenames.includes(props.filename))
          
      ) {
      setConfirmModal(true);
    } else {
      if(props.shownName === 'unsaved') {saveFile('add');}
      else if(props.originFileName === props.filename) {saveFile('edit');}
      else {saveFile('edit_rename');}
    }
  }

  const toggle = () => {
    setConfirmModal(!confirm_modal)
  }

  const go_saveFile = async () => {
    if (props.fileid == 0) {
      saveFile('add_replace');
    } else {
      saveFile('edit_replace');
    }
  }

  const saveFile = async (type) => {
    
    var names = props.filename.split('.py');
    let data = {
      user_id:      auth.user.id,
      type:         type,
      content:      editorRef.current.getValue(),
      file_id:      props.fileid,
      file_name:    names[0],
      origin_name:  props.originFileName
    }
    
    if (data.file_id === '' || data.user_id === '' || data.file_name ==='' || data.content === '') {
      toast.info('You are missing params to save script ', {
        transition: Slide
      });
      return;
    }

    props.setShownName(names[0])
    if (confirm_modal) {toggle()}
    if (props.openModal) { toggleModal() }

    props.setLoading(true);
    document.querySelector('#btn-code-save').innerHTML = 'Saving...';
    document.querySelector('#btn-code-save').setAttribute("disabled", "disabled");
    document.querySelector('#btn-code-test').setAttribute("disabled", "disabled");
    console.log(data);
    var result = await save_file(data);
    console.log(result);
    
    if (type === 'add') {

    } else if (type === 'edit') {

    } else if (type === 'edit_rename') {
      
    } else if (type === 'edit_replace') {

    }
    
    if (result.scriptsData.length !== 0)
    {
      // props.setShownName(data.file_name);
      props.setScripts(result.scriptsData);
    }
    // if (result.db_return != 0) {
    //   props.setFileid(result.db_return);
    // }          
              
    document.querySelector('#btn-code-save').removeAttribute("disabled");
    document.querySelector('#btn-code-test').removeAttribute("disabled");
    document.querySelector('#btn-code-save').innerHTML = 'Save';
    props.setLoading(false);

  }

  const testValue = async () => {
    props.setLogs('');
    props.setCreatedImg64('');

    await saveFile('edit');
    
    var names = props.filename.split('.py');
    var data = {
      user_id: auth.user.id,
      file: names[0],
      content: editorRef.current.getValue(),
      type: 'start_test'
    }
    
    props.setLoading(true);
    document.querySelector('#btn-code-save').setAttribute("disabled", "disabled");
    document.querySelector('#btn-code-test').style.display = 'none';
    document.querySelector('#btn-code-stop').style.display = 'block';
    startTest();
    
    var result = await run_script(data);

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

    var names = props.filename.split('.py');
    var data = {
      content: editorRef.current.getValue(),
      file: names[0],
      type: 'stop_test'
    }
    stop_script(data);
  }

  const new_script = () => {
    props.setFileid(0);
    props.setShownName('unsaved');
    props.setOriginFileName('');
    props.setFilename('')
    setDefaultCode(props.scripts[props.scripts.length - 1].content);
    editorRef.current.setValue(props.scripts[props.scripts.length - 1].content);
  }

  const open_script = () => {
    console.log(props.scripts);
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
          <h2 style={{'textAlign':'left', 'color':'#4e4e4e'}}>{modalTitle}</h2>
          <div className="mb-1" name="modal-title">Script Name</div>
          <input type="text" name="filename" value={props.filename} onChange={(e) => props.setFilename(e.target.value)} className="w-100 mb-3"/>
          <button onClick={checkFileName} className="btn btn-info mb-1 float-right">Save</button>
          <button onClick={toggleModal} className="btn btn-dark mb-1 mr-2 float-right">Cancel</button>
      </Modal>

      <Modal
        isOpen={confirm_modal}
        onRequestClose={toggle}
        contentLabel="My dialog"
        className="mymodal"
        // style={customStyles}
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
          <h2 style={{'textAlign':'left', 'color':'#4e4e4e'}}>Confirm</h2>
          <div className="mb-1" name="modal-title">Script "{props.filename}" already exists. Do you really want to replace it?</div>
          <button onClick={go_saveFile} className="btn btn-info mb-1 float-right">Yes</button>
          <button onClick={toggle} className="btn btn-dark mb-1 mr-2 float-right">No</button>
      </Modal>

      <span className="btn btn-sm btn-light mb-1 p-0 ml-0 script_name_span ml-4" onClick={()=>{rename_modal()}}><b><i><span name="shownName" id="shown-name"> {props.shownName}</span></i></b> &nbsp;<i className="bi bi-pencil"></i></span>&nbsp;
      <span className="btn btn-sm btn-light mb-1 p-0 ml-0 script_btn_span ml-3" onClick={()=>{new_script()}}><span name="newscript" id="new-script"> New</span> &nbsp;<i className="bi bi-file-earmark-plus"></i></span>&nbsp;
      <div className="btn-group dropright">
        <span className="btn btn-sm btn-light mb-1 p-0 ml-0 script_btn_span" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick={()=>{open_script()}}><span name="openscript" id="open-script"> Open</span> &nbsp;<i className="bi bi-folder2-open"></i></span>&nbsp;
        <div className="dropdown-menu">
          <a className="dropdown-item disabled" tabIndex="-1" aria-disabled="true">Recent used...</a>
          {
            props.scripts.map((sr,key) => {
              if (props.scripts.length > 1 && key+1 < props.scripts.length) {
                return <a className="dropdown-item" href="#" key={key} onClick={()=>getFileContent(sr.id, sr.script_name)}>{sr.script_name==='mystrategy'?'Default':sr.script_name}</a>
              } else {
                // return <><div className="dropdown-divider" key = {key}></div><a className="dropdown-item" href="#" key={key} onClick={()=>getDefaultScript(key)}>Default</a></>
              }
            })
          }
          {/* <div className="recent-used-scripts"></div> */}
          <div className="dropdown-divider"></div>
          <a className="dropdown-item" href="#" onClick={()=>new_script()}>Default</a>
          {/* <a className="dropdown-item" href="#">My Scripts...</a> */}
        </div>
      </div>
      
      <button className="btn btn-sm btn-danger mb-1 float-right" id="btn-code-test" onClick={props.shownName==='unsaved'?()=>{save_modal()}:()=>{testValue()}}>
        <i className="bi bi-play-circle" style={{"color":"#ffffff"}}></i> BackTest 
      </button>
      <button className="btn btn-sm btn-danger mb-1 float-right" id="btn-code-stop" onClick={()=>{stopTest()}}>
        <i className="bi bi-play-stop" style={{"color":"#36D7B7"}}></i> Testing... {runningTimer}s
      </button>
      <button role="button" className="btn btn-sm btn-info mb-1 mr-2 float-right" id="btn-code-save" onClick={props.shownName==='unsaved'?()=>{save_modal()}:()=>{saveFile('edit')}}>Save</button>
      
     <Editor
       height="40vh"
       defaultLanguage="python"
       defaultValue={defaultCode}
       onMount={handleEditorDidMount}
       theme= 'vs-dark'
     />

    <ToastContainer position="top-center" autoClose={4000} />
   </>
  );
}


export default CodePane;