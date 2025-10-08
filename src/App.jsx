// client/src/App.jsx

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import Login from "./components/Login.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    // Navigation is handled within the AdminPanel component
  };

  return (
    <Routes>
      {/* Public Route for Users */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Login Route */}
      <Route
        path="/admin/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />

      {/* Protected Admin Panel Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute token={token}>
            <AdminPanel token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
