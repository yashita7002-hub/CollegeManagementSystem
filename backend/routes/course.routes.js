import { Router } from "express";
import {
    createCourse,
    

} from "../controllers/courses.controller.js";


const router = Router();








router.post("/create", createCourse);



export default router;