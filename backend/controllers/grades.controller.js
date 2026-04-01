import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";     
import { Student } from "../models/student.models.js";        
import { Course } from "../models/courses.models.js";        
import { Grade } from "../models/grades.model.js";          
import { ApiError } from "../utils/ApiError.js";              
import { ApiResponse } from "../utils/ApiResponse.js";       

 const uploadGrade = asyncHandler(async (req, res) => { 
   
    const { 
        studentId, 
        courseCode, 
        professorId, 
        internalsObtained,  
        midSemObtained,      
        endSemObtained,     
        totalObtained 
    } = req.body;

    if(!studentId || !courseCode || !professorId) {
        throw new ApiError(400, "studentId, courseCode, and professorId are mandatory fields");
    }

    const studentExists = await Student.findById(studentId);
    if(!studentExists){
        throw new ApiError(404, "Student not found.");
    }

    const GradesUploaded = await Grade.findOneAndUpdate(
        { studentId: studentId, courseCode: courseCode },
        {
            $set: {
                studentId,
                courseCode,
                professorId,
                internals: { obtained: internalsObtained || 0, maxMarks: 20 },
                midSem: { obtained: midSemObtained || 0, maxMarks: 30 },
                endSem: { obtained: endSemObtained || 0, maxMarks: 50 },
                totalObtained: totalObtained || 0
            }
        },
        { new: true, upsert: true, runValidators: true } 
    );

    if (!GradesUploaded) {
        throw new ApiError(500, "Something went wrong while uploading the grades");
    }
    
    return res.status(201).json(
        new ApiResponse(201, GradesUploaded, "Grades were uploaded successfully")
    );
});

const getMyGrades = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
   
    // Find student profile
    const student = await Student.findOne({ userId });
    if (!student) {
        throw new ApiError(404, "Student profile not found.");
    }

    const studentGrades = await Grade.find({ studentId: student._id })
        .populate("courseCode", "courseName courseCode")
        .populate("professorId", "fullName");

    return res.status(200).json(
        new ApiResponse(200, studentGrades, "Grades retrieved successfully")
    );
});

export {
    uploadGrade,
    getMyGrades,
}