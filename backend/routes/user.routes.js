import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyOtp,
  registerUser,
  forgotPassword,
  setPassword,
  getAllUsers,
  DeleteAccount,
  getCurrentUser,
  getProfessorDashboardStats
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgotPassword").post(forgotPassword);
router.route("/set-password/:token").patch(setPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-otp").post(verifyOtp);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

// ADMIN ROUTES 
router.route("/all").get(getAllUsers);
router.route("/delete").delete(DeleteAccount);
router.route("/professor/dashboard-stats").get(verifyJWT, getProfessorDashboardStats);

export default router;