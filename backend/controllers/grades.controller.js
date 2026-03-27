import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";     
import { Student } from "../models/student.models.js";        
import { Professor } from "../models/professors.models.js";   
import { Course } from "../models/courses.models.js";        
import { Grade } from "../models/grades.models.js";          
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

    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }

    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }

  
    const GradesUploaded = await Grade.findOneAndUpdate(
        { studentId: studentId, courseCode: courseCode }, // Find the student's existing ledger
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
    // Assuming the student's ID comes from your authentication middleware (req.user)
    const studentId = req.user._id; 
   
    const studentGrades = await Grade.find({ studentId: studentId });

    if (!studentGrades || studentGrades.length === 0) {
        throw new ApiError(404, "No grades found for this student.");
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, studentGrades, "Grades retrieved successfully")
    );
});









export {
    uploadGrade,
    getMyGrades,
}