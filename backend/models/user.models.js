import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },

  fullName: {
    type: String,
    index: true,
    trim: true,
  },

  
  password: {
    type: String,
    required:true,
  },

  role: {
    type: String,
    required: true,
    enum: ["student", "professor", "admin"],
  },

  

  refreshToken: {
    type: String,
  },


  passwordResetToken: {
    type: String,
  },

  passwordResetExpiry: {
    type: Date,
  },




}, {
  timestamps: true
});




UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});



UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};



UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};



UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


export const User = mongoose.model("User", UserSchema);











