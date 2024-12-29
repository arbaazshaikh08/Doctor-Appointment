import { Router } from "express";
import {
  createDoctor,
  getdoctorDetails,
} from "../controller/Doctor.controller.js";

import { verifyJWT } from "../middlerweres/auth.middlewere.js";

const router = Router();

router.route("/create-doctor").post(verifyJWT, createDoctor);
router.route("/doctor-Deatail/:doctorId").get(verifyJWT, getdoctorDetails);

export default router;
