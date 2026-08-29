import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=fff&size=128&bold=true`;

export default function DoctorsBrowse() {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/departments").then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    const url = activeDept === "All" ? "/doctors" : `/doctors?department=${encodeURIComponent(activeDept)}`;
    api.get(url).then((res) => setDoctors(res.data));
  }, [activeDept]);

  const filteredDoctors = doctors.filter((doc) => {
    const term = search.toLowerCase();
    return (
      doc.user?.name?.toLowerCase().includes(term) ||
      doc.specialization?.toLowerCase().includes(term) ||
      doc.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="card">
      <h3>Browse Doctors by Department</h3>
      <input
        type="text"
        placeholder="Search by doctor name or specialization..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="tabs" style={{ marginBottom: "1rem" }}>
        <button className={`tab ${activeDept === "All" ? "active" : ""}`} onClick={() => setActiveDept("All")}>
          All
        </button>
        {departments.map((d) => (
          <button
            key={d._id}
            className={`tab ${activeDept === d.name ? "active" : ""}`}
            onClick={() => setActiveDept(d.name)}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="doctor-grid">
        {filteredDoctors.map((doc) => (
          <div key={doc._id} className="doctor-card">
            <img src={doc.photoUrl || avatarUrl(doc.user?.name || "Doctor")} alt={doc.user?.name} />
            <h4>{doc.user?.name}</h4>
            <p className="doctor-specialization">{doc.specialization || doc.department}</p>
            <p className="doctor-department">{doc.department}</p>
            <p className="doctor-qualifications">{doc.qualifications}</p>
            <p className="doctor-fee">Consultation fee: ৳{doc.consultationFee}</p>
          </div>
        ))}
        {filteredDoctors.length === 0 && <p>No doctors found matching your search.</p>}
      </div>
    </div>
  );
}