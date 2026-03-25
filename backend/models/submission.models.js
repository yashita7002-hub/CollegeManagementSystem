import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  marksObtained: Number,

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export const Submission = mongoose.model("Submission", submissionSchema);