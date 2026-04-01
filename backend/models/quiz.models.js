import mongoose, { Schema } from "mongoose";
const questionSchema = new Schema({
    type: { 
        type: String, 
        enum: ['MCQ', 'WRITTEN'], 
        required: true
    },

    questionText: { 
        type: String, 
        required: true 
    },

    options: [{ 
        type: String,
        required: function () {
            return this.type === 'MCQ'; // ✅ Only required for MCQ
        }
    }],

    correctAnswer: { 
        type: String,
        required: function () {
            return this.type === 'MCQ'; // ✅ Only required for MCQ
        }
    },

    marksPerQuestion: { 
        type: Number, 
        default: 1 
    }
});


const quizSchema = new Schema({
    title: { 
        type: String,
        required: true 
    },

    courseId: { 
        type: Schema.Types.ObjectId,
        ref: "Course",
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

    professorId:{
        type: Schema.Types.ObjectId, 
        ref: 'Professor',
        required: true 
    },

    questions: [questionSchema],

    timeLimitMinutes: { 
        type: Number, 
        default: 30 
    }

}, { timestamps: true });