import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/assignment.model.js";
import { Student } from "../models/student.models.js";
import { Submission } from "../models/submission.models.js"; 
import { ApiError } from "../utils/ApiError.js";             
import { ApiResponse } from "../utils/ApiResponse.js";       
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

const submitAssignment = asyncHandler(async (req, res) => {
    const { assignmentId, description } = req.body;
    const userId = req.user._id;

    if (!assignmentId) {
        throw new ApiError(400, "assignmentId is required");
    }

    // Find student profile
    const student = await Student.findOne({ userId });
    if (!student) {
        throw new ApiError(404, "Student profile not found.");
    }

    // Find the assignment to get the professorId
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        throw new ApiError(404, "Assignment not found.");
    }

    const submissionFileLocalPath = req.file?.path;
    if (!submissionFileLocalPath) {
        throw new ApiError(400, "Submission file (PDF/Image) is required");
    }

    const cloudinaryResponse = await uploadOnCloudinary(submissionFileLocalPath);
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    // Check if a submission already exists for this student and assignment
    const existingSubmission = await Submission.findOne({
        assignmentId,
        studentId: student._id
    });

    let submission;
    if (existingSubmission) {
        // Update existing submission
        existingSubmission.submissionUrl = cloudinaryResponse.url;
        existingSubmission.description = description || existingSubmission.description;
        existingSubmission.submittedAt = new Date();
        submission = await existingSubmission.save();
    } else {
        // Create the document in the DB
        submission = await Submission.create({
            assignmentId,
            studentId: student._id, 
            professorId: assignment.professorId,
            submissionUrl: cloudinaryResponse.url, 
            description: description || ""        
        });
    }

    if (!submission) {
        throw new ApiError(500, "Something went wrong while submitting the assignment");
    }
    
    return res.status(201).json(
        new ApiResponse(201, submission, "Assignment submitted successfully")
    );
});

const getSubmissionsByAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        throw new ApiError(400, "assignmentId is required");
    }

    const submissions = await Submission.find({ assignmentId })
        .populate({
            path: "studentId",
            select: "fullName branch year userId",
            populate: {
                path: "userId",
                select: "username email"
            }
        })
        .sort({ submittedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, submissions, "Submissions fetched successfully")
    );
});

const evaluateAssignment = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;
    const professorUserId = req.user._id;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        throw new ApiError(404, "Submission not found.");
    }

    // Verification that this professor is the one assigned to the submission
    if (submission.professorId.toString() !== professorUserId.toString()) {
        const professor = await import("../models/professors.models.js").then(m => m.Professor).findOne({ userId: professorUserId });
        if (!professor || submission.professorId.toString() !== professor._id.toString()) {
            throw new ApiError(403, "You do not have permission to evaluate this submission.");
        }
    }

    const evaluatedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        {
            marksObtained,
            feedback: feedback || ""
        },
        { new: true, runValidators: true } 
    );
    
    return res.status(200).json(
        new ApiResponse(200, evaluatedSubmission, "Assignment evaluated successfully")
    );
});

const getStudentSubmissionForAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    const student = await Student.findOne({ userId });
    if (!student) {
        throw new ApiError(404, "Student profile not found.");
    }

    const submission = await Submission.findOne({
        assignmentId,
        studentId: student._id
    });

    return res.status(200).json(
        new ApiResponse(200, submission, "Submission fetched successfully")
    );
});

export {
    submitAssignment,
    evaluateAssignment,
    getSubmissionsByAssignment,
    getStudentSubmissionForAssignment
}

 



    



