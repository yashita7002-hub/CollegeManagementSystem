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

  // ✅ check student using Student model (not User)
  const studentExists = await Student.findOne({ userId: studentId });

  if (!studentExists) {
    throw new ApiError(404, "Student not found.");
  }

  // ✅ FIX HERE
  const updatedStudent = await Student.findOneAndUpdate(
    { userId: studentId },   // 🔥 correct field
    {
      $addToSet: { enrolledCourses: courseCode }
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedStudent, `Successfully enrolled student in ${courseCode}`)
  );
});




export const AssignCourseToProfessors = asyncHandler(async (req, res) => {

  const { courseCode, professorId } = req.body;

  if (!courseCode || !professorId) {
    throw new ApiError(400, "Please provide both courseCode and professorId.");
  }

  const courseExists = await Course.findOne({ courseCode });
  if (!courseExists) {
    throw new ApiError(404, `Course with code ${courseCode} does not exist.`);
  }

  // ✅ check in Professor model
  const professorExists = await Professor.findOne({ userId: professorId });

  if (!professorExists) {
    throw new ApiError(404, "Professor not found.");
  }

  // ✅ FIX HERE
  const updatedProfessor = await Professor.findOneAndUpdate(
    { userId: professorId },   // 🔥 correct field
    {
      $addToSet: { assignedCourses: courseCode }
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedProfessor, `Successfully assigned professor to ${courseCode}`)
  );
});

// ================= GET ALL COURSES (ADMIN) =================
export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({},);

  return res.status(200).json(
    new ApiResponse(200, courses, "Course codes fetched successfully")
  );
});



export const getcodeCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}); 
  // only courseCode, remove _id

  return res.status(200).json(
    new ApiResponse(200, courses, "Course codes fetched")
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







export const AssignedCourses = asyncHandler(async (req, res) => {

  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "Please input the username");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "Invalid user");
  }

  let courses = [];

  // ✅ FIX ROLE CHECK
  if (user.role === "student") {

    const student = await Student.findOne({ userId: user._id });


    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    courses = student.enrolledCourses;

    

  } else if (user.role === "professor") {

    const professor = await Professor.findOne({ userId: user._id });

    if (!professor) {
      throw new ApiError(404, "Professor not found");
    }

    courses = professor.assignedCourses;
  }

  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        username: user.username,
        role: user.role
      },
      courses
    }, "Courses fetched successfully")
  );
});





export const ProfessorCourses = asyncHandler(async (req, res) => {

  const { professorId } = req.body;

  if (!professor) {
    throw new ApiError(400, "provide the professor id");
  }

  const user = await Profeso.findOne({ username });

  if (!user) {
    throw new ApiError(404, "Invalid user");
  }

  let courses = [];

  // ✅ FIX ROLE CHECK
  if (user.role === "student") {

    const student = await Student.findOne({ userId: user._id });


    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    courses = student.enrolledCourses;

    

  } else if (user.role === "professor") {

    const professor = await Professor.findOne({ userId: user._id });

    if (!professor) {
      throw new ApiError(404, "Professor not found");
    }

    courses = professor.assignedCourses;
  }

  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        username: user.username,
        role: user.role
      },
      courses
    }, "Courses fetched successfully")
  );
});


