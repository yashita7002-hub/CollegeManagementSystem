import { AcademicCalendar } from "../models/academicCalender.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";

export const uploadCalendar = asyncHandler(async (req, res) => {
  const { title, year } = req.body;

  console.log("FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);

  if (!uploadResult) {
    return res.status(400).json({
      message: "Cloudinary upload failed",
    });
  }

  try {
    const calendar = await AcademicCalendar.create({
      title,
      year,
      fileUrl: uploadResult.secure_url,
      uploadedBy: req.user?._id,
    });

    res.status(201).json({
      message: "Calendar uploaded successfully",
      calendar,
    });
  } catch (dbError) {
    res.status(500).json({
      success: false,
      message: dbError.message,
    });
  }
});
export const getCalendars = asyncHandler(async (req, res) => {
  const calendars = await AcademicCalendar.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: calendars,
  });
});

export const deleteCalendar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const calendar = await AcademicCalendar.findById(id);
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }

  if (calendar.fileUrl) {
    await deleteFromCloudinary(calendar.fileUrl);
  }

  await AcademicCalendar.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Calendar deleted successfully",
  });
});