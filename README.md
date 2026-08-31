# MediCare+ (Smart Hospital Management System)

Full-stack hospital management platform built for the Web Programming Lab (CSE 323) project — Team PulseCode (Sayma Rahman, MD Salman).

MediCare+ is a centralized web platform for patient registration, appointment booking, doctor scheduling, electronic medical records (EMR), billing/invoicing, and admin management — built with the MERN stack (React, Node.js/Express, MongoDB) using JWT-based role authentication.

## Live Demo

Frontend: https://smart-hospital-management-system-mu.vercel.app

Backend API: https://smart-hospital-management-system-6nex.onrender.com

## Tech Stack

- Frontend: React 18 (Vite), React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt password hashing, role-based access control
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Folder Structure
hms/
├── backend/
│ ├── config/
│ ├── models/
│ ├── middleware/
│ ├── routes/
│ ├── server.js
│ └── seed.js
└── frontend/
└── src/
├── api/
├── context/
├── components/
└── pages/

## Features

- Role-based authentication for four account types: patient, doctor, admin, receptionist
- Patient registration and profile management, including medical history and blood group
- Browse 60+ doctors across six departments with photos, specializations, and consultation fees
- Search and filter doctors by name, specialization, or department
- Public department pages accessible from the homepage
- Appointment booking, rescheduling, and cancellation, with doctor confirmation and completion
- Doctor availability management with weekly schedule, fee, and specialization settings
- Doctor profile editing for name, phone, and qualifications
- Electronic Medical Records with diagnosis, prescription, and notes added after each visit
- Automatic invoice generation when an appointment is marked completed
- Sandbox payment gateway checkout for patients, with admin confirmation before payment counts as revenue
- Admin dashboard with full create, edit, and delete control over doctors, departments, and staff
- Live analytics dashboard showing appointments and revenue by department
- Printable invoice receipts
- Receptionist dashboard for registering walk-in patients and booking appointments on their behalf
- Real-time notifications for appointment requests, confirmations, and pending payments
- Dark and light mode toggle
- Medical tests information section with pricing

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier or local MongoDB)

### Backend
cd backend
npm install
cp .env.example .env
npm run dev
node seed.js

Edit the `.env` file with your own `MONGO_URI` and `JWT_SECRET` before running.

Demo accounts created by seed.js:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shms.com | Admin@123 |
| Doctor | doctor@shms.com | Doctor@123 |
| Receptionist | reception@shms.com | Reception@123 |
| Patient | karim.patient@shms.com | Patient@123 |

### Frontend
cd frontend
npm install
cp .env.example .env
npm run dev

Open http://localhost:5173 to view the app locally.

## Deployment

The backend is deployed on Render with environment variables for `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL`. The frontend is deployed on Vercel with the `VITE_API_URL` environment variable pointing to the Render backend. The database runs on MongoDB Atlas.

## Payment Flow

An unpaid invoice is created automatically when a doctor marks an appointment as completed. The patient can then pay through the sandbox checkout, which sets the invoice to an awaiting confirmation state. An admin reviews and confirms the payment before it is marked as paid and counted toward revenue.

## Team

Sayma Rahman — ID 232-115-100

MD Salman — ID 232-115-283

Web Programming Lab, CSE 323, Metropolitan University, Sylhet

## Known Limitations

No real payment gateway integration, matching the original project scope of a sandbox checkout. No native mobile app. No hardware or medical device integration. No automated SMS or email reminders.
