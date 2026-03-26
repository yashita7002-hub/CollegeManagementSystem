import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Student } from "../models/student.models.js";
import { Professor } from "../models/professors.models.js";
import { Course } from "../models/courses.models.js";     
import { Attendance } from "../models/attendance.models.js";
import { ApiError } from "../utils/ApiError.js";          
import { ApiResponse } from "../utils/ApiResponse.js";   





export const AttendanceUpdater = asyncHandler(async(req, res) => {
   
    const { studentId, professorId, courseCode, status } = req.body;

    if (!studentId || !professorId || !courseCode) {
        throw new ApiError(400, "studentId, professorId, and courseCode fields are required");
    }


    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }


    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
        throw new ApiError(404, "Student not found.");
    }
      
 
    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }
    

    const attendanceUpdate = await Attendance.create({
        studentId,
        professorId,
        courseCode,
        status: status || "Present" // Providing a default status just in case
    });


   
    if (!attendanceUpdate) {
        throw new ApiError(500, "Something went wrong while updating the attendance");
    }
    return res.status(201).json(
        new ApiResponse(201, attendanceUpdate, "Attendance updated successfully")
    );
});



export const getStudentAttendanceReport = asyncHandler(async (req, res) => {
    const { studentId, courseCode } = req.params;
    
    // We must convert the string studentId back into a MongoDB ObjectId for aggregation
    const mongoose = require("mongoose");
    const objectId = new mongoose.Types.ObjectId(studentId);

    const report = await Attendance.aggregate([
        // Step 1: Filter down to ONLY this student and this specific course
        {
            $match: {
                studentId: objectId,
                courseCode: courseCode
            }
        },
        // Step 2: Group them together and calculate the totals
        {
            $group: {
                _id: "$studentId", // Group by the student
                totalClasses: { $sum: 1 }, // Count every document found (+1)
                
                // If status is "Present", add 1, otherwise add 0
                totalPresent: { 
                    $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } 
                },
                
                // If status is "Absent", add 1, otherwise add 0
                totalAbsent: { 
                    $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } 
                }
            }
        },
        // Step 3: Math formatting (Calculate the percentage!)
        {
            $project: {
                _id: 0, // Hide the raw ID from the final output
                totalClasses: 1,
                totalPresent: 1,
                totalAbsent: 1,
                attendancePercentage: {
                    $multiply: [
                        { $divide: ["$totalPresent", "$totalClasses"] },
                        100
                    ]
                }
            }
        }
    ]);

    // If report is empty, the student hasn't gone to any classes yet
    if (!report || report.length === 0) {
        throw new ApiError(404, "No attendance records found for this student in this course.");
    }

    return res.status(200).json(
        new ApiResponse(200, report[0], "Attendance report generated")
    );
});
