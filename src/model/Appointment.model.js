import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },

    MedicalBill: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    isFirstTime: {
      type: Boolean,
      default: false,
    },
    discountApplied: {
      type: Boolean,
      default: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
appointmentSchema.statics.isFirstConsultation = function (doctorId, patientId) {
  // Validate the ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(doctorId) ||
    !mongoose.Types.ObjectId.isValid(patientId)
  ) {
    return Promise.reject(new Error("Invalid doctor or patient ID"));
  }

  // Check if any existing appointments exist between the doctor and patient
  return this.find({ doctor: doctorId, patient: patientId })
    .then((existingAppointments) => {
      // Return true if no previous appointments exist (first consultation)
      return existingAppointments.length === 0;
    })
    .catch((error) => {
      return Promise.reject(
        new Error(error, "Error checking first consultation status")
      );
    });
};

export const Appointment = mongoose.model("Appointment", appointmentSchema);
