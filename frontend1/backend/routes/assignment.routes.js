import { Router } from "express";
import {
   createAssignment,
   getAssignments,
   getAssignmentById,
   deleteAssignment,
   getStudentAssignments
} from "../controllers/assignment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
const router = Router();








router.post(
  "/create",
  verifyJWT,
  upload.single("file"), 
  createAssignment
);

router.get(
  "/assignments",
  verifyJWT,
  getAssignments
);

router.get(
  "/:id",
  verifyJWT,
  getAssignmentById
);

router.delete(
  "/:id",
  verifyJWT,
  deleteAssignment
);

router.get(
  "/student/assignments",
  verifyJWT,
  getStudentAssignments
);

export default router;