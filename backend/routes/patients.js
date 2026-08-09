import express from "express";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/patients/walkin
// @desc   Receptionist/Admin registers a walk-in patient at the front desk
router.post("/walkin", protect, authorize("receptionist", "admin"), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, phone, role: "patient" });
    const patient = await Patient.create({ user: user._id });

    res.status(201).json({ user: user.toSafeObject(), patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/patients
// @desc   Receptionist/Admin/Doctor lists all patients (e.g. to pick one when booking)
router.get("/", protect, authorize("receptionist", "admin", "doctor"), async (req, res) => {
  try {
    const users = await User.find({ role: "patient" }).select("name email phone").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/patients/me
router.get("/me", protect, authorize("patient"), async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!patient) {
      patient = await Patient.create({ user: req.user._id });
      patient = await patient.populate("user", "name email phone");
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/patients/me
router.put("/me", protect, authorize("patient"), async (req, res) => {
  try {
    const { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory } = req.body;
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient) patient = new Patient({ user: req.user._id });

    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;

    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/patients/:id
// @desc   Doctor/Admin view of a patient profile
router.get("/:id", protect, authorize("doctor", "admin", "receptionist"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.params.id }).populate("user", "name email phone");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
