import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Test } from "../models/tests.models.js";        
import { Course } from "../models/courses.models.js";
import { Professor } from "../models/professors.models.js"; 
import { ApiError } from "../utils/ApiError.js";             
import { ApiResponse } from "../utils/ApiResponse.js";       


export const createTest = asyncHandler(async (req, res) => {

    
    const { title, courseCode, professorId, branch, year, maxMarks, semester, dateConducted } = req.body;

    if(!title || !courseCode || !professorId || !branch || !year || !maxMarks || !semester || !dateConducted){
        throw new ApiError(400, "title, courseCode, professorId, branch, year, maxMarks, semester, and dateConducted are required fields");
    }

    const courseExists = await Course.findOne({ courseCode });
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }

    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }

  
    const testCreated = await Test.create({
        title,
        courseCode,
        professorId,
        branch,
        year,
        maxMarks,
        semester,
        dateConducted
    });
  
    if (!testCreated) {
        throw new ApiError(500, "Something went wrong while creating the test");
    }
    
    return res.status(201).json(
        new ApiResponse(201, testCreated, "Test created successfully")
    );
});


export const evaluateTest = asyncHandler(async (req, res) => {
    
    // We expect the professor to submit the testId and an array of student scores.
    // 'results' should look like: [{ studentId: "65ab...", marksObtained: 85 }, { studentId: "65cd...", marksObtained: 92 }]
    const { testId, professorId, results } = req.body; 
    if (!testId || !professorId || !results || !Array.isArray(results)) {
        throw new ApiError(400, "testId, professorId, and a valid 'results' array are required.");
    }
    const testExists = await Test.findById(testId);
    if (!testExists) {
        throw new ApiError(404, "Test not found.");
    }
    const professorExists = await Professor.findById(professorId);
    if (!professorExists) {
        throw new ApiError(404, "Professor not found.");
    }
    // Security Check: Make sure the grading professor is the one who created the test
    if (testExists.professorId.toString() !== professorId.toString()) {
        throw new ApiError(403, "You do not have permission to grade this test.");
    }
    // The "Magic Loop": Iterate over the results array and prepare database operations
    // Using Promise.all allows us to save all 50+ student grades to the database concurrently (super fast!)
    
    const gradePromises = results.map(async (studentResult) => {
        
        // findOneAndUpdate with upsert:true is incredibly powerful here.
        return Grade.findOneAndUpdate(
            { 
               // Search criteria: Look for a grade belonging to THIS student for THIS test
               testId: testId, 
               studentId: studentResult.studentId 
            },
            {
               // The Data to create or update
               testId: testId,
               studentId: studentResult.studentId,
               courseCode: testExists.courseCode, // Pulled cleanly from the Test document
               marksObtained: studentResult.marksObtained
            },
            { 
               new: true, 
               upsert: true, // If it doesn't exist, create it. If it does exist, update it!
               runValidators: true 
            } 
        );
    });
    // Await all database operations to finish at the exact same time
    await Promise.all(gradePromises);
    return res.status(201).json(
        new ApiResponse(201, null, `Successfully graded ${results.length} students for ${testExists.title}`)
    );
});