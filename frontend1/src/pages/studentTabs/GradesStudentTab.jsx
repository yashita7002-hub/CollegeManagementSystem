import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";

function GradesStudentTab() {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/grades/my-grades");
        if (res.data?.success) {
          setGrades(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err);
        setError("Could not load your grades.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGrades();
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center animate-pulse text-purple-600 font-semibold text-lg">Loading Grades...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 m-6 font-medium shadow-sm">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Academic Performance</h2>
          <p className="text-gray-500 mt-2 font-medium">Detailed breakdown of your course grades and marks</p>
        </div>

        {grades.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
             <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5l5 5V19a2 2 0 01-2 2z" /></svg>
             </div>
             <p className="text-gray-500 font-medium">No grades have been uploaded yet for your courses.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grades.map((grade) => (
              <div key={grade._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 bg-purple-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{grade.courseCode?.courseName}</h3>
                    <p className="text-purple-100 text-sm font-medium uppercase tracking-widest">{grade.courseCode?.courseCode}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-2xl text-center">
                    <span className="text-xs uppercase font-bold text-purple-50 block mb-1">Total Score</span>
                    <span className="text-2xl font-black">{grade.totalObtained} / 100</span>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Internals */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Internals</span>
                      <span className="text-purple-600 font-bold">{grade.internals?.obtained} / {grade.internals?.maxMarks}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(grade.internals?.obtained / grade.internals?.maxMarks) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Mid-Sem */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Mid Semester</span>
                      <span className="text-purple-600 font-bold">{grade.midSem?.obtained} / {grade.midSem?.maxMarks}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(grade.midSem?.obtained / grade.midSem?.maxMarks) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* End-Sem */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">End Semester</span>
                      <span className="text-purple-600 font-bold">{grade.endSem?.obtained} / {grade.endSem?.maxMarks}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(grade.endSem?.obtained / grade.endSem?.maxMarks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span>Professor: {grade.professorId?.fullName}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Updated: {new Date(grade.updatedAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GradesStudentTab;
