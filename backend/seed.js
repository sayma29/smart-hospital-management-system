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

const maleFirstNames = ["Kamal", "Mahbub", "Arif", "Rezaul", "Shahriar", "Imran", "Faisal", "Nasir", "Tanvir", "Zahid", "Rafiq", "Delwar"];
const femaleFirstNames = ["Farhana", "Nusrat", "Sharmin", "Fatema", "Rummana", "Shirin", "Tania", "Nasrin", "Afroza", "Kaniz", "Lubna", "Rehana"];
const lastNames = ["Hossain", "Islam", "Rahman", "Chowdhury", "Ahmed", "Khan", "Uddin", "Akter", "Karim", "Hasan", "Ali", "Begum"];

const departmentConfig = [
  {
    name: "Cardiology",
    feeRange: [900, 1800],
    qualifications: "MBBS, MD (Cardiology)",
    specializations: [
      "Interventional Cardiology", "Heart Failure Management", "Electrophysiology",
      "Preventive Cardiology", "Pediatric Cardiology", "Cardiac Surgery",
      "Vascular Medicine", "Echocardiography", "Cardiac Rehabilitation", "Nuclear Cardiology",
    ],
  },
  {
    name: "General Medicine",
    feeRange: [400, 900],
    qualifications: "MBBS, FCPS (Medicine)",
    specializations: [
      "Internal Medicine", "Diabetes Management", "Infectious Disease",
      "Geriatric Medicine", "Family Medicine", "Preventive Health",
      "Respiratory Medicine", "Gastroenterology", "Endocrinology", "General Practice",
    ],
  },
  {
    name: "Orthopedics",
    feeRange: [700, 1400],
    qualifications: "MBBS, MS (Orthopedics)",
    specializations: [
      "Joint Replacement Surgery", "Sports Medicine", "Spine Surgery",
      "Pediatric Orthopedics", "Trauma Surgery", "Hand Surgery",
      "Foot & Ankle Surgery", "Arthroscopy", "Orthopedic Oncology", "Bone Density Care",
    ],
  },
  {
    name: "Pediatrics",
    feeRange: [500, 1000],
    qualifications: "MBBS, DCH",
    specializations: [
      "Child Healthcare", "Neonatal Care", "Pediatric Nutrition",
      "Childhood Immunization", "Pediatric Pulmonology", "Pediatric Neurology",
      "Adolescent Medicine", "Pediatric Endocrinology", "Developmental Pediatrics", "General Pediatrics",
    ],
  },
  {
    name: "Dermatology",
    feeRange: [600, 1200],
    qualifications: "MBBS, DDV",
    specializations: [
      "Clinical Dermatology", "Cosmetic Dermatology", "Pediatric Dermatology",
      "Hair & Scalp Treatment", "Skin Cancer Screening", "Laser Therapy",
      "Acne Treatment", "Allergy & Eczema Care", "Dermatopathology", "Nail Disorders",
    ],
  },
  {
    name: "Neurology",
    feeRange: [1000, 2000],
    qualifications: "MBBS, MD (Neurology)",
    specializations: [
      "Stroke & Epilepsy Care", "Movement Disorders", "Headache Medicine",
      "Neuromuscular Disorders", "Pediatric Neurology", "Sleep Medicine",
      "Cognitive Neurology", "Neuro-oncology", "Multiple Sclerosis Care", "Neurophysiology",
    ],
  },
];

const leadDoctors = {
  "General Medicine": { name: "Dr. Farhana Islam", email: "doctor@shms.com", photoIndex: 44, gender: "women" },
  "Cardiology": { name: "Dr. Kamal Hossain", email: "kamal.cardiology@shms.com", photoIndex: 12, gender: "men" },
  "Orthopedics": { name: "Dr. Nusrat Jahan", email: "nusrat.ortho@shms.com", photoIndex: 23, gender: "women" },
  "Pediatrics": { name: "Dr. Arif Chowdhury", email: "arif.pediatrics@shms.com", photoIndex: 31, gender: "men" },
  "Dermatology": { name: "Dr. Sharmin Akter", email: "sharmin.derma@shms.com", photoIndex: 55, gender: "women" },
  "Neurology": { name: "Dr. Mahbub Rahman", email: "mahbub.neuro@shms.com", photoIndex: 8, gender: "men" },
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const randomAvailability = () => {
  const shuffled = [...days].sort(() => 0.5 - Math.random());
  const count = 2 + Math.floor(Math.random() * 2);
  return shuffled.slice(0, count).map((day) => ({
    day,
    startTime: Math.random() > 0.5 ? "09:00" : "14:00",
    endTime: Math.random() > 0.5 ? "13:00" : "18:00",
  }));
};

const seed = async () => {
  await connectDB();

  await upsertUser({ name: "System Admin", email: "admin@shms.com", password: "Admin@123", role: "admin" });
  await upsertUser({ name: "Front Desk", email: "reception@shms.com", password: "Reception@123", role: "receptionist" });

  for (const dept of departmentConfig) {
    const exists = await Department.findOne({ name: dept.name });
    if (!exists) await Department.create({ name: dept.name });
  }
  console.log("Departments seeded.");

  const createdDoctors = [];
  let photoCounter = 1;

  for (const dept of departmentConfig) {
    const lead = leadDoctors[dept.name];
    let leadUser = await User.findOne({ email: lead.email });
    if (!leadUser) {
      leadUser = await User.create({ name: lead.name, email: lead.email, password: "Doctor@123", role: "doctor" });
      console.log(`Created doctor -> email: ${lead.email}  password: Doctor@123`);
    }
    let leadDoctor = await Doctor.findOne({ user: leadUser._id });
    if (!leadDoctor) {
      leadDoctor = await Doctor.create({
        user: leadUser._id,
        department: dept.name,
        specialization: dept.specializations[0],
        qualifications: dept.qualifications,
        consultationFee: dept.feeRange[1],
        photoUrl: `https://randomuser.me/api/portraits/${lead.gender}/${lead.photoIndex}.jpg`,
        availability: [
          { day: "Sunday", startTime: "09:00", endTime: "14:00" },
          { day: "Tuesday", startTime: "09:00", endTime: "14:00" },
          { day: "Thursday", startTime: "09:00", endTime: "14:00" },
        ],
      });
    } else if (!leadDoctor.photoUrl) {
      leadDoctor.photoUrl = `https://randomuser.me/api/portraits/${lead.gender}/${lead.photoIndex}.jpg`;
      await leadDoctor.save();
    }
    createdDoctors.push(leadDoctor);

    for (let i = 1; i < 10; i++) {
      const isMale = i % 2 === 0;
      const firstName = isMale
        ? maleFirstNames[(photoCounter + i) % maleFirstNames.length]
        : femaleFirstNames[(photoCounter + i) % femaleFirstNames.length];
      const lastName = lastNames[(photoCounter + i * 3) % lastNames.length];
      const fullName = `Dr. ${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}.${dept.name.toLowerCase().replace(/\s+/g, "")}@shms.com`;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name: fullName, email, password: "Doctor@123", role: "doctor" });
      }
      let doctor = await Doctor.findOne({ user: user._id });
      const gender = isMale ? "men" : "women";
      const photoUrl = `https://randomuser.me/api/portraits/${gender}/${photoCounter % 95}.jpg`;
      photoCounter++;

      if (!doctor) {
        doctor = await Doctor.create({
          user: user._id,
          department: dept.name,
          specialization: dept.specializations[i % dept.specializations.length],
          qualifications: dept.qualifications,
          consultationFee: dept.feeRange[0] + Math.floor(Math.random() * (dept.feeRange[1] - dept.feeRange[0])),
          photoUrl,
          availability: randomAvailability(),
        });
      } else if (!doctor.photoUrl) {
        doctor.photoUrl = photoUrl;
        await doctor.save();
      }
      createdDoctors.push(doctor);
    }
  }
  console.log(`Doctors seeded: ${createdDoctors.length} total across ${departmentConfig.length} departments.`);

  const patientSeed = [
    { name: "Karim Hossain", email: "karim.patient@shms.com", phone: "01711000001" },
    { name: "Fatema Begum", email: "fatema.patient@shms.com", phone: "01711000002" },
    { name: "Rakib Ahmed", email: "rakib.patient@shms.com", phone: "01711000003" },
    { name: "Mim Akter", email: "mim.patient@shms.com", phone: "01711000004" },
    { name: "Sabbir Khan", email: "sabbir.patient@shms.com", phone: "01711000005" },
  ];
  const createdPatients = [];
  for (const p of patientSeed) {
    let user = await User.findOne({ email: p.email });
    if (!user) {
      user = await User.create({ name: p.name, email: p.email, password: "Patient@123", phone: p.phone, role: "patient" });
      await Patient.create({ user: user._id });
      console.log(`Created patient -> email: ${p.email}  password: Patient@123`);
    }
    createdPatients.push(user);
  }

  if (createdPatients.length && createdDoctors.length) {
    const findOrCreateAppt = async (patientId, doctorId, department, date, time, reason, status) => {
      let appt = await Appointment.findOne({ patient: patientId, doctor: doctorId, date, time });
      if (!appt) {
        appt = await Appointment.create({ patient: patientId, doctor: doctorId, department, date, time, reason, status });
      }
      return appt;
    };

    const ensureRecordAndInvoice = async (patient, doctor, appt, diagnosis, prescription, notes, visitDate, invoiceStatus) => {
      const existingRecord = await MedicalRecord.findOne({ appointment: appt._id });
      if (!existingRecord) {
        await MedicalRecord.create({
          patient, doctor: doctor._id, appointment: appt._id, diagnosis, prescription, notes,
          visitDate: new Date(visitDate),
        });
      }
      const existingInvoice = await Invoice.findOne({ appointment: appt._id });
      if (!existingInvoice) {
        await Invoice.create({
          patient, doctor: doctor._id, appointment: appt._id, amount: doctor.consultationFee,
          status: invoiceStatus, description: "Consultation fee",
        });
      }
    };

    const doc1 = createdDoctors[0];
    const doc2 = createdDoctors[10];
    const doc3 = createdDoctors[20];
    const doc4 = createdDoctors[30];

    const a1 = await findOrCreateAppt(createdPatients[0]._id, doc1._id, doc1.department, "2026-08-01", "10:00", "Fever and body ache", "completed");
    await ensureRecordAndInvoice(createdPatients[0]._id, doc1, a1, "Viral fever", "Paracetamol 500mg, twice daily for 3 days", "Advised rest and fluids.", "2026-08-01", "paid");

    const a2 = await findOrCreateAppt(createdPatients[0]._id, doc2._id, doc2.department, "2026-08-10", "11:30", "Chest discomfort during exercise", "completed");
    await ensureRecordAndInvoice(createdPatients[0]._id, doc2, a2, "Mild exertional angina", "Aspirin 75mg daily; ECG advised", "Referred for stress test.", "2026-08-10", "unpaid");

    const a3 = await findOrCreateAppt(createdPatients[1]._id, doc3._id, doc3.department, "2026-07-15", "09:00", "Knee pain after a fall", "completed");
    await ensureRecordAndInvoice(createdPatients[1]._id, doc3, a3, "Mild ligament sprain", "Ice application, rest for 1 week, ibuprofen as needed", "Follow-up in 2 weeks if pain persists.", "2026-07-15", "paid");

    const a4 = await findOrCreateAppt(createdPatients[2]._id, doc4._id, doc4.department, "2026-08-20", "15:00", "Routine child checkup", "completed");
    await ensureRecordAndInvoice(createdPatients[2]._id, doc4, a4, "Healthy growth, no concerns", "Continue current diet, vitamin D supplement", "Next checkup in 6 months.", "2026-08-20", "paid");

    await findOrCreateAppt(createdPatients[3]._id, doc1._id, doc1.department, "2026-09-05", "16:00", "General checkup", "confirmed");
    await findOrCreateAppt(createdPatients[4]._id, doc2._id, doc2.department, "2026-09-10", "09:30", "Follow-up consultation", "pending");
    await findOrCreateAppt(createdPatients[1]._id, doc1._id, doc1.department, "2026-09-12", "10:00", "Skin rash", "pending");

    console.log("Sample appointments, medical records, and invoices seeded.");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});