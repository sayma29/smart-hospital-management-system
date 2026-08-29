import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const departments = [
  { name: "Cardiology", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Wireless_ECG_Monitor.jpg" },
  { name: "General Medicine", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Hospital_room_ubt.jpeg" },
  { name: "Orthopedics", img: "https://commons.wikimedia.org/wiki/Special:FilePath/X_ray_internal_fixation_leg_fracture.jpg" },
  { name: "Pediatrics", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Physical_exam_of_child_with_stethoscope_on_chest.jpeg" },
  { name: "Dermatology", img: "https://commons.wikimedia.org/wiki/Special:FilePath/How_to_Use_a_Carbon_dioxide_Fractional_Laser_in_the_Dermatology.jpg" },
  { name: "Neurology", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Brain_MRI.jpg" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero">
      <div className="marquee-wrap">
        <div className="marquee-text">
          Welcome to MediCare+ — Book Appointments — Meet Our Doctors — Access Your Medical Records — Manage Billing Online — Welcome to MediCare+ — Book Appointments — Meet Our Doctors — Access Your Medical Records — Manage Billing Online —
        </div>
      </div>

      <h1>MediCare+</h1>
      <p>
        A centralized platform for patient registration, appointment booking, doctor
        scheduling, electronic medical records, and billing — built to replace manual,
        paper-based hospital workflows.
      </p>

      <img
        className="hero-banner"
        src="https://commons.wikimedia.org/wiki/Special:FilePath/Abington_Hospital_emergency_room_entrance.jpeg"
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
      <p style={{ textAlign: "center", color: "var(--muted)", marginTop: "-0.5rem" }}>
        Click a department to see all our doctors
      </p>
      <div className="dept-grid">
        {departments.map((dept) => (
          <Link key={dept.name} to={`/departments/${encodeURIComponent(dept.name)}`} className="dept-card-link">
            <div className="dept-card">
              <img src={dept.img} alt={dept.name} />
              <h4>{dept.name}</h4>
              <span className="dept-view-link">View Doctors →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}