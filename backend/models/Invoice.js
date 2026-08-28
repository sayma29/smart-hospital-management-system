import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["unpaid", "pending_confirmation", "paid"], default: "unpaid" },
    description: { type: String, default: "Consultation fee" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);