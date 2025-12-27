import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import logo from '../assets/logo.png'


const drawerWidth = 240;

export default function Layout({ children, onLogout, accessToken, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  // true om man står på /login-sidan
  const isLogin = location.pathname === "/login";
  const showLogout = isLogin || location.pathname === "/create_account";

  const [bikeUpdates, setBikeUpdates] = useState({});
  const socketRef = useRef(null);

  // const isActive = (path) => location.pathname === path;
  // const currentIndex = menu.findIndex((item) => item.path === location.pathname);
  // const tabValue = currentIndex === -1 ? 0 : currentIndex;

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
      <div className='container'>
      <div className='header'>
        <div>
          <img src={logo} className="logo react" alt="Logo" />
      </div>
      <h1 className='headertitle'>Svenska sparkcyklar AB</h1>
      </div>
      <nav className='nav'>
      </nav>
      <div className='main'>
        {React.Children.map(children, child => 
          React.cloneElement(child, { bikeUpdates })
        )}
      </div>
      <div className='footer'>
          <p>Svenska sparkcyklar AB</p>
          <p>Skapad av: Michelle Tammi, Mirnes Mrso, Rebecka Corell, Robin Sanssi</p>
      </div>
    </div>
    );
  }

  return (
    <div className='container'>
      <div className='header'>
        <div>
          <img src={logo} className="logo react" alt="Logo" />
      </div>
      <h1 className='headertitle'>Svenska sparkcyklar AB</h1>
      </div>
      
      {/* Navigation */}
      <nav className='nav'>
        <Link to="/">Hem</Link> |{" "}
        <Link to="/account">Konto</Link> |{" "}
        <Link to="/rides">Reshistorik</Link> |{" "}
        <Link to="/invoices">Fakturor</Link> |{" "}
        <button onClick={onLogout}>Logga ut</button>
      </nav>
      <div className='main'>
        {React.Children.map(children, child => 
          React.cloneElement(child, { bikeUpdates })
        )}
      </div>
      <div className='footer'>
          <p>Svenska sparkcyklar AB</p>
          <p>Skapad av: Michelle Tammi, Mirnes Mrso, Rebecka Corell, Robin Sanssi</p>
      </div>
    </div>
  );
}
