import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  courseCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true
  },

    internals: {
     maxMarks: { 
      type: Number, default: 20 },
     obtained: { type: Number, default: 0 }
  },
  midSem: {
     maxMarks: { type: Number, default: 30 },
     obtained: { type: Number, default: 0 }
  },
  endSem: {
     maxMarks: { type: Number, default: 50 },
     obtained: { type: Number, default: 0 }
  },
  totalObtained: { type: Number, default: 0 }
}

, { timestamps: true });

export const Grade = mongoose.model("Grade", gradeSchema);