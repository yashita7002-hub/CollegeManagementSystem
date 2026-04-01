import React, { useState, useEffect, useContext,useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function AttendanceTab() {

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
        console.error("Failed to load student courses:", err);
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
<>
  <div className="overflow-x-auto p-4">
    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-md">
      <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <tr>
          <th className="py-3 px-4 text-left">SI</th>
          <th className="py-3 px-4 text-left">Course Code</th>
          <th className="py-3 px-4 text-left">Course Name</th>
          <th className="py-3 px-4 text-left">Faculty Name</th>
          <th className="py-3 px-4 text-left">Present / Total</th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        <tr className="hover:bg-gray-100 transition">
           {assignedCoursesDetailed.map((course) => (
                  <tr key={course._id}>
                    <td className="p-3 font-semibold">
                      {course.courseCode}
                    </td>
                    <td className="p-3">{course.courseName}</td>
                    
                  </tr>
                ))}
        </tr>
      </tbody>
    </table>
  </div>
</>
  )
}

export default AttendanceTab