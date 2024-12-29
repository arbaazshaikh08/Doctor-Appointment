import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  consultationFees: {
    type: Number,
    required: true,
  },
});

// Static method to adjust the Doctor earnings
doctorSchema.statics.adjustDoctorEarnings = async function (
  doctorId,
  earnings
) {
  // Find  doctor by ID
  const doctor = await this.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Ensure earnings is  valid number
  if (typeof earnings !== "number" || earnings <= 0) {
    throw new Error("Earnings must be a positive number");
  }

  // Add the earnings to  doctor wallet balance
  doctor.walletBalance += earnings;

  // Save the updated doctor document
  await doctor.save();
};
export const Doctor = mongoose.model("Doctor", doctorSchema);
