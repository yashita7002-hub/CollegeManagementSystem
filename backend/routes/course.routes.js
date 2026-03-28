import { Router } from "express";
import {
    createCourse,
    getAllCourses,
    deleteCourse
} from "../controllers/courses.controller.js";


const router = Router();








router.post("/create", createCourse);
router.get("/all", getAllCourses);
router.delete("/delete/:courseCode", deleteCourse);


export default router;