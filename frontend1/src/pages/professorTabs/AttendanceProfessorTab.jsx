import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function AttendanceTab() {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [activeView, setActiveView] = useState("upload"); // "upload" or "view"

  const [courseCode, setCourseCode] = useState("");
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Maps studentId to "present" or "absent"
  const [attendanceStatuses, setAttendanceStatuses] = useState({});

  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/v1/courses/all");
        const courseCodes = res.data.data.map(course => course.courseCode);
        setCourses(courseCodes);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleLoadStudents = async () => {
    if (!courseCode || !branch || !date) {
      showMessage("Please select Course Code, Branch, and Date", "error");
      return;
    }
    try {
      const res = await axios.get("/api/v1/attendance/students", {
        params: { courseCode, branch }
      });
      const fetchedStudents = res.data.data;
      setStudents(fetchedStudents);
      if (fetchedStudents.length === 0) {
        showMessage("No students found for this course and branch.", "info");
      } else {
        const initialStatuses = {};
        fetchedStudents.forEach(s => {
          initialStatuses[s._id] = "present"; // Default all to present
        });
        setAttendanceStatuses(initialStatuses);

        // Auto-upload default attendance in background without failing the load
        const records = fetchedStudents.map(student => ({
          studentId: student._id,
          status: "present"
        }));

        if (!user || (!user._id && !user.id)) {
          console.warn("User context not established, skipping auto-upload.");
          showMessage("Students loaded. (Auto-upload skipped: User missing)", "info");
          return;
        }

        try {
          await axios.post("/api/v1/attendance/upload-bulk", {
            userId: user?._id || user?.id,
            courseCode,
            date,
            attendanceRecords: records
          });
          showMessage("Students loaded and default attendance recorded successfully", "success");
        } catch (uploadError) {
          console.error("Auto-upload failed:", uploadError);
          const backendMsg = uploadError.response?.data?.message || uploadError.message || "Unknown error";
          showMessage(`Students loaded, but auto-upload failed (${uploadError.response?.status}): ${backendMsg}`, "error");
        }
      }
    } catch (err) {
      console.error("Load Students failed:", err);
      const backendMsg = err.response?.data?.message || err.message;
      showMessage(`Fetch Students Failed (${err.response?.status}): ${backendMsg} [sent: ${courseCode}, ${branch}]`, "error");
    }
  };

  const handleFetchRecords = async () => {
    if (!courseCode || !date) {
      showMessage("Please select Course Code and Date", "error");
      return;
    }
    try {
      const res = await axios.get("/api/v1/attendance/records", {
        params: { courseCode, date }
      });
      setAttendanceRecords(res.data.data);
      if (res.data.data.length === 0) {
        showMessage("No records found for this course and date.", "info");
      } else {
        showMessage("Records loaded successfully", "success");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to load records", "error");
    }
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) {
      showMessage("Please load students first", "error");
      return;
    }

    const records = Object.keys(attendanceStatuses).map(studentId => ({
      studentId,
      status: attendanceStatuses[studentId]
    }));

    try {
      const res = await axios.post("/api/v1/attendance/upload-bulk", {
        userId: user?._id, // Provided from context
        courseCode,
        date,
        attendanceRecords: records
      });
      if (res.status === 201) {
        showMessage("Attendance submitted successfully", "success");
        setStudents([]); // Clear to prevent re-submit
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to submit attendance", "error");
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const studentName = record.studentId?.fullName?.toLowerCase() || "";
    const username = record.studentId?.userId?.username?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || username.includes(query);
  });

  return (
    <div className="flex flex-col gap-6 p-4">

      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold uppercase">Attendance Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("upload")}
            className={`px-4 py-2 text-sm rounded-md font-medium transition ${activeView === "upload" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Upload Attendance
          </button>
          <button
            onClick={() => setActiveView("view")}
            className={`px-4 py-2 text-sm rounded-md font-medium transition ${activeView === "view" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            View Records
          </button>
        </div>
      </div>

      {/* Message Box */}
      {message.text && (
        <div className={`p-3 border rounded-md font-medium text-sm ${message.type === "error" ? "bg-red-50 text-red-700 border-red-200" :
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
          {message.text}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-md shadow-sm border border-gray-100">
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase font-semibold">Course Code</label>
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full p-2 border rounded text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Select Course Code</option>
            {courses.map((code, index) => (
              <option key={index} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase font-semibold">Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={activeView === "view"}
            className="w-full p-2 border rounded text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100"
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECM">ECM</option>
            <option value="MSC">MSC</option>
            <option value="BSC">BSC</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase font-semibold">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-end">
          {activeView === "upload" ? (
            <button
              onClick={handleLoadStudents}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded text-sm font-medium transition"
            >
              Load Students
            </button>
          ) : (
            <button
              onClick={handleFetchRecords}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white p-2 rounded text-sm font-medium transition"
            >
              Fetch Records
            </button>
          )}
        </div>
      </div>

      {activeView === "upload" && (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-semibold text-gray-700">Enrolled Students</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">
              {students.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="p-3">Roll No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="p-3 font-medium">{student.userId?.username || "N/A"}</td>
                    <td className="p-3">{student.fullName}</td>
                    <td className="p-3">{student.branch}</td>
                    <td className="p-3 flex justify-center gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student._id}`}
                          checked={attendanceStatuses[student._id] === "present"}
                          onChange={() => handleStatusChange(student._id, "present")}
                          className="accent-emerald-600"
                        />
                        Present
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student._id}`}
                          checked={attendanceStatuses[student._id] === "absent"}
                          onChange={() => handleStatusChange(student._id, "absent")}
                          className="accent-red-600"
                        />
                        Absent
                      </label>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-500">No students loaded. Select criteria and click "Load Students".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmitAttendance}
              disabled={students.length === 0}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded text-sm font-semibold transition"
            >
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      {activeView === "view" && (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-semibold text-gray-700">Attendance Log</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by Name or Roll No."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-1 border text-sm rounded focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                {filteredRecords.length} Records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="p-3">Roll No.</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="p-3 font-medium">{record.studentId?.userId?.username || "N/A"}</td>
                    <td className="p-3">{record.studentId?.fullName}</td>
                    <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === "present" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                        {record.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-500">No records found. Adjust search or fetch records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceTab;