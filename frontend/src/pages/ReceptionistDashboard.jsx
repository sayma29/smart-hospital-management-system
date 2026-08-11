import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Alert from "../components/Alert.jsx";

const TABS = ["Register Walk-in Patient", "Book Appointment", "All Appointments"];

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="dashboard">
      <h2>Receptionist Dashboard</h2>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === "Register Walk-in Patient" && <RegisterWalkIn />}
        {tab === "Book Appointment" && <BookForPatient />}
        {tab === "All Appointments" && <AllAppointments />}
      </div>
    </div>
  );
}

function RegisterWalkIn() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/patients/walkin", form);
      setMessage(`Patient account created for ${form.name}. They can log in with the email/password you set.`);
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not register patient.");
    }
  };

  return (
    <div className="card">
      <h3>Register a Walk-in Patient</h3>
      <Alert message={error} />
      <Alert type="success" message={message} />
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label>Temporary Password</label>
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Register Patient
        </button>
      </form>
    </div>
  );
}

function BookForPatient() {
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState("");
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", reason: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data));
    api.get("/departments").then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    if (!department) {
      setDoctors([]);
      return;
    }
    api.get(`/doctors?department=${encodeURIComponent(department)}`).then((res) => setDoctors(res.data));
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/appointments", form);
      setMessage("Appointment booked for the patient.");
      setForm({ patientId: "", doctorId: "", date: "", time: "", reason: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not book appointment.");
    }
  };

  return (
    <div className="card">
      <h3>Book an Appointment for a Patient</h3>
      <Alert message={error} />
      <Alert type="success" message={message} />
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label>Patient</label>
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Doctor</label>
          <select
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            required
            disabled={!doctors.length}
          >
            <option value="">Select doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.user?.name} — {doc.specialization || doc.department}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Time</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
        </div>
        <div className="span-2">
          <label>Reason for visit</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
          />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Book Appointment
        </button>
      </form>
    </div>
  );
}

function AllAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/appointments").then((res) => setAppointments(res.data));
  }, []);

  return (
    <div className="card">
      <h3>All Appointments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patient?.name}</td>
              <td>{a.doctor?.user?.name}</td>
              <td>{a.department}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6}>No appointments yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
