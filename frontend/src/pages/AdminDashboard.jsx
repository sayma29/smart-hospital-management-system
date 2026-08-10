import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Alert from "../components/Alert.jsx";

const TABS = ["Overview", "Doctors", "Departments", "Staff", "Appointments", "Invoices"];

export default function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === "Overview" && <Overview />}
        {tab === "Doctors" && <ManageDoctors />}
        {tab === "Departments" && <ManageDepartments />}
        {tab === "Staff" && <ManageStaff />}
        {tab === "Appointments" && <AllAppointments />}
        {tab === "Invoices" && <AllInvoices />}
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="card">Loading stats...</div>;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Patients</h4>
        <p>{stats.totalPatients}</p>
      </div>
      <div className="stat-card">
        <h4>Total Doctors</h4>
        <p>{stats.totalDoctors}</p>
      </div>
      <div className="stat-card">
        <h4>Total Appointments</h4>
        <p>{stats.totalAppointments}</p>
      </div>
      <div className="stat-card">
        <h4>Pending Appointments</h4>
        <p>{stats.pendingAppointments}</p>
      </div>
      <div className="stat-card">
        <h4>Revenue Collected</h4>
        <p>৳{stats.totalRevenue}</p>
      </div>
    </div>
  );
}

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    specialization: "",
    qualifications: "",
    consultationFee: 500,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/doctors").then((res) => setDoctors(res.data));

  useEffect(() => {
    load();
    api.get("/departments").then((res) => setDepartments(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/admin/doctors", form);
      setMessage("Doctor account created.");
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        specialization: "",
        qualifications: "",
        consultationFee: 500,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create doctor.");
    }
  };

  const removeDoctor = async (id) => {
    await api.delete(`/admin/doctors/${id}`);
    load();
  };

  return (
    <div>
      <div className="card">
        <h3>Add New Doctor</h3>
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
            <label>Password</label>
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label>Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Specialization</label>
            <input
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
          </div>
          <div>
            <label>Qualifications</label>
            <input
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
            />
          </div>
          <div>
            <label>Consultation Fee (৳)</label>
            <input
              type="number"
              value={form.consultationFee}
              onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
            />
          </div>
          <button className="btn btn-primary span-2" type="submit">
            Create Doctor Account
          </button>
        </form>
      </div>

      <div className="card">
        <h3>All Doctors</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Specialization</th>
              <th>Fee</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d._id}>
                <td>{d.user?.name}</td>
                <td>{d.department}</td>
                <td>{d.specialization}</td>
                <td>৳{d.consultationFee}</td>
                <td>
                  <button className="btn-link danger" onClick={() => removeDoctor(d._id)}>
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={5}>No doctors yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/departments").then((res) => setDepartments(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/departments", form);
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add department.");
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/departments/${id}`);
    load();
  };

  return (
    <div>
      <div className="card">
        <h3>Add Department</h3>
        <Alert message={error} />
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button className="btn btn-primary span-2" type="submit">
            Add Department
          </button>
        </form>
      </div>
      <div className="card">
        <h3>All Departments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.description}</td>
                <td>
                  <button className="btn-link danger" onClick={() => remove(d._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageStaff() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/admin/staff", form);
      setMessage("Receptionist account created.");
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create staff account.");
    }
  };

  return (
    <div className="card">
      <h3>Add Receptionist / Staff</h3>
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
          <label>Password</label>
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary span-2" type="submit">
          Create Staff Account
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

function AllInvoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get("/invoices").then((res) => setInvoices(res.data));
  }, []);

  return (
    <div className="card">
      <h3>All Invoices</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.patient?.name}</td>
              <td>{inv.doctor?.user?.name}</td>
              <td>৳{inv.amount}</td>
              <td>
                <span className={`badge badge-${inv.status}`}>{inv.status}</span>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={4}>No invoices yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
