import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Patient from "./models/Patient.js";
import Department from "./models/Department.js";
import Appointment from "./models/Appointment.js";
import MedicalRecord from "./models/MedicalRecord.js";
import Invoice from "./models/Invoice.js";

dotenv.config();

const upsertUser = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await User.create(data);
    console.log(`Created ${data.role} -> email: ${data.email}  password: ${data.password}`);
  }
  return user;
};

const seed = async () => {
  await connectDB();

  await upsertUser({
    name: "System Admin",
    email: "admin@shms.com",
    password: "Admin@123",
    role: "admin",
  });

  await upsertUser({
    name: "Front Desk",
    email: "reception@shms.com",
    password: "Reception@123",
    role: "receptionist",
  });

  const departmentNames = [
    "Cardiology",
    "General Medicine",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Neurology",
  ];
  for (const name of departmentNames) {
    const exists = await Department.findOne({ name });
    if (!exists) await Department.create({ name });
  }
  console.log("Departments seeded.");

  const doctorSeed = [
    {
      name: "Dr. Farhana Islam",
      email: "doctor@shms.com",
      password: "Doctor@123",
      department: "General Medicine",
      specialization: "Internal Medicine",
      qualifications: "MBBS, FCPS",
      consultationFee: 600,
      availability: [
        { day: "Sunday", startTime: "09:00", endTime: "14:00" },
        { day: "Tuesday", startTime: "09:00", endTime: "14:00" },
        { day: "Thursday", startTime: "09:00", endTime: "14:00" },
      ],
    },
    {
      name: "Dr. Kamal Hossain",
      email: "kamal.cardiology@shms.com",
      password: "Doctor@123",
      department: "Cardiology",
      specialization: "Interventional Cardiology",
      qualifications: "MBBS, MD (Cardiology)",
      consultationFee: 1200,
      availability: [
        { day: "Saturday", startTime: "10:00", endTime: "15:00" },
        { day: "Monday", startTime: "10:00", endTime: "15:00" },
        { day: "Wednesday", startTime: "10:00", endTime: "15:00" },
      ],
    },
    {
      name: "Dr. Nusrat Jahan",
      email: "nusrat.ortho@shms.com",
      password: "Doctor@123",
      department: "Orthopedics",
      specialization: "Joint Replacement Surgery",
      qualifications: "MBBS, MS (Ortho)",
      consultationFee: 900,
      availability: [
        { day: "Sunday", startTime: "15:00", endTime: "19:00" },
        { day: "Tuesday", startTime: "15:00", endTime: "19:00" },
      ],
    },
    {
      name: "Dr. Arif Chowdhury",
      email: "arif.pediatrics@shms.com",
      password: "Doctor@123",
      department: "Pediatrics",
      specialization: "Child Healthcare",
      qualifications: "MBBS, DCH",
      consultationFee: 700,
      availability: [
        { day: "Saturday", startTime: "09:00", endTime: "13:00" },
        { day: "Monday", startTime: "09:00", endTime: "13:00" },
        { day: "Wednesday", startTime: "09:00", endTime: "13:00" },
      ],
    },
    {
      name: "Dr. Sharmin Akter",
      email: "sharmin.derma@shms.com",
      password: "Doctor@123",
      department: "Dermatology",
      specialization: "Cosmetic & Clinical Dermatology",
      qualifications: "MBBS, DDV",
      consultationFee: 800,
      availability: [
        { day: "Thursday", startTime: "11:00", endTime: "16:00" },
        { day: "Friday", startTime: "11:00", endTime: "16:00" },
      ],
    },
    {
      name: "Dr. Mahbub Rahman",
      email: "mahbub.neuro@shms.com",
      password: "Doctor@123",
      department: "Neurology",
      specialization: "Stroke & Epilepsy Care",
      qualifications: "MBBS, MD (Neurology)",
      consultationFee: 1500,
      availability: [
        { day: "Sunday", startTime: "10:00", endTime: "14:00" },
        { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
      ],
    },
  ];

  const createdDoctors = [];
  for (const d of doctorSeed) {
    let user = await User.findOne({ email: d.email });
    if (!user) {
      user = await User.create({
        name: d.name,
        email: d.email,
        password: d.password,
        role: "doctor",
      });
      console.log(`Created doctor -> email: ${d.email}  password: ${d.password}`);
    }
    let doctorProfile = await Doctor.findOne({ user: user._id });
    if (!doctorProfile) {
      doctorProfile = await Doctor.create({
        user: user._id,
        department: d.department,
        specialization: d.specialization,
        qualifications: d.qualifications,
        consultationFee: d.consultationFee,
        availability: d.availability,
      });
    }
    createdDoctors.push(doctorProfile);
  }
  console.log("Doctors seeded.");

  const patientSeed = [
    { name: "Karim Hossain", email: "karim.patient@shms.com", phone: "01711000001" },
    { name: "Fatema Begum", email: "fatema.patient@shms.com", phone: "01711000002" },
    { name: "Rakib Ahmed", email: "rakib.patient@shms.com", phone: "01711000003" },
  ];
  const createdPatients = [];
  for (const p of patientSeed) {
    let user = await User.findOne({ email: p.email });
    if (!user) {
      user = await User.create({
        name: p.name,
        email: p.email,
        password: "Patient@123",
        phone: p.phone,
        role: "patient",
      });
      await Patient.create({ user: user._id });
      console.log(`Created patient -> email: ${p.email}  password: Patient@123`);
    }
    createdPatients.push(user);
  }

  if (createdPatients.length && createdDoctors.length) {
    const doc1 = createdDoctors[0];
    const doc2 = createdDoctors[1];
    const doc3 = createdDoctors[2];

    const findOrCreateAppt = async (patientId, doctorId, department, date, time, reason, status) => {
      let appt = await Appointment.findOne({ patient: patientId, doctor: doctorId, date, time });
      if (!appt) {
        appt = await Appointment.create({
          patient: patientId,
          doctor: doctorId,
          department,
          date,
          time,
          reason,
          status,
        });
      }
      return appt;
    };

    const completedAppt = await findOrCreateAppt(
      createdPatients[0]._id,
      doc1._id,
      doc1.department,
      "2026-08-01",
      "10:00",
      "Fever and body ache",
      "completed"
    );
    const existingRecord1 = await MedicalRecord.findOne({ appointment: completedAppt._id });
    if (!existingRecord1) {
      await MedicalRecord.create({
        patient: createdPatients[0]._id,
        doctor: doc1._id,
        appointment: completedAppt._id,
        diagnosis: "Viral fever",
        prescription: "Paracetamol 500mg, twice daily for 3 days; plenty of fluids",
        notes: "Advised rest and follow-up if fever persists beyond 3 days.",
        visitDate: new Date("2026-08-01"),
      });
    }
    const existingInvoice1 = await Invoice.findOne({ appointment: completedAppt._id });
    if (!existingInvoice1) {
      await Invoice.create({
        patient: createdPatients[0]._id,
        doctor: doc1._id,
        appointment: completedAppt._id,
        amount: doc1.consultationFee,
        status: "paid",
        description: "Consultation fee",
      });
    }

    const completedAppt2 = await findOrCreateAppt(
      createdPatients[0]._id,
      doc2._id,
      doc2.department,
      "2026-08-10",
      "11:30",
      "Chest discomfort during exercise",
      "completed"
    );
    const existingRecord2 = await MedicalRecord.findOne({ appointment: completedAppt2._id });
    if (!existingRecord2) {
      await MedicalRecord.create({
        patient: createdPatients[0]._id,
        doctor: doc2._id,
        appointment: completedAppt2._id,
        diagnosis: "Mild exertional angina, recommend further tests",
        prescription: "Aspirin 75mg daily; ECG and lipid profile advised",
        notes: "Referred for stress test. Avoid strenuous activity until cleared.",
        visitDate: new Date("2026-08-10"),
      });
    }
    const existingInvoice2 = await Invoice.findOne({ appointment: completedAppt2._id });
    if (!existingInvoice2) {
      await Invoice.create({
        patient: createdPatients[0]._id,
        doctor: doc2._id,
        appointment: completedAppt2._id,
        amount: doc2.consultationFee,
        status: "unpaid",
        description: "Consultation fee",
      });
    }

    await findOrCreateAppt(
      createdPatients[1]._id,
      doc3._id,
      doc3.department,
      "2026-09-05",
      "16:00",
      "Knee pain after a fall",
      "confirmed"
    );

    await findOrCreateAppt(
      createdPatients[2]._id,
      doc1._id,
      doc1.department,
      "2026-09-10",
      "09:30",
      "Routine health checkup",
      "pending"
    );

    console.log("Sample appointments, medical records, and invoices seeded.");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});