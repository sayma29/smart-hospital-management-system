import express from "express";
import Invoice from "../models/Invoice.js";
import Doctor from "../models/Doctor.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

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

router.put("/:id/pay", protect, authorize("patient"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (String(invoice.patient) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only pay your own invoices" });
    }
    invoice.status = "pending_confirmation";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/confirm", protect, authorize("admin"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.status = "paid";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/unpay", protect, authorize("admin"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.status = "unpaid";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;