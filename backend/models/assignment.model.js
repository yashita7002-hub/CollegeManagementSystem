import mongoose from "mongoose";

const AssignmentSchema = new Schema({
    title:{
        type: String,
        required:true,
    },

    
    courseCode:{
   type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

    Deadline:{
        type:String,
        
    },

    professorId:{
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },


    Description:{
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

