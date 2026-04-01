import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CoursesAllotedTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/v1/courses/professor/my-courses", { withCredentials: true });
        if (res.data?.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch allotted courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleViewDetails = async (courseCode) => {
    try {
      const res = await axios.get(`/api/v1/courses/${courseCode}`, { withCredentials: true });
      if (res.data?.success) {
        setSelectedCourseDetails(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch course details:", err);
      alert("Failed to load course details. Make sure the API exists.");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-emerald-900 tracking-tight">Allotted Courses</h2>
          <p className="text-emerald-600 mt-2 font-medium">Manage and view the courses assigned to you</p>
        </div>

        {loading ? (
          <div className="p-8 text-center animate-pulse text-emerald-600 font-semibold text-lg">Loading Courses...</div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="text-gray-500 font-medium">No courses have been allotted to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((code, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                  <h3 className="text-2xl font-black tracking-wider">{code}</h3>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-sm font-medium mb-4">Assigned to you for the current academic session.</p>
                  <button 
                    onClick={() => handleViewDetails(code)}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl group-hover:bg-emerald-100 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Course Details */}
        {selectedCourseDetails && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
                 <h2 className="text-2xl font-black tracking-wider flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    {selectedCourseDetails.courseCode}
                 </h2>
                 <button onClick={() => setSelectedCourseDetails(null)} className="bg-emerald-700 hover:bg-emerald-800 p-2 rounded-full transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Course Name</label>
                    <p className="text-lg font-bold text-gray-900">{selectedCourseDetails.courseName}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Credits</label>
                       <p className="text-xl font-black text-emerald-600">{selectedCourseDetails.credits}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Status</label>
                       <p className="text-xl font-black text-emerald-600">Active</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <button onClick={() => setSelectedCourseDetails(null)} className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">
                    Close
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesAllotedTab;