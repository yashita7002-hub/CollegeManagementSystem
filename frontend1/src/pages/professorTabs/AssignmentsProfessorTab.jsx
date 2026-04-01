import React, { useState, useEffect } from "react";
import axios from "axios";

function AssignmentsTab() {
  const [courseCode, setCourseCode] = useState("");
  const [branch, setBranch] = useState("");
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/v1/courses/all");
        const courseCodes = res.data.data.map(
          (course) => course.courseCode
        );
        setCourses(courseCodes);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("/api/v1/assignments/assignments", {
        withCredentials: true,
      });
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);


const handleCreate = async () => {
  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("courseCode", courseCode);
    formData.append("deadline", deadline);
    formData.append("description", description);
    formData.append("branch", branch); // if backend supports

    if (file) {
      formData.append("file", file); // must match multer
    }

    const res =await axios.post(
  "/api/v1/assignments/create",
  formData,
  {
    withCredentials: true, // ✅ ensures cookie is sent
  }
);

    if (res.data.success) {
      setTitle("");
      setDescription("");
      setDeadline("");
      setFile(null);
      fetchAssignments();
      alert("Assignment created successfully!");
    }
  } catch (error) {
    console.error(error);
  }
};



  const isFormValid =
    courseCode && branch && title && description && deadline ;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">
          Assignment Management
        </h2>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition">
            Upload
          </button>
          <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition">
            Evaluate
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <h3 className="font-semibold text-gray-700">Select Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Course */}
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Select Course</option>
            {courses.map((code, i) => (
              <option key={i}>{code}</option>
            ))}
          </select>

          {/* Branch */}
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Select Branch</option>
            <option>CSE</option>
            <option>ECM</option>
            <option>MSC</option>
            <option>BSC</option>
          </select>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">

        <h3 className="font-semibold text-gray-700">
          Create New Assignment
        </h3>

        {/* File Upload */}
        <div className="border-2 border-dashed border-emerald-400 rounded-lg p-4 text-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mx-auto"
          />
          {file && (
            <p className="text-sm text-gray-500 mt-2">{file.name}</p>
          )}
        </div>

        {/* Title + Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-400"
          />

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Description */}
        <textarea
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded-md h-24 resize-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Submit */}
        <button
          disabled={!isFormValid}
          className={`w-full py-2 rounded-md text-white transition ${
            isFormValid
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleCreate}
        >
          Create Assignment
        </button>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
        <h3 className="font-semibold text-gray-700">
          Recent Assignments
        </h3>

        <div className="hidden md:grid grid-cols-3 font-medium text-gray-500 border-b pb-2">
          <span>Title</span>
          <span>Branch</span>
          <span>Course</span>
        </div>

        {assignments.length > 0 ? (
          assignments.map((assign) => (
            <div
              key={assign._id}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-md hover:bg-gray-50 transition"
            >
              <span>{assign.title}</span>
              <span>{assign.branch || "N/A"}</span>
              <span>{assign.courseCode}</span>
            </div>
          ))
        ) : (
          <div className="p-3 text-center text-gray-500">
            No assignments found.
          </div>
        )}
      </div>

    </div>
  );
}

export default AssignmentsTab;