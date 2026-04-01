import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function CoursesAllotedTab() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allCourses, setAllCourses] = useState([]);
  const [assignedCourseCodes, setAssignedCourseCodes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const coursesRes = await axios.get("/api/v1/courses/all");
        const courses = coursesRes.data?.data || [];
        setAllCourses(courses);

        if (!user?.username) {
          setAssignedCourseCodes([]);
          return;
        }

        const assignedRes = await axios.post(
          "/api/v1/courses/assignedCourses",
          { username: user.username }
        );

        const payload = assignedRes.data?.data;
        const codes = Array.isArray(payload?.courses) ? payload.courses : [];
        setAssignedCourseCodes(codes);
      } catch (err) {
        console.error("Failed to load professor courses:", err);
        const backendMsg =
          err.response?.data?.message || err.message || "Unknown error";
        setError(`Failed to load courses: ${backendMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.username]);

  const assignedCoursesDetailed = useMemo(() => {
    return assignedCourseCodes
      .map((code) => allCourses.find((c) => c.courseCode === code))
      .filter(Boolean);
  }, [assignedCourseCodes, allCourses]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-purple-100 pb-4">
        <h2 className="text-2xl font-bold text-purple-800">
          My Courses
        </h2>

        <span className="text-sm text-gray-500">
          {user?.username ? (
            <>
              Showing courses for{" "}
              <span className="font-semibold text-purple-700">
                {user.username}
              </span>
            </>
          ) : (
            "Loading profile..."
          )}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 border rounded-md bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 text-center text-gray-500">
          Loading courses...
        </div>
      ) : assignedCoursesDetailed.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 text-center text-gray-500">
          You are not enrolled in any courses
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-5">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-4 border-b border-purple-100 pb-3">
            <h3 className="font-semibold text-purple-700">
              Courses Allotted
            </h3>

            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200">
              {assignedCoursesDetailed.length} Courses
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-purple-600 to-violet-700 text-white">
                <tr>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Course Name</th>
                  <th className="p-3">Credits</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-50 text-gray-700">
                {assignedCoursesDetailed.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-purple-50/40 transition"
                  >
                    <td className="p-3 font-semibold text-purple-700">
                      {course.courseCode}
                    </td>

                    <td className="p-3 font-medium">
                      {course.courseName}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold">
                        {course.credits} Credits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesAllotedTab;