import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom'

import Landingpage from './dashboard/Landingpage';
import LoginForm from './signing/LoginForm.js';
  
function Homepage() {

    let navigate = useNavigate();

    const styles = {
        fontFamily: 'sans-serif',
        textAlign: 'center',
    };

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState('');

    const close = () => {
        setShowModal(false);
    }

    const open = () => {
        setShowModal(true);
    }

    return (
      <div className="wrapper d-flex align-items-stretch" style={styles}>
        <LoginForm navigate={navigate} showModal={showModal} onClose = {close} />
        <Landingpage 
            openModal={open}
        />
      </div>
    );
  }

  export default Homepage;
