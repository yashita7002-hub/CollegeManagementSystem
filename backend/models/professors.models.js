import mongoose, { Schema } from "mongoose";
import { User } from "../models/user.models.js";

const ProfessorSchema = new Schema({
userId:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
    unique:true,
},

/*fullName:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
},*/

department:{
    type:String,
    required:true,
},



qualification:{
    type:String,
}


}, {
  timestamps: true
});

/*ProfessorSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

ProfessorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


ProfessorSchema.methods.generateAccessToken = function () {
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



ProfessorSchema.methods.generateRefreshToken = function () {
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





export const Professor = mongoose.model("Professor", ProfessorSchema);











