
import React, { useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import {
  Button,
  Modal,
} from "react-bootstrap";

import { login, register } from "../../../utils/JWTAuth";

function LoginForm (props) {
  const [showModal, setShowModal] = useState(false);
  const [smShow, setSmShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [equalMsg, setEqualMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');

  const sign_in = async () => {
    if(email == '' || password == '') {
      setErrMsg("Please type in all fields");
      return;
    }
   
    let info = {
      'email': email,
      'password': password
    };

    let result = await login(info);
    console.log('login result============>>>',result);

    
    if (result.success == 1) {
      setErrMsg('');
      setShowModal(false);
      props.navigate("/build_strategy", { replace: true });
    //  redirect to the main page.
    } else {
      setErrMsg("login failed");
    }
  }

  const sign_up = async () => {
    if (fname == '' || lname == '' || email == '' || password == '') {
      setErrMsg("Please Type Every Fields");
      return;
    }
    if (equalMsg != '' || errMsg != '') {
      return
    }
    let info = {
      'fname': fname,
      'lname':  lname,
      'email':      email,
      'password':   password
    };

    // console.log('signup feed============>>>',info);

    let result = await register(info);
    
    console.log('signup result=========>>>', result);
    
    if (result.success == 1) {
      setErrMsg('Successfully Registered\n. Please Login');
      setMode('login');
      
    } else {
      setErrMsg("Sign up failed");
    }
  }

  useEffect(() => {
    compare_password();
  },[cpassword, password])

  const compare_password = () => {
    if (password != cpassword) {setEqualMsg('Need to confirm Password'); }
    else if (password === cpassword) {setEqualMsg(''); }
  }

  const renderForgot = () => {
    return(
      <div>
        <p>inside of forgot! :) </p>
        <input
          type="text"
          name="email"
          value={email}
          id="login-email"
          className="form-control"
          placeholder="Enter email to reset password"
          onChange={(e)=>{setEmail(e.target.value)}}
        />
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setMode("login");
          }}
        >
          Back to login
        </a>
      </div>
    );
  };

  const renderRegister = () => {
    return (
      <div>
        <div>
          <form className="form-horizontal form-loanable">
        {errMsg!=''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
              <span className="fw-semi-bold">{errMsg}</span>
            </div>
        :null}
            <fieldset>
              <div className="form-group has-feedback required">
                <label htmlFor="reg-fname" className="col-sm-5">First Name</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <input
                    type="text"
                    name="fname"
                    value={fname}
                    id="reg-fname"
                    className="form-control"
                    placeholder="First name"
                    onChange={(e)=>{setFname(e.target.value)}}
                  />
                </div>
              </div>
                
              <div className="form-group has-feedback required">
                <label htmlFor="reg-lname" className="col-sm-5">Last Name</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <input
                    type="text"
                    name="lname"
                    value={lname}
                    id="reg-lname"
                    className="form-control"
                    placeholder="Last name"
                    onChange={(e)=>{setLname(e.target.value)}}
                  />
                </div>
              </div>
                
              <div className="form-group has-feedback required">
                <label htmlFor="reg-email" className="col-sm-5">Email address</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <input
                    type="text"
                    name="email"
                    value={email}
                    id="reg-email"
                    className="form-control"
                    placeholder="Enter email address"
                    onChange={(e)=>{setEmail(e.target.value)}}
                  />
                </div>
              </div>

              <div className="form-group has-feedback required">
                <label htmlFor="reg-password" className="col-sm-5">Password</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <div className="login-password-wrapper">
                    <input
                      type="password"
                      name="password"
                      value={password}
                      id="reg-password"
                      className="form-control"
                      placeholder="********"
                      required
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
                  </div>
                </div>
              </div>
        {equalMsg!=''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
              <span className="fw-semi-bold">{equalMsg}</span>
            </div>
        :null}

              <div className="form-group has-feedback required">
                <label htmlFor="reg-cpassword" className="col-sm-5">Confirm Password</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <div className="login-password-wrapper">
                    <input
                      type="password"
                      name="cpassword"
                      value={cpassword}
                      id="reg-cpassword"
                      className="form-control"
                      placeholder="********"
                      required
                      onChange={(e)=>{setCPassword(e.target.value)}}
                    />
                  </div>
                </div>
              </div>
        {equalMsg!=''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
              <span className="fw-semi-bold">{equalMsg}</span>
            </div>
        :null}
            

            </fieldset>
            {/* <div className="form-action">
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-left">Enter <span className="icon-arrow-right2 outlined"></span></button>
            </div> */}
          </form>
        
        </div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setMode("login");
          }}
        >
          Log in here
        </a>
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div>
          <form className="form-horizontal form-loanable">
          {errMsg!=''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
              <span className="fw-semi-bold">{errMsg}</span>
            </div>
          :null}
            <fieldset>
              <div className="form-group has-feedback required">
                <label htmlFor="login-email" className="col-sm-4">Email address</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <input
                    type="text"
                    name="email"
                    id="login-email"
                    className="form-control"
                    placeholder="Enter email address"
                    onChange={(e)=>{setEmail(e.target.value)}}
                    value={email}
                    required
                  />
                </div>
              </div>
              <div className="form-group has-feedback required">
                <label htmlFor="login-password" className="col-sm-5">Password</label>
                <div className="">
                  <span className="form-control-feedback" aria-hidden="true"></span>
                  <div className="login-password-wrapper">
                    <input
                      type="password"
                      name="password"
                      value={password}
                      id="login-password"
                      className="form-control"
                      placeholder="********"
                      required
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setMode("forgot");
                      }}
                    >
                      Forgot Password
                     </a>
                  </div>
                </div>
              </div>
            </fieldset>
            {/* <div className="form-action">
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-left">Enter <span className="icon-arrow-right2 outlined"></span></button>
            </div> */}
          </form>
       <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setMode("register");
          }}
        >
        Create your account
        </a>
      </div>
    );
  };

    return (
      <div className="text-center">
        <Modal
          show={props.showModal}
          onHide={props.onClose}
          onSubmit={mode==='login'?sign_in:sign_up}
          // bsSize="large"
        >
          <Modal.Header>
            <h2 style={{'textAlign':'center'}}>{ mode === "login" ? "Login" : mode === "register" ? "Register" : "Forgot Password" }</h2>
          </Modal.Header>
          <Modal.Body>
            {mode === "login" ? (renderLogin()) : mode === "register" ? (renderRegister()) : (renderForgot())}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-primary" onClick={mode=='login'?sign_in:sign_up}>Enter</Button>
            <Button className="btn btn-secondary"onClick={props.onClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
}

export default LoginForm;
