import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true
  },


  description:{
    type:String,
  },

  submissionUrl: {
    type: String,
    required: true
  },

  feedback:{
    type:String,
  },

  marksObtained: Number,

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });



export const Submission = mongoose.model("Submission", submissionSchema);