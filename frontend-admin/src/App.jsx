import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Bikes from "./pages/Bikes";
import Users from "./pages/Users";
import Cities from "./pages/Cities";
import Rides from "./pages/Rides";
import Login from "./pages/Login";
import UserDetails from "./pages/UserDetails";
import { setAccessToken, setRefreshToken } from "./api/http";
import "./App.css";

// Skyddar routes så att bara inloggade admins får se dem
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
            path="/bikes"
            element={
              <PrivateRoute token={token} loading={authLoading}>
                <Bikes />
              </PrivateRoute>
            }
          />

          <Route
            path="/users"
            element={
              <PrivateRoute token={token} loading={authLoading}>
                <Users />
              </PrivateRoute>
            }
          />

          <Route
            path="/users/:userId"
            element={
              <PrivateRoute token={token} loading={authLoading}>
                <UserDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/cities"
            element={
              <PrivateRoute token={token} loading={authLoading}>
                <Cities />
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
