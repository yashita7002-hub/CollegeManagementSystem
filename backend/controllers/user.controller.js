


import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.models.js";
import { Student } from "../models/student.models.js";
import { Professor } from "../models/professors.models.js";
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


// ================= REGISTER USER (SET PASSWORD FLOW) =================
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

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    email,
    username,
    role,
    password: undefined,
    isVerified: false
  });

  // Role-based creation
  if (role === "student") {
    if (!year || !branch || !fullName) {
      throw new ApiError(400, "Year, branch, fullName required");
    }

    await Student.create({
      userId: user._id,
      fullName,
      year,
      branch
    });
  }

  if (role === "professor") {
    if (!department || !qualification || !fullName) {
      throw new ApiError(400, "Department, qualification required");
    }

    await Professor.create({
      userId: user._id,
      fullName,
      department,
      qualification
    });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const link = `${process.env.FRONTEND_URL}/set-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Set Your Password",
    html: `
      <h3>Hello ${username}</h3>
      <p>Your account has been created.</p>
      <p>Click below to set your password:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 15 minutes.</p>
    `
  });

  return res.status(201).json(
    new ApiResponse(200, {}, "User created. Set password link sent.")
  );
});


// ================= RESEND SET PASSWORD LINK =================
const resendSetPasswordLink = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User not found");

  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const link = `${process.env.FRONTEND_URL}/set-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "New Set Password Link",
    html: `<a href="${link}">Set Password</a>`
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "New link sent")
  );
});


// ================= SET PASSWORD =================
const setPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) throw new ApiError(400, "Password required");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Token expired or invalid");
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


// ================= LOGIN (STEP 1: SEND OTP) =================
export const loginUser = asyncHandler(async (req, res) => {
 
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    throw new ApiError(400, "Username, password, and role are required");
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) throw new ApiError(404, "User not found");

  // 2. NEW SECURITY CHECK: 
  if (user.role !== role) {
    throw new ApiError(403, `Access Denied. This account is registered as a ${user.role}, not a ${role}.`);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your Login OTP",
    html: `<h3>Your OTP is: ${otp}</h3>`
  });

  return res.status(200).json({ message: "OTP sent to email" });
});


// ================= VERIFY OTP (STEP 2: GRANT ACCESS) =================
export const verifyOtp = asyncHandler(async (req, res) => {

  const { username, otp } = req.body;
  const user = await User.findOne({ username });

  if (!user) throw new ApiError(404, "User not found");
  if (user.otp !== Number(otp)) throw new ApiError(401, "Invalid OTP");
  if (user.otpExpiry < Date.now()) throw new ApiError(401, "OTP expired");

  user.otp = undefined;
  user.otpExpiry = undefined;
  user.loginLogs.push(Date.now());
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "Login successful", user });
});

// ================= LOGOUT =================
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }
  });

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

  const resetLink = `${process.env.FRONTEND_URL}/set-password/${token}`;
 await sendEmail({
  to: user.email,
  subject: "Reset Your Password",
  html: `
    <h2>Hello ${user.fullName || user.username}</h2>
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



const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

// ================= UPDATE ACCOUNT DETAILS =================
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, fullName, email, role } = req.body;
    if (!username || !role) {
        throw new ApiError(400, "username and role are required fields");
    }
    // 1. You MUST find the User document first to get their actual _id!
    const userToUpdate = await User.findOne({ username: username });
    
    if (!userToUpdate) {
        throw new ApiError(404, "User not found");
    }
    // 2. Update their Email inside the User Collection (if provided)
    if (email) {
        userToUpdate.email = email;
        await userToUpdate.save({ validateBeforeSave: false });
    }
    let updatedProfile;
    // 3. Update the FullName inside the correct Role Collection
    // NOW we use `userId: userToUpdate._id` because that is exactly what your schema uses!
    if (role === "student") {
        updatedProfile = await Student.findOneAndUpdate(
            { userId: userToUpdate._id }, 
            { $set: { fullName: fullName } },
            { new: true }
        );
    } else if (role === "professor") {
        updatedProfile = await Professor.findOneAndUpdate(
            { userId: userToUpdate._id }, 
            { $set: { fullName: fullName } },
            { new: true }
        );
    }
    return res.status(200).json(
        new ApiResponse(200, updatedProfile, "Account details updated successfully")
    );
});





// ================= GET ALL USERS (ADMIN) =================
const getAllUsers = asyncHandler(async (req, res) => {

  const users = await User.find({}).select("-password"); // ✅ fetch all users

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});
// ================= DELETE ACCOUNT =================
const DeleteAccount = asyncHandler(async (req, res) => {

  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "Username is required to perform a deletion.");
  }

  // 1. Find the User first so we know what their Role and ID are
  const userToDelete = await User.findOne({ username: username });
  
  if (!userToDelete) {
     throw new ApiError(404, "User not found in the database.");
  }

  // 2. Delete them from their specific Role collection FIRST!
  if (userToDelete.role === "student") {
      await Student.findOneAndDelete({ userId: userToDelete._id });
  } else if (userToDelete.role === "professor") {
      await Professor.findOneAndDelete({ userId: userToDelete._id });
  }

  // 3. Finally, delete their core Authentication profile
  await User.findByIdAndDelete(userToDelete._id);

  return res.status(200).json(
      new ApiResponse(200, {}, `Account for ${username} has been completely deleted from all collections.`)
  );
});




// ================= EXPORTS =================
export {
  registerUser,
  setPassword,
  
  logoutUser,
  forgotPassword,
  refreshAccessToken,
  generateAccessAndRefreshTokens,
 

  getCurrentUser,
  changeCurrentPassword,
  getAllUsers,
  DeleteAccount,
};