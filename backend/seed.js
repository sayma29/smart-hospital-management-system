// Run with: node seed.js
// Creates one admin account and a couple of departments/doctors so you have
// something to log in with and demo immediately.
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Department from "./models/Department.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  const adminEmail = "admin@shms.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "admin",
    });
    console.log(`Admin created -> email: ${adminEmail}  password: Admin@123`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const departments = ["Cardiology", "General Medicine", "Orthopedics", "Pediatrics"];
  for (const name of departments) {
    const exists = await Department.findOne({ name });
    if (!exists) await Department.create({ name });
  }
  console.log("Departments seeded.");

  const doctorEmail = "doctor@shms.com";
  const existingDoctorUser = await User.findOne({ email: doctorEmail });
  if (!existingDoctorUser) {
    const doctorUser = await User.create({
      name: "Dr. Farhana Islam",
      email: doctorEmail,
      password: "Doctor@123",
      role: "doctor",
    });
    await Doctor.create({
      user: doctorUser._id,
      department: "General Medicine",
      specialization: "Internal Medicine",
      qualifications: "MBBS, FCPS",
      consultationFee: 600,
      availability: [
        { day: "Sunday", startTime: "09:00", endTime: "14:00" },
        { day: "Tuesday", startTime: "09:00", endTime: "14:00" },
        { day: "Thursday", startTime: "09:00", endTime: "14:00" },
      ],
    });
    console.log(`Doctor created -> email: ${doctorEmail}  password: Doctor@123`);
  } else {
    console.log("Sample doctor already exists, skipping.");
  }

  const receptionistEmail = "reception@shms.com";
  const existingReceptionist = await User.findOne({ email: receptionistEmail });
  if (!existingReceptionist) {
    await User.create({
      name: "Front Desk",
      email: receptionistEmail,
      password: "Reception@123",
      role: "receptionist",
    });
    console.log(`Receptionist created -> email: ${receptionistEmail}  password: Reception@123`);
  } else {
    console.log("Sample receptionist already exists, skipping.");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
