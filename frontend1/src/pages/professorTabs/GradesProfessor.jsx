import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GradesProfessor() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [students, setStudents] = useState([]);
  const [gradesData, setGradesData] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await axios.get("/api/v1/courses/professor/my-courses", { withCredentials: true });
        if (res.data?.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    if (!selectedCourse || !selectedBranch) return;
    setLoadingStudents(true);
    setStudents([]);
    try {
      // 1. Fetch Students
      const res = await axios.get(`/api/v1/attendance/students?courseCode=${selectedCourse}&branch=${selectedBranch}`);
      
      // 2. Fetch Existing Grades for Course
      const gradesRes = await axios.get(`/api/v1/grades/course/${selectedCourse}`, { withCredentials: true }).catch(() => null);
      const existingGrades = gradesRes?.data?.data || [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        setStudents(res.data.data);
        const initialGrades = {};
        
        res.data.data.forEach(s => {
          // Find if student has existing grade
          const studentGrade = existingGrades.find(g => g.studentId === s._id);
          
          if (studentGrade) {
            initialGrades[s._id] = { 
              internals: studentGrade.internals?.obtained !== undefined ? studentGrade.internals.obtained : '', 
              midSem: studentGrade.midSem?.obtained !== undefined ? studentGrade.midSem.obtained : '', 
              endSem: studentGrade.endSem?.obtained !== undefined ? studentGrade.endSem.obtained : '' 
            };
          } else {
            initialGrades[s._id] = { internals: '', midSem: '', endSem: '' };
          }
        });
        setGradesData(initialGrades);
      }
    } catch (err) {
      console.error("Failed to fetch students/grades:", err);
      alert("Error fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGradesData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const submitGrade = async (studentId) => {
    const grad = gradesData[studentId];
    const internals = Number(grad.internals) || 0;
    const midSem = Number(grad.midSem) || 0;
    const endSem = Number(grad.endSem) || 0;
    const total = internals + midSem + endSem;

    if (!selectedCourse) return alert("Select a course first");

    try {
      const payload = {
        studentId,
        courseCode: selectedCourse,
        internalsObtained: internals,
        midSemObtained: midSem,
        endSemObtained: endSem,
        totalObtained: total
      };

      const res = await axios.post("/api/v1/grades/upload", payload, { withCredentials: true });
      if (res.data?.success) {
        alert("Grades updated successfully");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update grades");
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Grade Assessment</h2>
          <p className="text-emerald-600 mt-2 font-medium">Upload and manage marks for your students</p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none rounded-xl font-medium"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Select Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none rounded-xl font-medium"
            >
              <option value="">-- Choose Branch --</option>
              <option value="CSE">CSE</option>
              <option value="ECM">ECM</option>
              <option value="MSC">MSC</option>
              <option value="BSC">BSC</option>
            </select>
          </div>
          <button 
            onClick={fetchStudents}
            disabled={!selectedCourse || !selectedBranch || loadingStudents}
            className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold transition shadow-lg ${(!selectedCourse || !selectedBranch) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
          >
            {loadingStudents ? "Loading..." : "Fetch Students"}
          </button>
        </div>

        {/* Students List */}
        {students.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
               <h3 className="font-bold text-emerald-900">Student Roster</h3>
               <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">{students.length} Students</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-widest">
                    <th className="p-4 font-bold">Student Info</th>
                    <th className="p-4 font-bold text-center w-32">Internals (20)</th>
                    <th className="p-4 font-bold text-center w-32">Mid Sem (30)</th>
                    <th className="p-4 font-bold text-center w-32">End Sem (50)</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{student.fullName}</div>
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest">{student.branch} • Year {student.year}</div>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={gradesData[student._id]?.internals || ''}
                          onChange={(e) => handleGradeChange(student._id, 'internals', e.target.value)}
                          max="20"
                          min="0"
                          placeholder="0"
                          className="w-full text-center p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={gradesData[student._id]?.midSem || ''}
                          onChange={(e) => handleGradeChange(student._id, 'midSem', e.target.value)}
                          max="30"
                          min="0"
                          placeholder="0"
                          className="w-full text-center p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={gradesData[student._id]?.endSem || ''}
                          onChange={(e) => handleGradeChange(student._id, 'endSem', e.target.value)}
                          max="50"
                          min="0"
                          placeholder="0"
                          className="w-full text-center p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => submitGrade(student._id)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 px-4 rounded-lg text-sm transition"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradesProfessor;