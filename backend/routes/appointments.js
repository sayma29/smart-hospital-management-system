import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Invoice from "../models/Invoice.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/appointments
// @desc   Patient books their own appointment, OR receptionist/admin books on
//         behalf of a patient (front-desk booking for walk-ins/phone calls)
router.post("/", protect, authorize("patient", "receptionist", "admin"), async (req, res) => {
  try {
    const { doctorId, date, time, reason, patientId } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }

    let targetPatientId = req.user._id;
    if (req.user.role !== "patient") {
      if (!patientId) {
        return res.status(400).json({ message: "patientId is required when booking on behalf of a patient" });
      }
      targetPatientId = patientId;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const clash = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (clash) {
      return res.status(409).json({ message: "This slot is already booked. Please choose another time." });
    }

    const appointment = await Appointment.create({
      patient: targetPatientId,
      doctor: doctorId,
      department: doctor.department,
      date,
      time,
      reason,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/appointments/mine
// @desc   Patient views their own appointments
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/appointments/doctor
// @desc   Doctor views their schedule
router.get("/doctor", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email phone")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/appointments
// @desc   Admin / receptionist view of all appointments
router.get("/", protect, authorize("admin", "receptionist"), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/appointments/:id
// @desc   Update appointment status, or reschedule (patient can cancel/reschedule own; doctor can confirm/complete)
router.put("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const { status, date, time } = req.body;

    if (req.user.role === "patient") {
      if (String(appointment.patient) !== String(req.user._id)) {
        return res.status(403).json({ message: "You can only modify your own appointments" });
      }
      if (date) appointment.date = date;
      if (time) appointment.time = time;
      if (status === "cancelled") appointment.status = "cancelled";
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
        return res.status(403).json({ message: "You can only modify your own appointments" });
      }
      if (status) appointment.status = status;

      // Auto-generate an invoice once an appointment is marked completed
      if (status === "completed") {
        const existingInvoice = await Invoice.findOne({ appointment: appointment._id });
        if (!existingInvoice) {
          await Invoice.create({
            patient: appointment.patient,
            doctor: appointment.doctor,
            appointment: appointment._id,
            amount: doctor.consultationFee,
          });
        }
      }
    } else if (["admin", "receptionist"].includes(req.user.role)) {
      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
