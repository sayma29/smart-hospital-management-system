import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const load = async () => {
      try {
        const list = [];

        if (user.role === "patient") {
          const [apptRes, invRes] = await Promise.all([
            api.get("/appointments/mine"),
            api.get("/invoices/mine"),
          ]);
          apptRes.data
            .filter((a) => a.status === "confirmed")
            .forEach((a) =>
              list.push({
                icon: "📅",
                text: `Appointment confirmed with ${a.doctor?.user?.name} on ${a.date} at ${a.time}`,
              })
            );
          invRes.data
            .filter((i) => i.status === "unpaid")
            .forEach((i) => list.push({ icon: "💳", text: `Invoice of ৳${i.amount} is unpaid` }));
        }

        if (user.role === "doctor") {
          const res = await api.get("/appointments/doctor");
          res.data
            .filter((a) => a.status === "pending")
            .forEach((a) =>
              list.push({ icon: "🔔", text: `New appointment request from ${a.patient?.name} on ${a.date}` })
            );
        }

        if (user.role === "admin") {
          const [statsRes, invRes] = await Promise.all([api.get("/admin/stats"), api.get("/invoices")]);
          if (statsRes.data.pendingAppointments > 0) {
            list.push({ icon: "🗂️", text: `${statsRes.data.pendingAppointments} appointment(s) pending confirmation` });
          }
          const awaiting = invRes.data.filter((i) => i.status === "pending_confirmation");
          awaiting.forEach((i) =>
            list.push({ icon: "💳", text: `Payment of ৳${i.amount} awaiting your confirmation` })
          );
        }

        if (user.role === "receptionist") {
          const res = await api.get("/appointments");
          const pending = res.data.filter((a) => a.status === "pending");
          if (pending.length > 0) {
            list.push({ icon: "🗂️", text: `${pending.length} appointment(s) awaiting doctor confirmation` });
          }
        }

        setItems(list);
      } catch (err) {
        // Silently ignore — notifications are a convenience, not critical
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <div className="notification-wrap">
      <button className="notification-bell" onClick={() => setOpen(!open)} title="Notifications">
        🔔
        {items.length > 0 && <span className="notification-badge">{items.length}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">Notifications</div>
          {items.length === 0 && <div className="notification-empty">No new notifications.</div>}
          {items.map((n, i) => (
            <div key={i} className="notification-item">
              <span className="notification-icon">{n.icon}</span>
              <span>{n.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}