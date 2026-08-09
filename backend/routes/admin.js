import express from "express";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Department from "../models/Department.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, authorize("admin"));

// ---------- Dashboard stats ----------
router.get("/stats", async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, pendingAppointments, totalRevenue] =
      await Promise.all([
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "pending" }),
        Invoice.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Users ----------
router.get("/users", async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:id/deactivate", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User is now ${user.isActive ? "active" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Doctors (create doctor account) ----------
router.post("/doctors", async (req, res) => {
  try {
    const { name, email, password, phone, department, specialization, qualifications, consultationFee } =
      req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "name, email, password and department are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, phone, role: "doctor" });
    const doctor = await Doctor.create({
      user: user._id,
      department,
      specialization,
      qualifications,
      consultationFee,
    });

    res.status(201).json({ user: user.toSafeObject(), doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    res.json({ message: "Doctor account deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Staff (receptionist) ----------
router.post("/staff", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, phone, role: "receptionist" });
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Departments ----------
router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/departments", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: "Department already exists" });

    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/departments/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
