import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero">
      <div className="marquee-wrap">
        <div className="marquee-text">
          Welcome to Smart Hospital Management System — Book Appointments — Meet Our Doctors — Access Your Medical Records — Manage Billing Online — Welcome to Smart Hospital Management System — Book Appointments — Meet Our Doctors — Access Your Medical Records — Manage Billing Online —
        </div>
      </div>

      <h1>Smart Hospital Management System</h1>
      <p>
        A centralized platform for patient registration, appointment booking, doctor
        scheduling, electronic medical records, and billing — built to replace manual,
        paper-based hospital workflows.
      </p>

      <img
        className="hero-banner"
        src="https://picsum.photos/seed/shms-main-hospital/900/400"
        alt="Hospital building"
      />

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

      <h2 className="section-title">Our Departments</h2>
      <div className="dept-grid">
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-cardiology/400/250" alt="Cardiology" />
          <h4>Cardiology</h4>
        </div>
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-general-medicine/400/250" alt="General Medicine" />
          <h4>General Medicine</h4>
        </div>
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-orthopedics/400/250" alt="Orthopedics" />
          <h4>Orthopedics</h4>
        </div>
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-pediatrics/400/250" alt="Pediatrics" />
          <h4>Pediatrics</h4>
        </div>
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-dermatology/400/250" alt="Dermatology" />
          <h4>Dermatology</h4>
        </div>
        <div className="dept-card">
          <img src="https://picsum.photos/seed/shms-neurology/400/250" alt="Neurology" />
          <h4>Neurology</h4>
        </div>
      </div>
    </div>
  );
}