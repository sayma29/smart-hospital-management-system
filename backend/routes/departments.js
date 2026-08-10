import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

// @route  GET /api/departments
// @desc   Public list of departments (used for appointment booking dropdown)
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
