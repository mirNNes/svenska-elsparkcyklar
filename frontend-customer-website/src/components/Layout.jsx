import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { io } from 'socket.io-client';
import logo from '../assets/logo.png'

export default function Layout({ children, onLogout, accessToken }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const showLogout = isLogin || location.pathname === "/create_account";

  const [bikeUpdates, setBikeUpdates] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // Koppla inte upp socket förrän man är inloggade
    if (!accessToken || isLogin) return;

    // Ta bort /api från VITE_API_URL för att få ren backend-bas-URL
    const API_BASE = window.location.origin;
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
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Hem</NavLink>
        <NavLink to="/account" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Konto</NavLink>
        <NavLink to="/rides" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Reshistorik</NavLink>
        <NavLink to="/invoices" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Fakturor</NavLink>
        <button className="logout_btn" onClick={onLogout}>Logga ut</button>
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


{/* <Link className={({ isActive }) => (isActive ? 'active' : 'inactive')} selected={isActive("/")} to="/">Hem</Link> |{" "}
        <Link selected={isActive("/account")} to="/account">Konto</Link> |{" "}
        <Link selected={isActive("/rides")} to="/rides">Reshistorik</Link> |{" "}
        <Link selected={isActive("/invoices")} to="/invoices">Fakturor</Link> |{" "}
         */}
