import { Doctor } from "../model/Doctor.model.js";
import { asyncHandler } from "../utils/Asynchandlar.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import mongoose from "mongoose";
// Create Doctor
const createDoctor = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      consultationFees,
      workingInHospital,
      licenseNumber,
      walletBalance,
      specialization,
    } = req.body;

    if (
      [
        name,
        consultationFees,
        workingInHospital,
        licenseNumber,
        walletBalance,
        specialization,
      ].some((field) => typeof field === "string" && field?.trim() === "")
    ) {
      throw new ApiError(400, "All field  are required");
    }
    const existedoctor = await Doctor.findOne({ licenseNumber });
    if (existedoctor) {
      throw new ApiError(409, "doctor alerady exitsts");
    }
    // create doctor
    const doctor = await Doctor.create({
      name,
      consultationFees,
      workingInHospital,
      licenseNumber,
      walletBalance,
      specialization,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, doctor, "Doctor created successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});

// Get Doctor Deatails
const getdoctorDetails = asyncHandler(async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.isValidObjectId(doctorId)) {
      throw new ApiError(400, "Invalid Doctor Id ");
    }
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      throw new ApiError(404, "Doctor not Found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, doctor, "Restaurent finded Successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(error || "Something Went Wrong");
  }
});

export { createDoctor, getdoctorDetails };
