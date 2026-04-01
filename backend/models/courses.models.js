import mongoose,{Schema} from "mongoose";

const CoursesSchema = new Schema(
    {

    courseName:{
        type: String,
        required: true,
    },

    courseCode:{
        type:String,
        required:true,
        unique:true,
    },

     credits:{
        type:String,
        required:true,
      
    },

       


},{timestamps: true})




export const Course = mongoose.model("Course", CoursesSchema)





