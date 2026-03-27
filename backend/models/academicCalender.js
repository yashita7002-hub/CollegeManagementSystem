import mongoose, { Schema } from "mongoose";

const academicCalendarSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  year: {
    type: String, // e.g. "2025-26"
    required: true
  }

}, { timestamps: true });

export const AcademicCalendar = mongoose.model(
  "AcademicCalendar",
  academicCalendarSchema
);