import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("shms_theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("shms_theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("shms_theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-main">🏥 SHMS</span>
        <span className="brand-sub">Smart Hospital Management System</span>
      </Link>
      <div className="nav-links">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && user.role === "patient" && <Link to="/patient">Dashboard</Link>}
        {user && user.role === "doctor" && <Link to="/doctor">Dashboard</Link>}
        {user && user.role === "admin" && <Link to="/admin">Dashboard</Link>}
        {user && user.role === "receptionist" && <Link to="/receptionist">Dashboard</Link>}
        {user && (
          <>
            <span className="user-chip">
              {user.name} ({user.role})
            </span>
            <button className="btn-link" style={{ color: "white" }} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}