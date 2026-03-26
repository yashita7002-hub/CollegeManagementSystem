import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/assignment.model.js";
import { Course } from "../models/courses.models.js";
import { Professor } from "../models/professors.models.js"; 
import { ApiError } from "../utils/ApiError.js";             
import { ApiResponse } from "../utils/ApiResponse.js";       
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

 const createAssignment = asyncHandler(async (req, res) => { 

   
    const { title, courseCode, Deadline, professorId, Description } = req.body;

    if(!title || !courseCode || !Deadline || !professorId || !Description) {
        throw new ApiError(400, "Title, courseCode, professorId, and Description are required fields");
    }

    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }

    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }

    
    const imageFormPath = req.files?.imageForm?.[0]?.path; 
    let image; 
    if (imageFormPath) {
      
       image = await uploadOnCloudinary(imageFormPath); 
    }


    const AssignmentCreated = await Assignment.create({
        title,
        courseCode,
        Deadline,
        professorId,
        Description,
        mediaUrl: image?.url || "" 
    });

    if (!AssignmentCreated) {
        throw new ApiError(500, "Something went wrong while uploading the assignment");
    }
    
    return res.status(201).json(
        new ApiResponse(201, AssignmentCreated, "Assignment created successfully")
    );
});






























export {
    createAssignment
}