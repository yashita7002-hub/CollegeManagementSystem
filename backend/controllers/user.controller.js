import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.models.js";
import { Student } from "../models/student.models.js";
import { Professor } from "../models/professors.models.js";
import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ================= TOKEN GENERATION =================
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};


// ================= REGISTER USER =================
const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    role,
    year,
    branch,
    department,
    qualification
  } = req.body;

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Generate random password
  const randomPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // Create user
  const user = await User.create({
   
    email,
    username,
    role,
    password: hashedPassword,
    isVerified: true // user can login immediately
  });

  // Role-based creation
  if (role === "student") {
    if (!year || !branch || !fullName) {
      throw new ApiError(400, "Year, branch, and fullName required for student");
    }
    await Student.create({
      userId: user._id,
      fullName,
      year,
      branch
    });
  }

  if (role === "professor") {
    if (!department || !qualification ||!fullName) {
      throw new ApiError(400, "Department, qualification and fullName required");
    }
    await Professor.create({
      userId: user._id,
      fullName,
      department,
      qualification
    });
  }

  // Send email with login credentials
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  await sendEmail({
    to: user.email,
    subject: "Your Account Has Been Created",
    html: `
      <h3>Hello </h3>
      <p>Your account has been created by admin.</p>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Password:</strong> ${randomPassword}</p>
      <p>Login here: <a href="${loginLink}">${loginLink}</a></p>
    `
  });

  const createdUser = await User.findById(user._id).select("-password");

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User created & email sent with credentials")
  );
});



// ================= SET PASSWORD =================
const setPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.password = password;
  user.isVerified = true;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password set successfully")
  );
});


// ================= LOGIN =================
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password required");
  }

  const user = await User.findOne({ username }).select("+password");;

  if (!user) {
    throw new ApiError(404, "User not found");
  }



  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});


// ================= LOGOUT =================
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});


// ================= FORGOT PASSWORD =================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink = `http://localhost:3000/api/v1/users/set-password/${token}`;
 await sendEmail({
  to: user.email,
  subject: "Reset Your Password",
  html: `
    <h2>Hello ${user.fullName}</h2>
    <p>We received a request to reset your password. Click the link below:</p>
    <a href="${resetLink}" target="_blank">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `
});

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset link sent")
  );
});


// ================= REFRESH TOKEN =================
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Token refreshed"
        )
      );

  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});


// ================= EXPORTS =================
export {
  registerUser,
  setPassword,
  loginUser,
  logoutUser,
  forgotPassword,
  refreshAccessToken,
  generateAccessAndRefreshTokens
};