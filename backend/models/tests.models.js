import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true
  },

  branch:{
    type:String,
    required:true,
  },

  year:{
    type:Number,
    required:true,
  },
 
  semester:{
     type:Number,
    required:true,

  },

  maxMarks: {
    type: Number,
    required: true
  },

  dateConducted: {
    timestamps
  }

}, { timestamps: true });

export const Test = mongoose.model("Test", testSchema);3