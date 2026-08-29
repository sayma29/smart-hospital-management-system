import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Alert from "../components/Alert.jsx";
import DoctorsBrowse from "./DoctorsBrowse.jsx";

const TABS = [
  { label: "Browse Doctors", icon: "🔍" },
  { label: "Book Appointment", icon: "📅" },
  { label: "My Appointments", icon: "🗂️" },
  { label: "Medical Records", icon: "🩺" },
  { label: "Invoices", icon: "💳" },
  { label: "Medical Tests", icon: "🧪" },
  { label: "Profile", icon: "👤" },
];

export default function PatientDashboard() {
  const [tab, setTab] = useState(TABS[0].label);

  return (
    <div className="dashboard">
      <h2>Patient Dashboard</h2>
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
        {tab === "Browse Doctors" && <DoctorsBrowse />}
        {tab === "Book Appointment" && <BookAppointment />}
        {tab === "My Appointments" && <MyAppointments />}
        {tab === "Medical Records" && <MedicalRecords />}
        {tab === "Invoices" && <Invoices />}
        {tab === "Medical Tests" && <MedicalTests />}
        {tab === "Profile" && <Profile />}
      </div>
    </div>
  );
}

function BookAppointment() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState("");
  const [form, setForm] = useState({ doctorId: "", date: "", time: "", reason: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
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
      setMessage("Appointment booked successfully.");
      setForm({ doctorId: "", date: "", time: "", reason: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not book appointment.");
    }
  };

  return (
    <div className="card">
      <h3>Book an Appointment</h3>
      <Alert message={error} />
      <Alert type="success" message={message} />
      <form onSubmit={handleSubmit} className="form-grid">
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
                {doc.user?.name} — {doc.specialization || doc.department} (৳{doc.consultationFee})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label>Time</label>
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
        </div>
        <div className="span-2">
          <label>Reason for visit</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Book Appointment
        </button>
      </form>
    </div>
  );
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/appointments/mine").then((res) => setAppointments(res.data));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    setError("");
    try {
      await api.put(`/appointments/${id}`, { status: "cancelled" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel appointment.");
    }
  };

  return (
    <div className="card">
      <h3>My Appointments</h3>
      <Alert message={error} />
      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Department</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.doctor?.user?.name}</td>
              <td>{a.department}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </td>
              <td>
                {["pending", "confirmed"].includes(a.status) && (
                  <button className="btn-link" onClick={() => cancel(a._id)}>
                    Cancel
                  </button>
                )}
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

function MedicalRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/records/mine").then((res) => setRecords(res.data));
  }, []);

  return (
    <div className="card">
      <h3>Medical Records</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Diagnosis</th>
            <th>Prescription</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{new Date(r.visitDate).toLocaleDateString()}</td>
              <td>{r.doctor?.user?.name}</td>
              <td>{r.diagnosis}</td>
              <td>{r.prescription}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={5}>No medical records yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [payModalFor, setPayModalFor] = useState(null);
  const [cardForm, setCardForm] = useState({ name: "", number: "", expiry: "", cvv: "" });

  const load = () => api.get("/invoices/mine").then((res) => setInvoices(res.data));

  useEffect(() => {
    load();
  }, []);

  const openPayModal = (inv) => {
    setPayModalFor(inv);
    setCardForm({ name: "", number: "", expiry: "", cvv: "" });
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/invoices/${payModalFor._id}/pay`);
      setPayModalFor(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    }
  };

  const statusLabel = (status) => (status === "pending_confirmation" ? "Awaiting Confirmation" : status);

  return (
    <div className="card">
      <h3>Invoices</h3>
      <Alert message={error} />
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Doctor</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.description}</td>
              <td>{inv.doctor?.user?.name}</td>
              <td>৳{inv.amount}</td>
              <td>
                <span className={`badge badge-${inv.status}`}>{statusLabel(inv.status)}</span>
              </td>
              <td>
                {inv.status === "unpaid" && (
                  <button className="btn-link" onClick={() => openPayModal(inv)}>
                    Pay Now
                  </button>
                )}
                {inv.status === "pending_confirmation" && (
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Waiting for admin to confirm</span>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={5}>No invoices yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {payModalFor && (
        <div className="modal-backdrop" onClick={() => setPayModalFor(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitPayment}>
            <h3>Pay ৳{payModalFor.amount}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Sandbox payment gateway — no real card is charged, this is a demo checkout.
            </p>
            <label>Cardholder Name</label>
            <input
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              placeholder="Name on card"
              required
            />
            <label>Card Number</label>
            <input
              value={cardForm.number}
              onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              required
            />
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: 1 }}>
                <label>Expiry</label>
                <input
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>CVV</label>
                <input
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                  placeholder="123"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPayModalFor(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const TEST_CATALOG = [
  { name: "Complete Blood Count (CBC)", category: "General Medicine", price: 400 },
  { name: "Lipid Profile", category: "Cardiology", price: 900 },
  { name: "ECG (Electrocardiogram)", category: "Cardiology", price: 600 },
  { name: "X-Ray (Single View)", category: "Orthopedics", price: 500 },
  { name: "MRI - Brain", category: "Neurology", price: 6500 },
  { name: "Skin Allergy Panel", category: "Dermatology", price: 1200 },
  { name: "Blood Sugar (Fasting & PP)", category: "General Medicine", price: 300 },
  { name: "Child Growth Assessment", category: "Pediatrics", price: 500 },
  { name: "Liver Function Test (LFT)", category: "General Medicine", price: 800 },
  { name: "Kidney Function Test (KFT)", category: "General Medicine", price: 800 },
];

function MedicalTests() {
  return (
    <div className="card">
      <h3>Available Medical Tests</h3>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Informational price list — ask your doctor or the front desk to schedule any of these tests
        during your visit.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Related Department</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {TEST_CATALOG.map((t) => (
            <tr key={t.name}>
              <td>{t.name}</td>
              <td>{t.category}</td>
              <td>৳{t.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/patients/me").then((res) => setProfile(res.data));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory } = profile;
    await api.put("/patients/me", { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory });
    setMessage("Profile updated.");
  };

  if (!profile) return <div className="card">Loading profile...</div>;

  return (
    <div className="card">
      <h3>My Profile</h3>
      <Alert type="success" message={message} />
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label>Name</label>
          <input value={profile.user?.name || ""} disabled />
        </div>
        <div>
          <label>Email</label>
          <input value={profile.user?.email || ""} disabled />
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Gender</label>
          <select name="gender" value={profile.gender || "other"} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Blood Group</label>
          <input name="bloodGroup" value={profile.bloodGroup || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Emergency Contact</label>
          <input name="emergencyContact" value={profile.emergencyContact || ""} onChange={handleChange} />
        </div>
        <div className="span-2">
          <label>Address</label>
          <input name="address" value={profile.address || ""} onChange={handleChange} />
        </div>
        <div className="span-2">
          <label>Medical History</label>
          <textarea name="medicalHistory" rows={3} value={profile.medicalHistory || ""} onChange={handleChange} />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Save Profile
        </button>
      </form>
    </div>
  );
}