import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Bikes from "./pages/Bikes";
import Users from "./pages/Users";
import Cities from "./pages/Cities";
import Rides from "./pages/Rides";
import Login from "./pages/Login";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/users" element={<Users />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/rides" element={<Rides />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
