import mongoose, { Schema } from "mongoose";


const StudentSchema = new Schema({
userId:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
    unique:true,
},

fullName:{
    type: Schema.Types.ObjectId,
    ref: User,
    required:true,
},

department:{
    type:String,
    required:true,
},

department:{
    type:String,
    required:true,
},


qualification:{
    type:String,
}


}, {
  timestamps: true
});




export const Professor = mongoose.model("Professor", ProfessorSchema);











