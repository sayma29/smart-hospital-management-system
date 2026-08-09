import express from "express";
import Invoice from "../models/Invoice.js";
import Doctor from "../models/Doctor.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route  GET /api/invoices/mine
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/invoices
// @desc   Admin views all invoices
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("patient", "name email")
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/invoices/:id/pay
// @desc   Mark invoice as paid (mock payment, no real gateway)
router.put("/:id/pay", protect, authorize("patient", "admin", "receptionist"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (req.user.role === "patient" && String(invoice.patient) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only pay your own invoices" });
    }

    invoice.status = "paid";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
