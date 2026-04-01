// GET /api/analytics/student/course/:courseCode/leaderboard
export const getStudentLeaderboardMetrics = asyncHandler(async (req, res) => {
    const { courseCode } = req.params;
    const studentId = req.user._id; // Assuming student ID comes from auth token

    // 1. Grab the ENTIRE class for this course, sorted from Highest to Lowest Total
    // .populate() automatically fetches the user's name from your User/Student schema!
    const classGrades = await Grade.find({ courseCode })
        .sort({ totalObtained: -1 })
        .populate("studentId", "name username"); 

    if (!classGrades || classGrades.length === 0) {
        throw new ApiError(404, "No grading data found for this course.");
    }

    // 2. The Highest Score is literally index [0] because we just sorted the array!
    const classHighest = classGrades[0].totalObtained;
    const highestStudentName = classGrades[0].studentId.name;

    // 3. Find where exactly OUR logged-in student ranks in this array
    const myRankIndex = classGrades.findIndex(
        (g) => g.studentId._id.toString() === studentId.toString()
    );
    const myGradeInfo = classGrades[myRankIndex];

    // 4. Slice the top 5 students to build a secure UI Leaderboard widget
    const top5Leaderboard = classGrades.slice(0, 5).map((grade, index) => ({
        rank: index + 1,
        // Only show names to make it competitive!
        name: grade.studentId.name,
        score: grade.totalObtained
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            myRank: myRankIndex + 1, // Arrays start at 0, so add 1 for true rank
            myScore: myGradeInfo.totalObtained,
            classHighest: classHighest,
            leaderboard: top5Leaderboard // Send to frontend to render a table
        }, "Leaderboard Metrics Generated Component!")
    );
});


import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Grade } from "../models/grades.models.js";
import { Attendance } from "../models/attendance.models.js";
import { QuizAttempt } from "../models/quizAttempt.models.js";

// GET /api/analytics/professor/:courseCode/student/:studentId
export const getStudentPerformanceProfile = asyncHandler(async (req, res) => {
    const { courseCode, studentId } = req.params;
    const objectStudentId = new mongoose.Types.ObjectId(studentId);

    // Fire all 3 Database Queries simultaneously for maximum speed
    const [gradeLedger, attendanceStats, quizAttempts] = await Promise.all([
        // Query 1: Fetch the student's internal, mid, and end sem marks
        Grade.findOne({ courseCode, studentId }),
        
        // Query 2: Aggregate their total present vs total classes
        Attendance.aggregate([
            { $match: { courseCode: courseCode, studentId: objectStudentId } },
            { 
               $group: { 
                   _id: null, 
                   totalClasses: { $sum: 1 },
                   presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
               } 
            }
        ]),
        
        // Query 3: Fetch every quiz/MCQ test they took for this course
        QuizAttempt.find({ courseCode, studentId })
                   .select('totalScore isGraded createdAt') 
    ]);

    // Format the package exactly how a Frontend UI expects to read it
    const dashboardData = {
        grades: gradeLedger || { message: "No grades uploaded yet" },
        // Calculate attendance % dynamically before sending
       attendance: attendanceStats[0] ? {
            ...attendanceStats[0],
            percentage: ((attendanceStats[0].presentCount / attendanceStats[0].totalClasses) * 100).toFixed(1)
        } : { message: "No attendance recorded" },
        quizzes: quizAttempts
    };

    return res.status(200).json(
        new ApiResponse(200, dashboardData, "Student Profile Generated Successfully")
    );
});




