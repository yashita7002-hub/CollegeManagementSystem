import { Router } from "express";
import {
    createCourse,
    getAllCourses,
    deleteCourse,
    AssignCourseToProfessors,
    AssignCourseToStudents,
    AssignedCourses,
    getcodeCourses
} from "../controllers/courses.controller.js";


const router = Router();








router.post("/create", createCourse);
router.get("/all", getAllCourses);
router.delete("/delete/:courseCode", deleteCourse);
router.post("/assign/professor",AssignCourseToProfessors)
router.post("/assign/student",AssignCourseToStudents)
router.post("/assignedCourses",AssignedCourses)
router.get("/courseCode",getcodeCourses)


export default router;