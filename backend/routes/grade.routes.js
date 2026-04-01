import { Router } from "express";
import {
    uploadGrade,
    getMyGrades,
    getCourseGrades
} from "../controllers/grades.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.post(
    "/upload",
    verifyJWT,
    uploadGrade
);

router.get(
    "/my-grades",
    verifyJWT,
    getMyGrades
);

router.get(
    "/course/:courseCode",
    verifyJWT,
    getCourseGrades
);

export default router;
