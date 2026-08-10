import express from "express";
import Doctor from "../models/Doctor.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route  GET /api/doctors
// @desc   List all doctors, optionally filter by department
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;

    const doctors = await Doctor.find(filter).populate("user", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/doctors/me/profile
// @desc   Get logged-in doctor's own profile
router.get("/me/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/doctors/me/availability
// @desc   Doctor updates their own availability
router.put("/me/availability", protect, authorize("doctor"), async (req, res) => {
  try {
    const { availability, consultationFee, specialization, qualifications } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    if (availability) doctor.availability = availability;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualifications !== undefined) doctor.qualifications = qualifications;

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
