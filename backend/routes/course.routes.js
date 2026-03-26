import { Router } from "express";
import {
    createCourse,
    assignCoursesByBranchAndYear,
    assignCoursesToProfessor ,

} from "../controllers/courses.controller.js";


const router = Router();








router.post("/create", createCourse);
router.post("/assign/students", assignCoursesByBranchAndYear);
router.post("/assign/professor/:professorId", assignCoursesToProfessor);


export default router;