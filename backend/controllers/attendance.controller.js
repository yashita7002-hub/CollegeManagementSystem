import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Student } from "../models/student.models.js";
import { Professor } from "../models/professors.models.js";
import { Course } from "../models/courses.models.js";     
import { Attendance } from "../models/attendance.model.js"; // Fixed typo in import
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
        courseCode: courseExists._id,
        date: new Date(),
        status: status === "Present" ? "present" : "absent" 
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
    
    const objectId = new mongoose.Types.ObjectId(studentId);

    const report = await Attendance.aggregate([
        {
            $match: {
                studentId: objectId,
                courseCode: courseCode
            }
        },
        {
            $group: {
                _id: "$studentId", 
                totalClasses: { $sum: 1 }, 
                totalPresent: { 
                    $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } 
                },
                totalAbsent: { 
                    $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } 
                }
            }
        },
        {
            $project: {
                _id: 0, 
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

    if (!report || report.length === 0) {
        throw new ApiError(404, "No attendance records found for this student in this course.");
    }

    return res.status(200).json(
        new ApiResponse(200, report[0], "Attendance report generated")
    );
});

// NEW: Fetch students for attendance based on year and course code
export const getStudentsForAttendance = asyncHandler(async (req, res) => {
    console.log("QUERY PARAMS:", req.query);
    const { courseCode, branch } = req.query;

    if (!courseCode || !branch) {
        throw new ApiError(400, `Course code and branch are required. Received: ${JSON.stringify(req.query)}`);
    }

    // Find the course by code (assuming enrolledCourses in Student holds course code string)
    const students = await Student.find({
        branch,
        enrolledCourses: courseCode 
    }).populate("userId", "username").select("-password");

    if (!students || students.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No students found for this course and year."));
    }

    return res.status(200).json(new ApiResponse(200, students, "Students fetched successfully."));
});

// NEW: Upload bulk attendance for course+year
export const AttendanceBulkUpdater = asyncHandler(async (req, res) => {
    let { professorId, userId, courseCode, date, attendanceRecords } = req.body;
    // attendanceRecords = [{ studentId, status }, ...]

    if ((!professorId && !userId) || !courseCode || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
        throw new ApiError(400, "professorId/userId, courseCode, date, and attendanceRecords are required.");
    }

    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }

    let professorExists;
    if (userId) {
        professorExists = await Professor.findOne({ userId });
    } else {
        professorExists = await Professor.findById(professorId);
    }
    
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }

    professorId = professorExists._id; // Ensure we use the exact ObjectId for Professor

    const parsedDate = new Date(date);
    
    // Prepare bulk ops
    const bulkOps = attendanceRecords.map(record => ({
        updateOne: {
            filter: { 
                studentId: new mongoose.Types.ObjectId(record.studentId), 
                courseCode: courseExists._id, 
                date: parsedDate 
            },
            update: {
                $set: {
                    professorId: new mongoose.Types.ObjectId(professorId),
                    status: record.status.toLowerCase()
                }
            },
            upsert: true
        }
    }));

    if (bulkOps.length > 0) {
        await Attendance.bulkWrite(bulkOps);
    }

    return res.status(201).json(new ApiResponse(201, {}, "Bulk attendance uploaded successfully."));
});

// NEW: View past attendance by course and date
export const getAttendanceRecords = asyncHandler(async (req, res) => {
    const { courseCode, date } = req.query;

    if (!courseCode || !date) {
        throw new ApiError(400, "Course code and date are required.");
    }

    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }

    // Set precise date bounds to find records for a specific day
    const parsedDate = new Date(date);
    const nextDate = new Date(parsedDate);
    nextDate.setDate(parsedDate.getDate() + 1);

    const records = await Attendance.find({
        courseCode: courseExists._id,
        date: {
            $gte: parsedDate,
            $lt: nextDate
        }
    }).populate({
        path: "studentId",
        select: "fullName userId",
        populate: {
            path: "userId",
            select: "username"
        }
    });

    return res.status(200).json(new ApiResponse(200, records, "Attendance records fetched successfully."));
});

// NEW: Get student's overall attendance summary across all courses
export const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find the student profile for this user
    const student = await Student.findOne({ userId });
    if (!student) {
        throw new ApiError(404, "Student profile not found.");
    }

    const attendanceSummary = await Attendance.aggregate([
        {
            $match: {
                studentId: student._id
            }
        },
        {
            $group: {
                _id: "$courseCode",
                totalClasses: { $sum: 1 },
                presentClasses: {
                    $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo"
            }
        },
        {
            $unwind: "$courseInfo"
        },
        {
            $project: {
                _id: 0,
                courseId: "$_id",
                courseCode: "$courseInfo.courseCode",
                courseName: "$courseInfo.courseName",
                totalClasses: 1,
                presentClasses: 1,
                percentage: {
                    $multiply: [
                        { $divide: ["$presentClasses", "$totalClasses"] },
                        100
                    ]
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, attendanceSummary, "Student attendance summary fetched successfully")
    );
});


const getProfessorAllotedCourse= asyncHandler(async(req,res) => {
        const {professorId} = req.body
        
})