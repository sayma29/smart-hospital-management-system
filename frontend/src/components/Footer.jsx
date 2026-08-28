import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h4>Smart Hospital Management System</h4>
          <p>Metropolitan University, Sylhet</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Phone: +880 1XXX-XXXXXX</p>
          <p>Email: support@shms.com</p>
        </div>
        <div>
          <h4>Address</h4>
          <p>123 Hospital Road, Sylhet, Bangladesh</p>
        </div>
        <div>
          <h4>Feedback</h4>
          <p>⭐⭐⭐⭐⭐ Rated 4.8/5 by patients</p>
          <p>Complaints: complaints@shms.com</p>
        </div>
      </div>
      <p className="footer-bottom">© 2026 Smart Hospital Management System. All rights reserved.</p>
    </footer>
  );
}