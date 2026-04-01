import { Router } from "express";
import {
    createCourse,
    getAllCourses,
    deleteCourse,
    AssignCourseToProfessors,
    AssignCourseToStudents,
    AssignedCourses,
    getcodeCourses,
    getMyAssignedCourses
} from "../controllers/courses.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.post("/create", createCourse);
router.get("/all", getAllCourses);
router.delete("/delete/:courseCode", deleteCourse);
router.post("/assign/professor",AssignCourseToProfessors)
router.post("/assign/student",AssignCourseToStudents)
router.post("/assignedCourses",AssignedCourses)
router.get("/courseCode",getcodeCourses)
router.get("/professor/my-courses", verifyJWT, getMyAssignedCourses)

export default router;