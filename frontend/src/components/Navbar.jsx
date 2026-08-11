import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        SHMS
      </Link>
      <div className="nav-links">
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
            <button className="btn-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
