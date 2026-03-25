import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const StudentSchema = new Schema({
userId:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
    unique:true,
},

fullName:{
    type: Schema.Types.ObjectId,
    ref: User,
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


}, {
  timestamps: true
});




export const Student = mongoose.model("Student", StudentSchema);











