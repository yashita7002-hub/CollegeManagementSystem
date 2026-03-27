import { AcademicCalendar } from "../models/academicCalendar.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadCalendar = async (req, res) => {
  const { title, year } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);

  const calendar = await AcademicCalendar.create({
    title,
    year,
    fileUrl: uploadResult.secure_url,
    uploadedBy: req.user._id
  });

  res.status(201).json({
    message: "Calendar uploaded successfully",
    calendar
  });
};







export const getCalendars = asyncHandler(async (req, res) => {
  const calendars = await AcademicCalendar
    .find()
    .sort({ createdAt: -1 });//it ensureslatest calender goes to the students/professors

  res.status(200).json({
    success: true,
    data: calendars
  });
});