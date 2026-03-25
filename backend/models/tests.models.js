import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  topic: String,

  description: {
    type: String,
    required: true,
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

  fileUrl: String, // PDF / image

  totalMarks: {
    type: Number,
    required: true
  },

  deadline: {
    type: Date,
    required: true
  }

}, { timestamps: true });

export const Test = mongoose.model("Test", testSchema);3