import mongoose from "mongoose"


const AttendanceSchema = new Schema({
  studentId:{
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  courseCode:{
   type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  professorId:{
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  date:{
    type: Data,
    required: true,
  },

  status:{
    type:String,
    enum: ["present", "absent"],
    required: true,
  },





}, {timestamps:true})

AttendanceSchema.index(
    {student: 1, course: 1, date: 1},
    {unique: true},
);

export const Attendance = mongoose.model("Attendance", AttendanceSchema)