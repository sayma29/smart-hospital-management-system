import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "doctor") navigate("/doctor");
      else if (user.role === "receptionist") navigate("/receptionist");
      else navigate("/patient");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <Alert message={error} />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-hint">
          Demo admin: admin@shms.com / Admin@123 &nbsp;|&nbsp; Demo doctor: doctor@shms.com /
          Doctor@123
        </p>
      </form>
    </div>
  );
}
