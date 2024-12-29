import { Router } from "express";
import {
  createAppointment,
  getAppointmentDetails,
} from "../controller/Appointment.controller.js";
import { verifyJWT } from "../middlerweres/auth.middlewere.js";

const router = Router();

router.route("/create-appointment").post(verifyJWT, createAppointment);

router
  .route("/appointment-Deatail/:appointmentId")
  .get(verifyJWT, getAppointmentDetails);

export default router;
