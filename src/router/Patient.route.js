import { Router } from "express";
import {
  createPatient,
  getPatientDetails,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
} from "../controller/Patient.controller.js";
import { verifyJWT } from "../middlerweres/auth.middlewere.js";

const router = Router();

router.route("/create-patient").post(createPatient);
router.route("/login-patient").post(loginPatient);
router.route("/refresh-AccessToken").post(refreshAccessToken);
router.route("/get-patient/:patientId").get(verifyJWT, getPatientDetails);
router.route("/logout-patient").post(verifyJWT, logoutPatient);

export default router;
