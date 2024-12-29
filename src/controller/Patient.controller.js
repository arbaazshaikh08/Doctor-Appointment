import { Patient } from "../model/Patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/Asynchandlar.js";
import jwt from "jsonwebtoken";

// generate accessTokenAndRefereshTokens
const generateAccessAndRefereshTokens = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId);
    const accessToken = patient.generateAccessToken();
    const refreshToken = patient.generateRefreshToken();

    patient.refreshToken = refreshToken;
    await patient.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Refresh and Access token"
    );
  }
};
//Create Patient
const createPatient = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, password, walletBalance } = req.body;

    if (
      [name, email, phone, phone, password, walletBalance].some(
        (field) => typeof field === "string" && field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const existedpatient = await Patient.findOne({
      $or: [{ name }, { email }],
    });
    if (existedpatient) {
      throw new ApiError(409, "user with email or name alerady exitsts");
    }

    const newpatient = await Patient.create({
      name,
      email,
      phone,
      password,
      walletBalance,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newpatient, "Patient created Successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});
// Login Patient
const loginPatient = asyncHandler(async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name && !password) {
      throw new ApiError(400, "Name and password is required");
    }

    const patient = await Patient.findOne({
      $or: [{ name }, { password }],
    });
    if (!patient) {
      throw new ApiError(404, "patient does not exist");
    }

    const ispasswordValid = await patient.isPasswordCorrect(password);

    if (!ispasswordValid) {
      throw new ApiError(401, "Invalid patient cradentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      patient._id
    );

    const loggedIn = await Patient.findById(patient._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            patient: loggedIn,
            accessToken,
            refreshToken,
          },
          "patient login Successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});
// Logout Patient
const logoutPatient = asyncHandler(async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(
      req.patient._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponce(200, {}, "Hospital Closed"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});
// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(404, "Unouthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const patient = await Patient.findById(decodedToken?._id);

    if (!patient) {
      throw new ApiError(401, "invalid refreshToken ");
    }
    if (incomingRefreshToken !== patient?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessAndRefereshTokens(patient._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "AccessToken Refreshed"
        )
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});
// Get patient details by ID
const getPatientDetails = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      throw new ApiError(404, "Patient not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, patient, "Patient details fetched successfully.")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
});

export {
  createPatient,
  loginPatient,
  logoutPatient,
  getPatientDetails,
  refreshAccessToken,
};
