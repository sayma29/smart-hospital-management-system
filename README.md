# Smart Hospital Management System (SHMS)

Full-stack MVP built for the *Web Programming Lab (CSE 323)* project proposal —
**PulseCode** (Sayma Rahman, MD Salman).

A centralized web platform for patient registration, appointment booking,
doctor scheduling, electronic medical records (EMR), billing/invoicing, and
an admin dashboard — built with the MERN-style stack from the proposal
(React, Node.js/Express, MongoDB), using JWT-based role authentication.

## Tech Stack
- **Frontend:** React 18 (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing, role-based access control
- **Deployment target:** Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas

## Folder Structure
```
hms/
├── backend/          # Express REST API
│   ├── config/       # DB connection
│   ├── models/       # Mongoose schemas
│   ├── middleware/   # JWT auth + role guard
│   ├── routes/       # auth, doctors, patients, appointments, records, invoices, admin
│   ├── server.js
│   └── seed.js        # creates a demo admin + doctor + departments
└── frontend/         # React (Vite) SPA
    └── src/
        ├── api/        # axios instance
        ├── context/    # AuthContext (login/register/logout)
        ├── components/ # Navbar, ProtectedRoute, Alert
        └── pages/      # Home, Login, Register, Patient/Doctor/Admin dashboards
```

## Features implemented (matches the proposal)
- Role-based auth: patient, doctor, admin, receptionist
- Patient registration & profile (medical history, blood group, etc.)
- Appointment booking, rescheduling, cancelling; doctor confirms/completes
- Doctor availability management (weekly schedule, fee, specialization)
- Electronic Medical Records — doctor adds diagnosis/prescription/notes after a visit
- Billing — invoice is auto-generated when a doctor marks a visit "completed";
  patient can mark it paid (mock payment, matches the proposal's "not included:
  real payment gateway integration")
- Admin dashboard — manage doctors, departments, staff, view all appointments/
  invoices, and see system stats (patients, doctors, revenue, pending appointments)
- Receptionist/staff dashboard — register walk-in patients, book appointments
  on behalf of a patient (phone/front-desk bookings), view all appointments

---

## 1. Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster,
  or run MongoDB locally)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your MONGO_URI + a JWT_SECRET
npm run dev          # starts on http://localhost:5000
node seed.js          # optional: creates demo admin/doctor/departments
```

Demo accounts created by `seed.js`:
| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin        | admin@shms.com     | Admin@123      |
| Doctor       | doctor@shms.com    | Doctor@123     |
| Receptionist | reception@shms.com | Reception@123  |

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000/api
npm run dev           # starts on http://localhost:5173
```

Open http://localhost:5173 — register a patient account, or log in with the
demo admin/doctor accounts above.

---

## 2. Push to GitHub
```bash
cd hms
git init
git add .
git commit -m "Initial commit: Smart Hospital Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
Both `.env` files are already git-ignored — never commit real secrets.
Two people on the team can each `git clone`, create a branch, and open pull
requests into `main`.

---

## 3. Free Hosting (so you can demo it live to your teacher)

**Database — MongoDB Atlas (free tier)**
1. Create a free cluster at mongodb.com/atlas.
2. Add a database user + password, and allow access from anywhere (0.0.0.0/0)
   for the demo.
3. Copy the connection string into `MONGO_URI`.

**Backend — Render.com (free tier)**
1. New "Web Service" → connect your GitHub repo → set root directory to `backend`.
2. Build command: `npm install` — Start command: `npm start`.
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
   `CLIENT_URL` (your Vercel frontend URL once deployed).
4. Deploy — note the resulting URL, e.g. `https://shms-backend.onrender.com`.

**Frontend — Vercel**
1. Import the same GitHub repo → set root directory to `frontend`.
2. Framework preset: Vite.
3. Environment variable: `VITE_API_URL = https://shms-backend.onrender.com/api`.
4. Deploy — Vercel gives you a live URL to show your teacher.

After both are live, run `node seed.js` once against your Atlas database
(you can do this locally by pointing your local `.env`'s `MONGO_URI` at the
Atlas cluster) so the demo accounts exist in production too.

---

## 4. Notes / Known Limitations (matches "Not Included" in the proposal)
- No real insurance or payment gateway integration — invoice "payment" is a
  mock status toggle, matching the proposal's stated scope.
- No native mobile app — the frontend is a responsive web app only.
- No hardware/medical-device integration.
- Optional/advanced features from the proposal (email/SMS reminders, online
  payments, analytics charts, bed/ward tracker) are not built — they were
  listed as "if time permits" and are good next steps once the MVP is graded.
