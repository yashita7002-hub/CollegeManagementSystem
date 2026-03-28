import { Student } from "../models/student.models.js";
import { Course } from "../models/courses.models.js";
import { User } from "../models/user.models.js"; 
import { Professor } from "../models/professors.models.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";










export const createCourse = asyncHandler(async (req, res) => {

  const { courseName, courseCode, credits } = req.body;

  if ([courseName, courseCode, credits].some(f => !f?.trim?.())) {

    throw new ApiError(400, "All fields are required");
  }

  const courseExists = await Course.findOne({ courseCode });

  if (courseExists)
     throw new ApiError(409, "This courseCode already exists");


  const course = await Course.create({ courseName, courseCode, credits});

  const courseAdded = await Course.findById(course._id);

  if (!courseAdded)
     throw new ApiError(500, "Something went wrong while adding the course");


  return res
  .status(201)
  .json(
   new ApiResponse(200, courseAdded, "Course added successfully")
  );
});










export const AssignCourseToStudents = asyncHandler(async (req, res) => {


    const { courseCode, studentId } = req.body;


    if (!courseCode || !studentId) {
        throw new ApiError(400, "Please provide both courseCode and studentId.");
    }


    const courseExists = await Course.findOne({ courseCode });
    
    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }


    const studentExists = await Student.findById(studentId);

    if (!studentExists) {
        throw new ApiError(404, "Student not found.");
    }


    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
            $addToSet: { enrolledCourses: courseCode }
        },
        { new: true, runValidators: true } 
    );
    

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedStudent, `Successfully enrolled student in ${courseCode}`)
    );
});










export const AssignCourseToProfessors = asyncHandler(async (req, res) => { // 2. Added async

   const { professorId, courseCode } = req.body;

   if (!professorId || !courseCode ){
    throw new ApiError(400, "Please provide both courseCode and professorId.") 
   }


   const courseExists = await Course.findOne({ courseCode });

    if (!courseExists) {
        throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
    }


    const professorExists = await Professor.findById(professorId); 
    if (!professorExists) { // 3. Fixed copy-paste from studentExists
        throw new ApiError(404, "Professor not found.");
    }

    
    const updatedProfessor = await Professor.findByIdAndUpdate( // 3. Changed from Student to Professor
        professorId,
        {
          
            $addToSet: { assignedCourses: courseCode } 
        },
        { new: true, runValidators: true } 
    );
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedProfessor, `Successfully assigned professor in ${courseCode}`)
    );
});


// ================= GET ALL COURSES (ADMIN) =================
export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, courses, "Courses fetched successfully")
  );
});

// ================= DELETE COURSE (ADMIN) =================
export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;

  if (!courseCode) {
    throw new ApiError(400, "Course code is required to perform deletion.");
  }

  const courseExists = await Course.findOne({ courseCode });
  if (!courseExists) {
    throw new ApiError(404, "Course not found.");
  }

  // Remove the course from Professor and Student assigned arrays
  await Student.updateMany(
    { enrolledCourses: courseCode },
    { $pull: { enrolledCourses: courseCode } }
  );

  await Professor.updateMany(
    { assignedCourses: courseCode },
    { $pull: { assignedCourses: courseCode } }
  );

  // Finally delete the course
  await Course.findByIdAndDelete(courseExists._id);

  return res.status(200).json(
    new ApiResponse(200, {}, `Course ${courseCode} has been completely deleted.`)
  );
});