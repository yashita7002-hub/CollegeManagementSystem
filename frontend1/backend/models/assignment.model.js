import mongoose from "mongoose";
import { Schema } from "mongoose";

const AssignmentSchema = new Schema({
    title:{
        type: String,
        required:true,
    },

    courseCode:{
        type: String,
        required: true,
        index: true,
    },
    
    branch: {
        type: String,
    },

    deadline:{
        type:String,
        
    },

    professorId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    description:{
        type:String,
        required:true,
    },

    mediaUrl:{
        type:String,
    },
},{
    timestamps: true,
})

export const Assignment = mongoose.model("Assignment", AssignmentSchema)
