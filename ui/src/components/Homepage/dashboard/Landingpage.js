import React, {useState} from 'react';
import { Link } from "react-router-dom";
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { faqs } from "./faqs.json";

import './landingpage.css';

import chartImage from "../../../assets/img/chart.png";
import graph_logo from "../../../assets/img/market trickks-01.svg";
import handicon from "../../../assets/img/hand icon.svg";
import prices from "../../../assets/img/prices.svg";
import wallet from "../../../assets/img/wallet.svg";


function Landingpage(props){
  const [faq, setFaq] = useState(faqs[0]);
  
  const handleSignup = (username, email, password) => {};
  const handleLogin = (username, password) => {}
 
   return(
      <div className="landing-page">
         <nav className="nav mt-3">
            <div className="content col-md-12" style={{'display': 'inline-flex'}}>
               <div className="logo-div col-md-6" style={{'textAlign':'left'}}>
                  <a href="/">
                     <h2><img src={graph_logo} width="60" height="40" />&nbsp;ALGO-TRADE</h2>
                  </a>
               </div>
               <div className="user-action-btn col-md-6" style={{'textAlign':'right'}}>
                  <div className="icon-button">
                     <button onClick={props.openModal}>Register / LogIn</button>
                  </div>
               </div>
            </div>
         </nav>
         <div className="herosection">
            <div className="content">
               <div className="row mx-0 inner-content">
                  {/* <img src={backgroundimage} alt="background image"/>
                           <h2>BUY & SELL CRYPTO IN MINUTES</h2> */}
                  <div className="col-lg-6 col-12">
                     <div className="Launch-btn-div">
                        {/* <h2>AlgoTRADE</h2> */}
                        <p>
                           AlgoTRADE offers a next-level order book with unparalleled
                           feature-set and minimal fees powered by our Matic-Ethereum
                           bi-directional bridge. View live charts, set limit orders,
                           stop-loss orders and more. Trade synthetic stock derivatives,
                           earn rewards as a liquidity provider, deploy automated trading
                           bots governed by VeroxAI algorithm and experience the speed and
                           consistency of our next-generation automated market maker.
                           VeroxAI and AlgoTRADE is a complete ecosystem for cryptocurrency
                           and synthetic asset management, analysis, investing and
                           trading. 
                        </p>
                     </div>
                     {/* <div className="icon-button">
                           <button>Build Strategy</button>
                     </div> */}
                  </div>
                  <div className="col-lg-6 col-12 herp-img">
                     <img src={chartImage} alt="chart-image" />
                  </div>
               </div>
            </div>
         </div>

         <div className="detailsection">
            <div className="content">
               <div className="img2-div">
                  {/* <img src={backgroundimage} alt="graphline1" className="img-fluid" /> */}
               </div>

               <div className="row justify-content-md-center  py-5mx-0 details">
                  {" "}
                  {/*features section*/}
                  <div className="col-lg-12 col-12 p-0 crypto-sec">
                     <h2>Most advanced cryptocurrency decentralized exchange</h2>
                     <p>Join the all-in-one DEX for crypto and synthetic assets.</p>
                  </div>
                  <div className="col-lg-4 col-12 col-md-6 px-xl-5 mt-5">
                     <div className="funds">
                     <div className="funds-content">
                        <div className="img-div">
                           <span>
                           <img src={handicon} alt="hand icon" className="img-fluid" />
                           </span>
                        </div>
                        <div className="text">
                           <h1>Exchange</h1>
                           <h3>Advanced Dashboard</h3>
                           <p>
                           Verox is on a mission to bring the most advanced trading
                           toolkit to all users while staying true to what makes
                           cryptocurrencies revolutionary. AlgoTRADE is non-custodial
                           and decentralized which means maximum transparency,
                           efficiency, stability, security and freedom. With AlgoTRADE
                           we decentralize features that until now have either been
                           centralized or non-existent. 
                           </p>
                        </div>
                     </div>
                     </div>
                  </div>
                  <div className="col-lg-4 col-12  col-md-6 px-xl-5 mt-5">
                     <div className="funds">
                     <div className="funds-content">
                        <div className="img-div">
                           <span>
                           <img src={prices} alt="hand icon" className="img-fluid" />
                           </span>
                        </div>
                        <div className="text">
                           <h1>ELEVATE</h1>
                           <h3>EXCLUSIVE FEATURES</h3>
                           <p>
                           AlgoTRADE empowers you with advanced features to have
                           complete control and freedom with your crypto. Simply
                           connect your wallet with the AlgoTRADE dashboard and exchange
                           crypto and derivatives instantly with minimal fees, set
                           orders and do with your assets what you can’t anywhere
                           else. 
                           </p>
                        </div>
                     </div>
                     </div>
                  </div>
                  <div className="col-lg-4 col-12  col-md-6 px-xl-5 mt-5">
                     <div className="funds">
                     <div className="funds-content">
                        <div className="img-div">
                           <span>
                           <img src={wallet} alt="hand icon" className="img-fluid" />
                           </span>
                        </div>
                        <div className="text">
                           <h1>EARN</h1>
                           <h3>Earn Rewards</h3>
                           <p>
                           Supply liquidity and earn VRX, with high utility and even
                           higher scarcity. Participate in liquidity pools, earn
                           rewards and use your VRX to pay for VeroxAI app or stake for
                           18% APY.
                           </p>
                        </div>
                     </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

      </div>

   );
}
export default Landingpage;