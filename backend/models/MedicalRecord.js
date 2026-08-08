import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true },
    prescription: { type: String, default: "" },
    notes: { type: String, default: "" },
    visitDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
