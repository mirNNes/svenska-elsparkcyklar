import React, { useEffect, useState, useRef } from "react";
// import { useState, useEffect } from "react";
import './css/customer.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Rides from "./pages/Rides";
import Login from "./pages/Login";
import CreateAccount from "./pages/create_account"
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import RentBike from "./pages/rent_bike";

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
    const storedToken = localStorage.getItem("adminToken");
    const storedRefresh = localStorage.getItem("adminRefreshToken");
    const storedUser = localStorage.getItem("adminUser");

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
    localStorage.setItem("adminToken", accessToken);
    localStorage.setItem("adminRefreshToken", refreshToken);
    localStorage.setItem("adminUser", JSON.stringify(user));

    setToken(accessToken);
    setUser(user);

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  // Logout: rensa allt
  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");

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
            <Route exact path="/rent/:id" render={(props) => (
                <RentBike id={props.match.params.id}/>
            )} />
          </Routes>
      </Layout>
    </BrowserRouter>
  );
}
