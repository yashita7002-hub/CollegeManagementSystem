import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssignCourses() {


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

  fetchUsers();
}, []);


const handleAssign = async () => {

    const usersList = role === "STUDENT" ? students : professors;

const userObj = usersList.find(u => u._id === selectedUser);
  if (!role || !selectedCourse || !selectedUser) {
    alert("Please fill all fields");
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

    alert("Assigned successfully ✅");

    setRole("");
    setSelectedCourse("");
    setSelectedUser("");

    fetchCourses();
  } catch (err) {
    console.error(err);
    alert("Assignment failed ❌");
  }
}
  return (
    <div><div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">

  <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
    ASSIGN COURSES
  </h2>

  <div className="grid grid-cols-4 gap-4 items-end">

    {/* Role */}
    <div>
      <label className="block text-sm mb-1">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select Role</option>
        <option value="STUDENT">Student</option>
        <option value="PROFESSOR">Professor</option>
      </select>
    </div>

    {/* Course */}
    <div>
      <label className="block text-sm mb-1">Course</label>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select Course</option>
        {courses.map(c => (
          <option key={c._id} value={c.courseCode}>
  {c.courseCode}
</option>
        ))}
      </select>
    </div>

    {/* User */}
    <div>
      <label className="block text-sm mb-1">User</label>
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select User</option>

        {(role === "STUDENT" ? students : professors).map(u => (
         <option key={u._id} value={u._id}>
          {u.username}
        </option>
        ))}
      </select>
    </div>

    {/* Button */}
    <div>
      <button
        onClick={handleAssign}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Assign
      </button>
    </div>

  </div>
</div>
    </div>
  )
}

export default AssignCourses