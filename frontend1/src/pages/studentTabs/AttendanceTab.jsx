import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function AttendanceTab() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/api/v1/attendance/student-summary");
        if (res.data?.success) {
          setAttendanceSummary(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load attendance summary:", err);
        setError("Failed to load attendance summary.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAttendance();
    }
  }, [user]);

  if (loading) return <div className="p-4 text-center">Loading Attendance...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-purple-800">
        My Attendance Report
      </h2>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-purple-100">
        <table className="min-w-full divide-y divide-purple-100">
          <thead className="bg-gradient-to-r from-purple-600 to-violet-700 text-white">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold uppercase">Course Code</th>
              <th className="py-4 px-6 text-left text-sm font-semibold uppercase">Course Name</th>
              <th className="py-4 px-6 text-center text-sm font-semibold uppercase">Present / Total</th>
              <th className="py-4 px-6 text-center text-sm font-semibold uppercase">Percentage</th>
              <th className="py-4 px-6 text-center text-sm font-semibold uppercase">Status</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-purple-50">
            {attendanceSummary.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-500 italic">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              attendanceSummary.map((item, index) => (
                <tr key={index} className="hover:bg-purple-50/40 transition">
                  <td className="py-4 px-6 font-medium text-purple-700">
                    {item.courseCode}
                  </td>

                  <td className="py-4 px-6 text-gray-700 font-medium">
                    {item.courseName}
                  </td>

                  <td className="py-4 px-6 text-center font-mono font-bold text-gray-700">
                    <span className="text-purple-600">
                      {item.presentClasses}
                    </span>
                    <span className="mx-1 text-gray-300">/</span>
                    <span className="text-violet-800">
                      {item.totalClasses}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-bold ${
                          item.percentage < 75
                            ? "text-red-500"
                            : "text-purple-700"
                        }`}
                      >
                        {item.percentage.toFixed(1)}%
                      </span>

                      <div className="w-24 h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.percentage < 75
                              ? "bg-red-500"
                              : "bg-purple-600"
                          }`}
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.percentage < 75
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-purple-100 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {item.percentage < 75 ? "Shortage" : "Normal"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
          <div className="text-sm font-semibold text-purple-600 uppercase mb-2">
            Total Subjects
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {attendanceSummary.length}{" "}
            <span className="text-lg text-gray-500">Courses</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
          <div className="text-sm font-semibold text-purple-700 uppercase mb-2">
            Safe Attendance
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {
              attendanceSummary.filter((c) => c.percentage >= 75).length
            }{" "}
            <span className="text-lg text-gray-500">Courses</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
          <div className="text-sm font-semibold text-red-600 uppercase mb-2">
            Critical Attention
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {
              attendanceSummary.filter((c) => c.percentage < 75).length
            }{" "}
            <span className="text-lg text-gray-500">Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceTab;