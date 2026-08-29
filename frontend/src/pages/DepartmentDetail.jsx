import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=fff&size=128&bold=true`;

export default function DepartmentDetail() {
  const { name } = useParams();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(`/doctors?department=${encodeURIComponent(name)}`).then((res) => setDoctors(res.data));
  }, [name]);

  const filtered = doctors.filter((doc) => {
    const term = search.toLowerCase();
    return doc.user?.name?.toLowerCase().includes(term) || doc.specialization?.toLowerCase().includes(term);
  });

  const bookLink = user && user.role === "patient" ? "/patient" : "/login";

  return (
    <div className="card">
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {name} Department
      </h2>
      <p style={{ textAlign: "center", color: "var(--muted)" }}>
        {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} available in {name}
      </p>
      <input
        type="text"
        placeholder="Search by doctor name or specialization..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="doctor-grid">
        {filtered.map((doc) => (
          <div key={doc._id} className="doctor-card">
            <img src={doc.photoUrl || avatarUrl(doc.user?.name || "Doctor")} alt={doc.user?.name} />
            <h4>{doc.user?.name}</h4>
            <p className="doctor-specialization">{doc.specialization}</p>
            <p className="doctor-qualifications">{doc.qualifications}</p>
            <p className="doctor-fee">Consultation fee: ৳{doc.consultationFee}</p>
            <Link className="btn btn-primary" to={bookLink} style={{ marginTop: "0.5rem", display: "inline-block" }}>
              Book Appointment
            </Link>
          </div>
        ))}
        {filtered.length === 0 && <p>No doctors found.</p>}
      </div>
    </div>
  );
}