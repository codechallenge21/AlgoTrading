
import React, { useState, useEffect } from "react";
import { useSetRecoilState } from 'recoil'
import { userAuth } from '../../../utils/state'

import {
  Button,
  Modal,
} from "react-bootstrap";
import { ToastContainer, toast, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { login, register, reset, load_scripts } from "../../../utils/JWTAuth";

function LoginForm (props) {
 
  const setUserAuth = useSetRecoilState(userAuth)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [equalMsg, setEqualMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [newpassword, setNewpassword] = useState('');

  useEffect(() => {
    setErrMsg('');
    setEqualMsg('');
  }, [props.mode]);

  useEffect(() => {
    compare_password();
  }, [cpassword])

  
  const reset_psw = async () => {
    if(email === '' || newpassword === '') {
      setErrMsg("All fields are needed.");
      return;
    }
   
    let info = {
      'email': email,
      'newpassword': newpassword
    };

    let result = await reset(info);

    if (result.success === 0) {
      toast.error(result.message, {
        transition: Slide
      });
    } else {
      toast.success(result.message, {
        transition: Slide
      });

      setTimeout(()=>{
        props.setMode('Signin');
      }, 1000);
      
    }
  }

  const sign_in = async () => {
    if(email === '' || password === '') {
      setErrMsg("All fields are needed.");
      return;
    }
   
    let info = {
      'email': email,
      'password': password
    };

    let result = await login(info);
    
    if (result.success && result.success === 1) {
      toast.success(result.message, {
        transition: Slide
      });

      setUserAuth({
        isAuth: true,
        user: result.user
      })
      
      setTimeout(()=>{
        props.navigate("/build_strategy", { replace: true });
      }, 2000);

    } else {
      toast.error(result.message, {
        transition: Slide
      });
    }
  }

  const sign_up = async () => {
    if (fname === '' || lname === '' || email === '' || password === '') {
      setErrMsg("All fields are needed.");
      return;
    }
    if (equalMsg !== '' || errMsg !== '') {
      return
    }
    let info = {
      'fname': fname,
      'lname':  lname,
      'email':      email,
      'password':   password
    };


    let result = await register(info);
    
    if (result.success && result.success === 1) {
      toast.success(result.message, {
        transition: Slide
      });

      setTimeout(()=>{
        props.setMode('Signin');
      }, 1000);
      
    } else {
      toast.error(result.message, {
        transition: Slide
      });
    }
  }

  const compare_password = () => {
    if (password !== cpassword) { setEqualMsg('Password not matched.'); }
    else if (password === cpassword) { setEqualMsg(''); }
  }

  const renderForgot = () => {
    return(
      <div>
        <form className="form-horizontal form-loanable">
        {errMsg!==''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true"></button>
              <span className="fw-semi-bold">{errMsg}</span>
            </div>
        :null}
            <div className="login-password-wrapper">
              <p>Reset your password! :) </p>
              <input
                type="text"
                name="email"
                value={email}
                id="login-email"
                className="form-control"
                placeholder="Your email"
                onChange={(e)=>{setEmail(e.target.value)}}
              /> 
            </div> <br />
            <div className="login-password-wrapper">
              <input
                type="password"
                name="newpassword"
                value={newpassword}
                id="reg-newpassword"
                className="form-control"
                placeholder="New password"
                required
                onChange={(e)=>{setNewpassword(e.target.value)}}
              />
            </div>
        </form> <br />
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              props.setMode("Signin");
            }}
          >
            Sign in here
          </a>
      </div>
    );
  };

  const renderRegister = () => {
    return (
      <div>
        <div>
          <form className="form-horizontal form-loanable">
        {errMsg!==''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true"></button>
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
                      placeholder="password"
                      required
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
                  </div>
                </div>
              </div>
 
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
                      placeholder="confirm password"
                      required
                      onChange={(e)=>{setCPassword(e.target.value)}}
                    />
                  </div>
                </div>
              </div>
        {equalMsg!==''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true"></button>
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
            props.setMode("Signin");
          }}
        >
          Sign in here
        </a>
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div>
          <form className="form-horizontal form-loanable">
          {errMsg!==''?
            <div className="alert alert-danger alert-sm">
              <button type="button" className="close" data-dismiss="alert" aria-hidden="true"></button>
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
                      placeholder="password"
                      required
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
                    
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
              props.setMode("forgot");
            }}
          >
            Forgot Password
            </a> <br/>
       <a
          href="#"
          onClick={e => {
            e.preventDefault();
            props.setMode("Register");
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
          onSubmit={props.mode === 'Signin'?sign_in:props.mode === "Register"?sign_up:reset_psw}
          // bsSize="large"
        >
          <Modal.Header>
            <h2 style={{'textAlign':'center', 'color':'#4e4e4e'}}>{ props.mode === "Signin" ? "Sign In" : props.mode === "Register" ? "Sign Up" : "Forgot Password" }</h2>
          </Modal.Header>
          <Modal.Body>
            {props.mode === "Signin" ? (renderLogin()) : props.mode === "Register" ? (renderRegister()) : (renderForgot())}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-primary" onClick={props.mode==='Signin'?sign_in:props.mode === "Register"?sign_up:reset_psw}>{props.mode === "Signin" ? "Sign In" : props.mode === "Register" ? "Sign Up" : "Reset"}</Button>
            <Button className="btn btn-secondary"onClick={props.onClose}>Close</Button>
          </Modal.Footer>

        </Modal>
        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    );
}

export default LoginForm;
