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
  DeleteAccount
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

// ADMIN ROUTES (Protected in real app, but leaving accessible for dashboard dev)
router.route("/all").get(getAllUsers);
router.route("/delete").delete(DeleteAccount);

export default router;