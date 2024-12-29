import { asyncHandler } from "../utils/Asynchandlar.js";
import { ApiError } from "../utils/ApiError.js";
import { Appointment } from "../model/appointment.model.js";
import { Doctor } from "../model/Doctor.model.js";
import { Patient } from "../model/Patient.model.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import mongoose from "mongoose";

// Create a new appointment
const createAppointment = asyncHandler(async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      appointmentDate,
      MedicalBill,
      transactionType,
      discountPercentage,
    } = req.body;

    // Validate required fields
    if (
      [doctorId, patientId, MedicalBill, appointmentDate, transactionType].some(
        (field) => typeof field === "string" && field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required.");
    }

    // Check if it's the patient's first Appointement with  doctor
    const isFirstConsult = await Appointment.isFirstConsultation(
      doctorId,
      patientId
    );
    let discountAmount = 0;

    // Apply discount the first Appointement
    if (isFirstConsult) {
      discountAmount = (MedicalBill * discountPercentage) / 100;
    }

    // Final amount after discount
    const finalAmount = MedicalBill - discountAmount;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ApiError(404, "Patient not found.");
    }

    // Deduct the discount amount from the patient wallet
    if (isFirstConsult && discountAmount > 0) {
      if (patient.walletBalance < finalAmount) {
        return res
          .status(400)
          .json({ message: "Insufficient balance in patient's wallet" });
      }
    }
    patient.walletBalance -= finalAmount;

    // Save the updated Patient wallet balance
    await patient.save();

    // Create the appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      appointmentDate,
      MedicalBill,
      discountApplied: discountAmount > 0,
      totalAmount: finalAmount,
      discountAmount,
      discountPercentage,
      isFirstTime: isFirstConsult,
      transactionType,
      paymentStatus: "pending",
    });

    // Add the payment amount to doctor wallet
    await Doctor.adjustDoctorEarnings(doctorId, finalAmount);

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment booked  successfully.")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});

// get appointment details
const getAppointmentDetails = asyncHandler(async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!mongoose.isValidObjectId(appointmentId)) {
      throw new ApiError(400, "Invalid appointment ID");
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Send success response
    return res.status(200).json(new ApiResponse(200, appointment));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});

export { createAppointment, getAppointmentDetails };
