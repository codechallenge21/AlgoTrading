import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Switch, Link } from 'react-router-dom'
import Build_strategy from './components/Build_Strategy/build_strategy.js';
import Homepage from './components/Homepage/index.js';

  function App() {
    // const [auth, setAuth] = useRecoilState(userAuth)
    // const setNotification = useSetRecoilState(commonNotification)
    
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
      <div>
        <Router>
          <Routes> 
            <Route exact path="/" element={<Homepage />} />
            <Route path="/build_strategy" element={<Build_strategy />} />
          </Routes>
        </Router>
      </div>
    );
  }

  export default App;
