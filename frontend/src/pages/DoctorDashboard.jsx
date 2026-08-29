import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Alert from "../components/Alert.jsx";

const TABS = [
  { label: "My Schedule", icon: "📋" },
  { label: "Availability", icon: "🗓️" },
  { label: "My Profile", icon: "👤" },
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorDashboard() {
  const [tab, setTab] = useState(TABS[0].label);

  return (
    <div className="dashboard">
      <h2>Doctor Dashboard</h2>
      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            className={`tab tab-color-${i % 6} ${tab === t.label ? "active" : ""}`}
            onClick={() => setTab(t.label)}
          >
            <span className="tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === "My Schedule" && <Schedule />}
        {tab === "Availability" && <Availability />}
        {tab === "My Profile" && <MyProfile />}
      </div>
    </div>
  );
}

function Schedule() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [recordFormFor, setRecordFormFor] = useState(null);
  const [recordForm, setRecordForm] = useState({ diagnosis: "", prescription: "", notes: "" });

  const load = () => api.get("/appointments/doctor").then((res) => setAppointments(res.data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setError("");
    try {
      await api.put(`/appointments/${id}`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update appointment.");
    }
  };

  const openRecordForm = (appointment) => {
    setRecordFormFor(appointment);
    setRecordForm({ diagnosis: "", prescription: "", notes: "" });
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/records", {
        patientId: recordFormFor.patient._id,
        appointmentId: recordFormFor._id,
        ...recordForm,
      });
      setRecordFormFor(null);
      updateStatus(recordFormFor._id, "completed");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save medical record.");
    }
  };

  return (
    <div className="card">
      <h3>My Appointment Schedule</h3>
      <Alert message={error} />
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patient?.name}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{a.reason}</td>
              <td>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </td>
              <td className="actions">
                {a.status === "pending" && (
                  <button className="btn-link" onClick={() => updateStatus(a._id, "confirmed")}>
                    Confirm
                  </button>
                )}
                {a.status === "confirmed" && (
                  <button className="btn-link" onClick={() => openRecordForm(a)}>
                    Complete + Add Record
                  </button>
                )}
                {["pending", "confirmed"].includes(a.status) && (
                  <button className="btn-link danger" onClick={() => updateStatus(a._id, "cancelled")}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6}>No appointments scheduled.</td>
            </tr>
          )}
        </tbody>
      </table>

      {recordFormFor && (
        <div className="modal-backdrop" onClick={() => setRecordFormFor(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitRecord}>
            <h3>Medical Record — {recordFormFor.patient?.name}</h3>
            <label>Diagnosis</label>
            <input
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              required
            />
            <label>Prescription</label>
            <textarea
              rows={2}
              value={recordForm.prescription}
              onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
            />
            <label>Notes</label>
            <textarea
              rows={2}
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setRecordFormFor(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Complete Visit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Availability() {
  const [doctor, setDoctor] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/doctors/me/profile").then((res) => setDoctor(res.data));
  }, []);

  const toggleDay = (day) => {
    const exists = doctor.availability.find((a) => a.day === day);
    let updated;
    if (exists) {
      updated = doctor.availability.filter((a) => a.day !== day);
    } else {
      updated = [...doctor.availability, { day, startTime: "09:00", endTime: "17:00" }];
    }
    setDoctor({ ...doctor, availability: updated });
  };

  const updateTime = (day, field, value) => {
    const updated = doctor.availability.map((a) => (a.day === day ? { ...a, [field]: value } : a));
    setDoctor({ ...doctor, availability: updated });
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.put("/doctors/me/availability", {
        availability: doctor.availability,
        consultationFee: doctor.consultationFee,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
      });
      setMessage("Availability updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update availability.");
    }
  };

  if (!doctor) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h3>Manage Availability</h3>
      <Alert message={error} />
      <Alert type="success" message={message} />
      <form onSubmit={save}>
        <div className="form-grid">
          <div>
            <label>Specialization</label>
            <input
              value={doctor.specialization || ""}
              onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
            />
          </div>
          <div>
            <label>Consultation Fee (৳)</label>
            <input
              type="number"
              value={doctor.consultationFee || 0}
              onChange={(e) => setDoctor({ ...doctor, consultationFee: Number(e.target.value) })}
            />
          </div>
        </div>

        <h4>Weekly Availability</h4>
        {DAYS.map((day) => {
          const slot = doctor.availability.find((a) => a.day === day);
          return (
            <div key={day} className="availability-row">
              <label>
                <input type="checkbox" checked={!!slot} onChange={() => toggleDay(day)} />
                {day}
              </label>
              {slot && (
                <>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTime(day, "startTime", e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTime(day, "endTime", e.target.value)}
                  />
                </>
              )}
            </div>
          );
        })}

        <button className="btn btn-primary" type="submit" style={{ marginTop: "1rem" }}>
          Save Availability
        </button>
      </form>
    </div>
  );
}

function MyProfile() {
  const [doctor, setDoctor] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/doctors/me/profile").then((res) => setDoctor(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.put("/auth/me", {
        name: doctor.user.name,
        phone: doctor.user.phone,
      });
      await api.put("/doctors/me/availability", {
        qualifications: doctor.qualifications,
      });
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    }
  };

  if (!doctor) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h3>My Profile</h3>
      <Alert message={error} />
      <Alert type="success" message={message} />
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label>Full Name</label>
          <input
            value={doctor.user?.name || ""}
            onChange={(e) => setDoctor({ ...doctor, user: { ...doctor.user, name: e.target.value } })}
          />
        </div>
        <div>
          <label>Email</label>
          <input value={doctor.user?.email || ""} disabled />
        </div>
        <div>
          <label>Phone</label>
          <input
            value={doctor.user?.phone || ""}
            onChange={(e) => setDoctor({ ...doctor, user: { ...doctor.user, phone: e.target.value } })}
          />
        </div>
        <div>
          <label>Qualifications</label>
          <input
            value={doctor.qualifications || ""}
            onChange={(e) => setDoctor({ ...doctor, qualifications: e.target.value })}
          />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Save Profile
        </button>
      </form>
    </div>
  );
}