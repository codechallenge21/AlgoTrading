import React, { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { userAuth } from './utils/state';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Build_strategy from './components/Build_Strategy/build_strategy.js';
import Homepage from './components/Homepage/index.js';


  function App() {
    // const [scripts, setScripts] = useState([]);

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
