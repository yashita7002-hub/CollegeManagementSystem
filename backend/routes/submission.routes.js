import { Router } from "express";
import {
    submitAssignment,
    evaluateAssignment,
    getSubmissionsByAssignment,
    getStudentSubmissionForAssignment
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
    "/submit",
    verifyJWT,
    upload.single("submissionFile"),
    submitAssignment
);

router.get(
    "/assignment/:assignmentId",
    verifyJWT,
    getSubmissionsByAssignment
);

router.get(
    "/student/my-submission/:assignmentId",
    verifyJWT,
    getStudentSubmissionForAssignment
);

router.patch(
    "/evaluate/:submissionId",
    verifyJWT,
    evaluateAssignment
);

export default router;
