import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { io } from 'socket.io-client';
import logo from '../assets/logo.png'
import scooter from '../assets/scooter.png'
import list from '../assets/list.png'

export default function Layout({ children, onLogout, accessToken, user }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const showLogout = isLogin || location.pathname === "/create_account";

  const [bikeUpdates, setBikeUpdates] = useState({});
  const socketRef = useRef(null);


  useEffect(() => {
    // Koppla inte upp socket förrän man är inloggade
    if (!accessToken || isLogin) return;

    // Ta bort /api från VITE_API_URL för att få ren backend-bas-URL
    const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');
    socketRef.current = io(API_BASE, {
      // Skicka med JWT-token som auth-info till Socket.IO-servern
      auth: { token: accessToken }
    });

    socketRef.current.on('bike-update', (data) => {
      setBikeUpdates(prev => ({ ...prev, [data.id]: data }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [accessToken, isLogin]);

  if (showLogout) {
    return (
      <div>
        <div class="header">
        <img src={logo} className="logo" alt="Logo" />
        <div class="title-div">
          <h1>Svenska</h1>
          <h1>Elsparkcyklar AB</h1>
        </div>
        
      </div>
        <div className='router-outlet'>
          <div className='flex-fix'>
            {React.Children.map(children, child => 
              React.cloneElement(child, { bikeUpdates, user })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="wrapper">
      <div class="header">
        <img src={logo} className="logo" alt="Logo" />
        <div class="title-div">
          <h1>Svenska<br/>Elsparkcyklar AB</h1>
          <button class="logout-button" onClick={onLogout}>Logga ut</button>
        </div>
      </div>
        <div className='router-outlet'>
          {/* <div className='flex-fix'> */}
            
            {React.Children.map(children, child => 
              React.cloneElement(child, { bikeUpdates })
            )}
          {/* </div> */}
        </div>
        <nav className='bottom-nav'>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : 'inactive')}><div class="nav_route"><img class="nav_img" src={scooter}/><p class="nav_text">Hyr cykel</p></div></NavLink>
          <NavLink to="/rides" className={({ isActive }) => (isActive ? 'active' : 'inactive')}><div class="nav_route"><img class="nav_img" src={list}/><p class="nav_text">Reshistorik</p></div></NavLink>
        </nav>
    </div>
  );
}
