import { Router } from "express";
import {
  AttendanceUpdater,
  getStudentAttendanceReport,
  getStudentsForAttendance,
  AttendanceBulkUpdater,
  getAttendanceRecords
} from "../controllers/attendance.controller.js";

const router = Router();

// Legacy routes (if they were used)
router.post("/update", AttendanceUpdater);
router.get("/report/:studentId/:courseCode", getStudentAttendanceReport);

// New Professor Attendance routes
router.get("/students", getStudentsForAttendance);
router.post("/upload-bulk", AttendanceBulkUpdater);
router.get("/records", getAttendanceRecords);

export default router;