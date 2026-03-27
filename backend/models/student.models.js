import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const StudentSchema = new Schema({
userId:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
    unique:true,
},

fullName:{
    type: String,
    required:true,
},

year:{
    type:Number,
    required:true,
},

branch:{
    type:String,
    required:true,
},

enrolledCourses: [{ 
    type: String, 
    ref: 'Course',
  }],


}, {
  timestamps: true
});


/*StudentSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

StudentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


StudentSchema.methods.generateAccessToken = function () {
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



StudentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};*/



export const Student = mongoose.model("Student", StudentSchema);











