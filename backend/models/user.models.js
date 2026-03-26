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

  password:{
    type:String,
    
  },




}, {
  timestamps: true
});






export const User = mongoose.model("User", UserSchema);











