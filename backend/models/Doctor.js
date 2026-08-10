import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: String, required: true },
    specialization: { type: String, default: "" },
    qualifications: { type: String, default: "" },
    consultationFee: { type: Number, default: 500 },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
