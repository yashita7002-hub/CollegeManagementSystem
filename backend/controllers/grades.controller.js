import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";     
import { Student } from "../models/student.models.js";        
import { Course } from "../models/courses.models.js";        
import { Grade } from "../models/grades.model.js";          
import { Professor } from "../models/professors.models.js";
import { ApiError } from "../utils/ApiError.js";              
import { ApiResponse } from "../utils/ApiResponse.js";       

 const uploadGrade = asyncHandler(async (req, res) => { 
   
    const { 
        studentId, 
        courseCode, 
        internalsObtained,  
        midSemObtained,      
        endSemObtained,     
        totalObtained 
    } = req.body;

    if(!studentId || !courseCode) {
        throw new ApiError(400, "studentId and courseCode are mandatory fields");
    }

    const studentExists = await Student.findById(studentId);
    if(!studentExists){
        throw new ApiError(404, "Student not found.");
    }

    const courseRecord = await Course.findOne({ courseCode });
    if (!courseRecord) {
        throw new ApiError(404, "Course not found");
    }

    const professor = await Professor.findOne({ userId: req.user._id });
    if (!professor) {
        throw new ApiError(404, "Professor profile not found");
    }

    const GradesUploaded = await Grade.findOneAndUpdate(
        { studentId: studentId, courseCode: courseRecord._id },
        {
            $set: {
                studentId,
                courseCode: courseRecord._id,
                professorId: professor._id,
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

const getCourseGrades = asyncHandler(async (req, res) => {
    const { courseCode } = req.params;
    
    // Find course _id from courseCode string
    const course = await Course.findOne({ courseCode });
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const grades = await Grade.find({ courseCode: course._id });

    return res.status(200).json(
        new ApiResponse(200, grades, "Course grades retrieved successfully")
    );
});

export {
    uploadGrade,
    getMyGrades,
    getCourseGrades,
}