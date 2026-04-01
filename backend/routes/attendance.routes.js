import { Router } from "express";
import {
  AttendanceUpdater,
  getStudentAttendanceReport,
  getStudentsForAttendance,
  AttendanceBulkUpdater,
  getAttendanceRecords,
  getStudentAttendanceSummary
} from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

// Legacy routes (if they were used)
router.post("/update", AttendanceUpdater);
router.get("/report/:studentId/:courseCode", getStudentAttendanceReport);

// New Professor Attendance routes
router.get("/students", getStudentsForAttendance);
router.post("/upload-bulk", AttendanceBulkUpdater);
router.get("/records", getAttendanceRecords);
router.get("/student-summary", verifyJWT, getStudentAttendanceSummary);

export default router;