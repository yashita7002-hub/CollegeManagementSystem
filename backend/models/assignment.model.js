import mongoose from "mongoose";

const AssignmentSchema = new Schema({
    title:{
        type: String,
        required:true,
    },

    CourseName:{
        type:String,
        required: true,
    },

    Deadline:{
        type:String,
        
    },

    textForm:{
        type:String,
        required:true,
    },

    imageForm:{
        type:String,
    },
},{
    timestamps: true,
})

export const Assignment = mongoose.model("Assignment", AssignmentSchema)

