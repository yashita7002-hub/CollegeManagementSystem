import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CoursesTab() {

  const [activeTab, setActiveTab] = useState("CREATE"); // 
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [role, setRole] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);

  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    credits: ''
  });

  // ================= FETCH =================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/courses/all");
      setCourses(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/v1/users/all");

      setStudents(res.data.data.filter(u => u.role === "student"));
      setProfessors(res.data.data.filter(u => u.role === "professor"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  // ================= CREATE =================
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/v1/courses/create", formData);
      setIsModalOpen(false);
      setFormData({ courseName: '', courseCode: '', credits: '' });
      fetchCourses();
    } catch (err) {
      alert("Creation failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (courseCode) => {
    if (!window.confirm(`Delete ${courseCode}?`)) return;

    await axios.delete(`/api/v1/courses/delete/${courseCode}`);
    fetchCourses();
  };

  // ================= ASSIGN =================
  const handleAssign = async () => {
    if (!role || !selectedCourse || !selectedUser) {
      alert("Fill all fields");
      return;
    }

    try {
      if (role === "STUDENT") {
        await axios.post("/api/v1/courses/assign/student", {
          courseCode: selectedCourse,
          studentId: selectedUser,
        });
      } else {
        await axios.post("/api/v1/courses/assign/professor", {
          courseCode: selectedCourse,
          professorId: selectedUser,
        });
      }

      alert("Assigned ✅");

      setRole("");
      setSelectedCourse("");
      setSelectedUser("");

    } catch {
      alert("Assignment failed ❌");
    }
  };



  const handleSearch = async () => {
  if (!searchUsername) {
    alert("Enter username");
    return;
  }

  try {
    const res = await axios.post(`/api/v1/courses/assignedCourses`, { username: searchUsername });
    setSearchResult(res.data.data);
  } catch (err) {
    alert("User not found ❌");
    setSearchResult(null);
  }
};

console.log(selectedUser)
  return (
    <div>

      {/* 🔥 DROPDOWN / TAB SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "CREATE" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Create Courses
        </button>

        <button
          onClick={() => setActiveTab("ASSIGN")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "ASSIGN" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Assign Courses
        </button>
      </div>

      {/* ================= CREATE COURSE UI ================= */}
      {activeTab === "CREATE" && (
        <div className="bg-white rounded-xl shadow border">

          <div className="p-6 flex justify-between">
            <h2 className="font-semibold text-lg">Create Courses</h2>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Course
            </button>
          </div>

          {loading ? (
            <p className="p-6">Loading...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td className="p-4">{c.courseCode}</td>
                    <td>{c.courseName}</td>
                    <td>{c.credits}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.courseCode)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= ASSIGN COURSE UI ================= */}
      {activeTab === "ASSIGN" && (
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold mb-6 text-center">
            Assign Courses
          </h2>

          <div className="grid grid-cols-4 gap-4">

            <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded">
              <option value="">Role</option>
              <option value="STUDENT">Student</option>
              <option value="PROFESSOR">Professor</option>
            </select>

            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="p-2 border rounded">
              <option value="">Course</option>
              {courses.map(c => (
                <option key={c._id} value={c.courseCode}>
                  {c.courseCode}
                </option>
              ))}
            </select>

            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="p-2 border rounded">
              <option value="">User</option>

              {(role === "STUDENT" ? students : professors).map(u => (
                <option key={u._id} value={u._id}>
                  { u.username}
                </option>
              ))}
            </select>

            <button onClick={handleAssign} className="bg-blue-600 text-white rounded">
              Assign
            </button>

          </div>
  {/* ================= SEARCH USER COURSES ================= */}
<div className="mt-10 border-t pt-6">

  <h3 className="text-md font-semibold mb-4 text-center">
    Search User Courses
  </h3>

  <div className="flex gap-4 justify-center">

    <input
      type="text"
      placeholder="Enter username"
      value={searchUsername}
      onChange={(e) => setSearchUsername(e.target.value)}
      className="p-2 border rounded w-[250px]"
    />

    <button
      onClick={handleSearch}
      className="bg-green-600 text-white px-4 rounded"
    >
      Search
    </button>

  </div>

  {/* RESULT */}
  {searchResult && (
    <div className="mt-6 bg-gray-50 p-4 rounded">

      <h4 className="font-semibold mb-2">
        {searchResult.user.username} ({searchResult.user.role})
      </h4>

      {searchResult.courses.length === 0 ? (
        <p className="text-gray-500">No courses assigned</p>
      ) : (
        <ul className="list-disc ml-6">
          {searchResult.courses.map((c, index) => (
            <li key={index}>{c}</li>
          ))}
        </ul>
      )}

    </div>
  )}

</div>
          
        </div>

        
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-[400px]">

            <h2 className="text-lg font-bold mb-4">Create Course</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="Code" value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <input placeholder="Name" value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <input type="number" placeholder="Credits" value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <button className="w-full bg-black text-white py-2 rounded">
                Create
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}