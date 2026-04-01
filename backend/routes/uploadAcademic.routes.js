import { Router } from "express";
import {
  uploadCalendar,
  getCalendar,
  deleteCalendar
} from "../controllers/uploadAcademic.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

// Endpoint for uploading academic calendar
router.route("/upload").post( verifyJWT, upload.single("file"), uploadCalendar);

// Endpoint for retrieving all academic calendars
router.route("/all").get(getCalendar);

// Endpoint for deleting an academic calendar
router.route("/delete/:id").delete(verifyJWT, deleteCalendar);

export default router;
