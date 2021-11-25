import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';

import Landingpage from './dashboard/Landingpage';
import LoginForm from './signing/LoginForm.js';
  
function Homepage(props) {

    let navigate = useNavigate();

    const styles = {
        fontFamily: 'sans-serif',
        textAlign: 'center',
    };

    const [showModal, setShowModal] = useState(false);
    // const [form, setForm] = useState('');
    const [mode, setMode] = useState('Signin');

    const close = () => {
        setShowModal(false);
        setMode('Signin');
    }

    const open = () => {
        setShowModal(true);
    }
    
    
    return (
      <div className="wrapper d-flex align-items-stretch" style={styles}>
        <LoginForm 
          navigate={navigate} 
          showModal={showModal} 
          mode={mode} 
          setMode={setMode} 
          onClose = {close} 
        />
        <Landingpage 
            openModal={open}
        />
        
      </div>
    );
  }

  export default Homepage;
