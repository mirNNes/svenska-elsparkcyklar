import React, { useEffect, useState } from "react";
// import { useState, useEffect } from "react";
import './css/App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Rides from "./pages/Rides";
import Login from "./pages/Login";
import CreateAccount from "./pages/create_account"
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import RentBike from "./pages/rent_bike";
import CurrentRide from "./pages/current_ride";

import {
  setAccessToken,
  setRefreshToken,
} from "./api/http";


// Skyddar routes så att bara inloggade users får se dem
function PrivateRoute({ token, loading, children }) {
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Laddar...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    const storedRefresh = localStorage.getItem("userRefreshToken");
    const storedUser = localStorage.getItem("userUser");

    if (storedToken) {
      setToken(storedToken);
      setAccessToken(storedToken);
    }

    if (storedRefresh) {
      setRefreshToken(storedRefresh);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setAuthLoading(false);
  }, []);

  // Anropas från Login.jsx efter lyckad login
  function handleLogin(accessToken, refreshToken, user) {
    localStorage.setItem("userToken", accessToken);
    localStorage.setItem("userRefreshToken", refreshToken);
    localStorage.setItem("userUser", JSON.stringify(user));

    setToken(accessToken);
    setUser(user);

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  // Logout: rensa allt
  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRefreshToken");
    localStorage.removeItem("userUser");

    setToken(null);
    setUser(null);

    setAccessToken(null);
    setRefreshToken(null);
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout} accessToken={token} user={user}>
          {/* Routes */}
          <Routes>
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute token={token} loading={authLoading}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/rides"
              element={
                <PrivateRoute token={token} loading={authLoading}>
                  <Rides />
                </PrivateRoute>
              }
            />
            <Route
              path="/create_account"
              element={
                  <CreateAccount />
              }
            />
            <Route 
              path="/rent/:bikeID" 
              element={
                <PrivateRoute token={token} loading={authLoading}>
                  <RentBike />
                </PrivateRoute>
              } />
            <Route 
              path="/current_ride/:rideID" 
              element={
                <PrivateRoute token={token} loading={authLoading}>
                  <CurrentRide />
                </PrivateRoute>
              } />
            </Routes>
      </Layout>
    </BrowserRouter>
  );
}
