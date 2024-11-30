import express from "express";
import {
  markAttendanceForEmployees,
  getAttendanceDataForEmployees,
  getMonthlyAttendance

} from "../controllers/attendanceController.js";

const router = express.Router();

// Route to mark attendance
router.post("/mark", getAttendanceDataForEmployees);

router.post("/markAttendence",markAttendanceForEmployees)

router.get("/monthly", getMonthlyAttendance);

// Route to get attendance by date or range
// router.get("/", getAttendanceByDate);

// // Route to get monthly attendance summary
// router.get("/summary", getMonthlyAttendanceSummary);

// // Route to delete attendance by date
// router.delete("/", deleteAttendance);


// router.get("/view", viewAttendance);






export default router;
