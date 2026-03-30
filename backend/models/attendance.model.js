import mongoose, { Schema } from "mongoose"


const AttendanceSchema = new Schema({
  studentId:{
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  courseCode:{
   type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },

  professorId:{
    type: Schema.Types.ObjectId,
    ref: "Professor",
    required: true,
  },

  date:{
    type: Date,
    required: true,
  },

  status:{
    type:String,
    enum: ["present", "absent"],
    required: true,
  },





}, {timestamps:true})

AttendanceSchema.index(
    {studentId: 1, courseCode: 1, date: 1},
    {unique: true},
);

export const Attendance = mongoose.model("Attendance", AttendanceSchema)