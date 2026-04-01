import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/assignment.model.js";
import { ApiError } from "../utils/ApiError.js";             
import { ApiResponse } from "../utils/ApiResponse.js";       
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"; 

const createAssignment = asyncHandler(async (req, res) => {
  const { title, courseCode, deadline, description, branch } = req.body;

  const professorId = req.user._id; // ✅ from middleware

  if (!title || !courseCode || !deadline || !description) {
    throw new ApiError(400, "All required fields missing");
  }

  let mediaUrl = "";

  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    mediaUrl = uploaded?.url || "";
  }

  const assignment = await Assignment.create({
    title,
    courseCode,
    deadline,
    description,
    branch,
    professorId,
    mediaUrl,
  });

  res.status(201).json({
    success: true,
    data: assignment,
  });
});
















const getAssignments = asyncHandler(async (req, res) => {
  const professorId = req.user._id;
  
  const assignments = await Assignment.find({ professorId }).sort({ createdAt: -1 });
  
  res.status(200).json(
    new ApiResponse(200, assignments, "Assignments fetched successfully")
  );
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const professorId = req.user._id;
  const { id } = req.params;

  const assignment = await Assignment.findOne({ _id: id, professorId });
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  res.status(200).json(new ApiResponse(200, assignment, "Assignment fetched successfully"));
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const professorId = req.user._id;
  const { id } = req.params;

  const assignment = await Assignment.findOne({ _id: id, professorId });
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Delete attachment from Cloudinary (if any), then remove DB record.
  if (assignment.mediaUrl) {
    await deleteFromCloudinary(assignment.mediaUrl);
  }

  await Assignment.deleteOne({ _id: id });

  res.status(200).json(new ApiResponse(200, {}, "Assignment deleted successfully"));
});

export {
    createAssignment,
    getAssignments,
    getAssignmentById,
    deleteAssignment
}