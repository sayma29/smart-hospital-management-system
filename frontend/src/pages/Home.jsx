import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero">
      <h1>Smart Hospital Management System</h1>
      <p>
        A centralized platform for patient registration, appointment booking, doctor
        scheduling, electronic medical records, and billing — built to replace manual,
        paper-based hospital workflows.
      </p>
      {!user && (
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/register">
            Register as Patient
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Login
          </Link>
        </div>
      )}
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Appointment Booking</h3>
          <p>Search doctors by department and book, reschedule, or cancel visits.</p>
        </div>
        <div className="feature-card">
          <h3>Doctor Scheduling</h3>
          <p>Doctors manage availability and view their daily/weekly appointment list.</p>
        </div>
        <div className="feature-card">
          <h3>Electronic Medical Records</h3>
          <p>Diagnoses, prescriptions, and notes stored securely per patient.</p>
        </div>
        <div className="feature-card">
          <h3>Billing & Invoicing</h3>
          <p>Automatic invoice generation for every completed consultation.</p>
        </div>
      </div>
    </div>
  );
}
