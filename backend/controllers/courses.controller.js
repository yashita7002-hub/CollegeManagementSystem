import {Student} from "../models/student.models.js";
import {Course} from "../models/courses.models.js";
import {User} from "../models/user.models.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createCourse = asyncHandler(async (req, res) => {

  const { courseName, courseCode, credits ,department} = req.body;

  if ([courseName, courseCode, credits, department].some(f => !f?.trim?.())) {
    throw new ApiError(400, "All fields are required");
  }

  const courseExists = await Course.findOne({ courseCode });
  if (courseExists) throw new ApiError(409, "This courseCode already exists");

  const course = await Course.create({ courseName, courseCode, credits, department});
  const courseAdded = await Course.findById(course._id);

  if (!courseAdded) throw new ApiError(500, "Something went wrong while adding the course");

  return res.status(201).json(
   new ApiResponse(200, courseAdded, "Course added successfully")
  );
});


export const assignCoursesByBranchAndYear = asyncHandler(async (req, res) => {
  const { branch, year, courseIds } = req.body;

  if ([branch, year, courseIds].some(f => !f)) {
    throw new ApiError(400, "All fields are required");
  }

  // Bulk update students
  const result = await Student.updateMany(
    { branch, year },
    { $addToSet: { courses: { $each: courseIds } } } // prevents duplicates
  );

  if (!result.modifiedCount) {
    throw new ApiError(404, "No students found or courses already assigned");
  }

  // Also update Course document(s) to reference students
  const students = await Student.find({ branch, year }).select("_id");
  await Course.updateMany(
    { _id: { $in: courseIds } },
    { $addToSet: { students: { $each: students.map(s => s._id) } } }
  );

  res.status(200).json({
    message: `Courses assigned to ${result.modifiedCount} students in ${branch} year ${year}`
  });
});

// 3️⃣ Assign courses to a professor
export const assignCoursesToProfessor = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  const { branch, year, courseIds } = req.body;

  const professor = await User.findById(professorId);
  if (!professor || professor.role !== "professor") {
    throw new ApiError(404, "Professor not found");
  }

  // Ensure courses array exists
  if (!professor.courses) professor.courses = [];

  // Add courses without duplicates
  for (const courseId of courseIds) {
    if (!professor.courses.includes(courseId)) {
      professor.courses.push(courseId);
    }
  }
  await professor.save();

  // Update Course documents to reference this professor
  await Course.updateMany(
    { _id: { $in: courseIds } },
    { $addToSet: { professor: professor._id } }
  );

  res.status(200).json({ message: "Courses assigned to professor", professor });
});