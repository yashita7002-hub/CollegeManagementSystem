import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/assignment.model.js";
import { Student } from "../models/student.models.js";
import { Professor } from "../models/professors.models.js"; 
import { Submission } from "../models/submission.models.js"; 
import { ApiError } from "../utils/ApiError.js";             
import { ApiResponse } from "../utils/ApiResponse.js";       
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

const submitAssignment = asyncHandler(async (req, res) => {

    const { assignmentId, studentId, professorId, description } = req.body;

    if(!assignmentId || !studentId || !professorId) {
        throw new ApiError(400, "assignmentId, studentId, and professorId are required fields");
    }

    const AssignmentExists = await Assignment.findById(assignmentId);
    if (!AssignmentExists) {
        throw new ApiError(404, "Assignment not found.");
    }

    const StudentExists = await Student.findById(studentId);
    if (!StudentExists) {
        throw new ApiError(404, "Student not found.");
    }

    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }


    const submissionUrlLocalPath = req.files?.submissionUrl?.[0]?.path;
     
    if (!submissionUrlLocalPath) {
        throw new ApiError(400, "Submission pdf/image is required");
    }

    
    const cloudinaryResponse = await uploadOnCloudinary(submissionUrlLocalPath);
      
    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    // Create the document in the DB
    const SubmissionDone = await Submission.create({
        assignmentId,
        studentId, 
        professorId,
        submissionUrl: cloudinaryResponse.url, 
        description: description || ""        
    });

    if (!SubmissionDone) {
        throw new ApiError(500, "Something went wrong while submitting the assignment");
    }
    
   
    return res.status(201).json(
        new ApiResponse(201, SubmissionDone, "Assignment submitted successfully")
    );
});



const evaluateAssignment = asyncHandler(async(req,res) => {


    const {submissionId} = req.params;
    const {marksObtained,feedback} = req.body;

      if (marksObtained === undefined || marksObtained === null) {
        throw new ApiError(400, "marksObtained field is required to evaluate");
    }

      const existingSubmission = await Submission.findById(submissionId);
    if (!existingSubmission) {
        throw new ApiError(404, "Submission not found.");
    }


      if (existingSubmission.professorId.toString() !== req.user._id.toString()) {
         throw new ApiError(403, "You do not have permission to grade another professor's assignment.");
    }

        const evaluatedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        {
            marksObtained: marksObtained,
            feedback: feedback || "" // If they didn't leave feedback, just save an empty string
        },
        // 'new: true' forces Mongoose to return the freshly updated document, not the old one
        { new: true, runValidators: true } 
    );
    
    return res.status(200).json(
        new ApiResponse(200, evaluatedSubmission, "Assignment evaluated successfully")
    );
});



export {
    submitAssignment,evaluateAssignment
}
 



    



