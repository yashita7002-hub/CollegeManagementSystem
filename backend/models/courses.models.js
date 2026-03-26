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

    department:{
        type:String,
        required:true,
    },

    professor:[{
        type:Schema.Types.ObjectId,
        ref:"Professor"
    }],

    students:[{
        type: Schema.Types.ObjectId,
        ref:"Student"
    }]
   


},{timestamps: true})




export const Course = mongoose.model("Course", CoursesSchema)





