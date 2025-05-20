import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// imported router
import PatientRouter from "./router/Patient.route.js";
import DoctorRouter from "./router/Doctor.route.js";
import AppointmentRouter from "./router/Appointment.route.js";

// handling routes
app.use("/api/v1/patient", PatientRouter);
app.use("/api/v1/doctor", DoctorRouter);
app.use("/api/v1/Appointment", AppointmentRouter);

export { app };
