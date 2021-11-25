import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot as GlobalState } from 'recoil'


import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import "bootstrap-icons/font/bootstrap-icons.css";

// import './assets/css/bootstrap.min.css';

ReactDOM.render(
    <React.StrictMode>
        <GlobalState>
            <React.Suspense fallback={<div>Loading...</div>}>
                <App />
            </React.Suspense>   
        </GlobalState>
    </React.StrictMode>, 
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
