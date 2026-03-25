import mongoose from "mongoose";

const StudentSchema = new Schema({

   Courses:{
    type:[CourseSchema],
   }


},{timestamps: true})




export const Students = mongoose.model("Students", StudentSchema)






  const CourseSchema = new mongoose.Schema({


   courseName:{
        type: String,
        required:true,
    },

    credits:{
        type:Number,
        required:true,
    },

   courseCode:{
    type:String,
    required:true,
   }




})
