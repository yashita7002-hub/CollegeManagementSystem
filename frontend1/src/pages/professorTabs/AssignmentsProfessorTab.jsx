import React, { useState, useEffect } from "react";
import axios from "axios";

function AssignmentsTab() {
  const [view, setView] = useState("upload"); // "upload" or "evaluate"
  const [courseCode, setCourseCode] = useState("");
  const [branch, setBranch] = useState("");
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  
  // Evaluation state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/v1/courses/all");
        const courseCodes = res.data.data.map((course) => course.courseCode);
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
      formData.append("branch", branch);

      if (file) {
        formData.append("file", file);
      }

      const res = await axios.post("/api/v1/assignments/create", formData, {
        withCredentials: true,
      });

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

  const handleDeleteAssignment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        const res = await axios.delete(`/api/v1/assignments/${id}`, { withCredentials: true });
        if (res.data.success) {
          fetchAssignments();
          alert("Assignment deleted successfully");
        }
      } catch (err) {
        console.error("Failed to delete assignment", err);
      }
    }
  };

  const handleSelectAssignmentForEvaluation = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    setEvaluatingSubmission(null);
    try {
      const res = await axios.get(`/api/v1/submissions/assignment/${assignment._id}`);
      setSubmissions(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleEvaluate = async () => {
    if (!marks) return alert("Please enter marks");
    try {
      const res = await axios.patch(`/api/v1/submissions/evaluate/${evaluatingSubmission._id}`, {
        marksObtained: marks,
        feedback: feedback
      });
      if (res.data.success) {
        alert("Evaluated successfully!");
        // Update local status
        setSubmissions(submissions.map(s => s._id === evaluatingSubmission._id ? {...s, marksObtained: marks, feedback: feedback} : s));
        setEvaluatingSubmission(null);
        setMarks("");
        setFeedback("");
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    }
  };

  const isFormValid = courseCode && branch && title && description && deadline;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-800">
          Assignment Management
        </h2>

        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setView("upload")}
            className={`px-4 py-2 rounded-md font-medium transition ${
              view === "upload" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-emerald-700"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setView("evaluate")}
            className={`px-4 py-2 rounded-md font-medium transition ${
              view === "evaluate" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-emerald-700"
            }`}
          >
            Evaluate
          </button>
        </div>
      </div>

      {view === "upload" ? (
        <>
          {/* Filters Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 space-y-4">
            <h3 className="font-semibold text-emerald-800">Select Target Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">Select Course</option>
                {courses.map((code, i) => (
                  <option key={i} value={code}>{code}</option>
                ))}
              </select>

              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 space-y-4">
            <h3 className="font-semibold text-emerald-800">Create New Assignment</h3>
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer hover:bg-emerald-50 transition" onClick={() => document.getElementById('assign-file').click()}>
              <input
                id="assign-file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <svg className="w-10 h-10 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-4 4m4 4V4" />
                </svg>
                <p className="text-emerald-700 font-medium">{file ? file.name : "Click to select assignment file"}</p>
                <p className="text-xs text-emerald-500 mt-1">PDF or Doc preferred</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
              />
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">Deadline:</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>

            <textarea
              placeholder="Enter instructions / description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <button
              disabled={!isFormValid}
              onClick={handleCreate}
              className={`w-full py-4 rounded-xl text-white font-bold transition shadow-lg ${
                isFormValid ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Post Assignment
            </button>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 space-y-4">
            <h3 className="font-semibold text-emerald-800">Recent Postings</h3>
            <div className="space-y-3">
              {assignments.length > 0 ? (
                assignments.map((assign) => (
                  <div key={assign._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-emerald-50/30 transition">
                    <div>
                      <h4 className="font-bold text-gray-800">{assign.title}</h4>
                      <div className="flex gap-2 mt-1">
                         <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">{assign.courseCode}</span>
                         <span className="text-xs text-gray-500">Deadline: {new Date(assign.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAssignment(assign._id)}
                      className="text-gray-400 hover:text-red-500 p-2 transition"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 italic">No assignments posted yet.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-emerald-900 mb-4">Posted Assignments</h3>
                <div className="space-y-2">
                   {assignments.map(a => (
                     <button 
                        key={a._id}
                        onClick={() => handleSelectAssignmentForEvaluation(a)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition ${selectedAssignment?._id === a._id ? 'bg-emerald-100 border-emerald-200 text-emerald-700 font-bold' : 'hover:bg-gray-50 text-gray-600 border border-transparent'}`}
                      >
                        {a.title}
                     </button>
                   ))}
                </div>
             </div>

             {selectedAssignment && (
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-emerald-900 mb-4">Submissions</h3>
                  {loadingSubmissions ? <p className="text-gray-400 text-center py-4">Loading Submissions...</p> : (
                    <div className="space-y-2">
                       {submissions.length === 0 ? <p className="text-gray-400 text-center py-4">No submissions yet.</p> : submissions.map(s => (
                         <button 
                           key={s._id}
                           onClick={() => {
                             setEvaluatingSubmission(s);
                             setMarks(s.marksObtained || "");
                             setFeedback(s.feedback || "");
                           }}
                           className={`w-full text-left p-3 rounded-lg text-sm transition border ${evaluatingSubmission?._id === s._id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-50 hover:bg-gray-50'}`}
                         >
                           <div className="font-bold">{s.studentId?.fullName}</div>
                           <div className="text-xs text-gray-500 flex justify-between mt-1">
                             <span>@{s.studentId?.userId?.username}</span>
                             <span className={s.marksObtained !== undefined ? 'text-emerald-600 font-bold' : 'text-orange-500'}>
                               {s.marksObtained !== undefined ? 'Graded' : 'Pending'}
                             </span>
                           </div>
                         </button>
                       ))}
                    </div>
                  )}
               </div>
             )}
          </div>

          {/* Evaluation Panel */}
          <div className="lg:col-span-2">
            {evaluatingSubmission ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                   <div>
                      <h3 className="text-lg font-bold text-gray-900">{evaluatingSubmission.studentId?.fullName}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{evaluatingSubmission.studentId?.branch} | Year {evaluatingSubmission.studentId?.year}</p>
                   </div>
                   <a 
                     href={evaluatingSubmission.submissionUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5l5 5V19a2 2 0 01-2 2z" /></svg>
                     View PDF
                   </a>
                </div>

                <div className="p-8 space-y-6">
                   <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Student Note</h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm italic">
                        {evaluatingSubmission.description || "No note provided."}
                      </p>
                   </div>

                   <hr className="border-gray-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Marks Obtained (Max 100)</label>
                        <input 
                          type="number"
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none rounded-xl font-bold"
                          placeholder="e.g. 85"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Internal Feedback</label>
                        <textarea 
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none rounded-xl h-32 resize-none text-sm"
                          placeholder="Great work, keep it up!"
                        />
                      </div>
                   </div>

                   <button 
                     onClick={handleEvaluate}
                     className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-50 transition"
                   >
                     Submit Evaluation
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 </div>
                 <h3 className="text-gray-900 font-bold">Ready to evaluate?</h3>
                 <p className="text-gray-500 text-sm mt-2">Select an assignment and submission to start grading.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsTab;