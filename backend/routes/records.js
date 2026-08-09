import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/records
// @desc   Doctor adds a medical record for a patient
router.post("/", protect, authorize("doctor"), async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, prescription, notes } = req.body;
    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: "patientId and diagnosis are required" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || undefined,
      diagnosis,
      prescription,
      notes,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/records/mine
// @desc   Patient views their own medical records
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/records/patient/:patientId
// @desc   Doctor/Admin views a specific patient's medical history
router.get("/patient/:patientId", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
