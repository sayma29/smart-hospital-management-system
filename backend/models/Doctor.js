import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
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
    photoUrl: { type: String, default: "" },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);