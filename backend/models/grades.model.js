import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true
  },

  grade: {
    type: String,
    required: true
  }

}, { timestamps: true });

export const Grade = mongoose.model("Grade", gradeSchema);