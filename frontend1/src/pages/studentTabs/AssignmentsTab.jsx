import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function AssignmentsTab() {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionDesc, setSubmissionDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/assignments/student/assignments");
      if (res.data?.success) setAssignments(res.data.data);
    } catch {
      setError("Could not load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user]);

  const openSubmissionModal = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
    setSubmissionFile(null);
    setSubmissionDesc("");
    setMySubmission(null);

    try {
      const res = await axios.get(
        `/api/v1/submissions/student/my-submission/${assignment._id}`
      );
      if (res.data?.data) {
        setMySubmission(res.data.data);
        setSubmissionDesc(res.data.data.description || "");
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile && !mySubmission) {
      alert("Please upload a file");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment._id);
      formData.append("description", submissionDesc);
      if (submissionFile) formData.append("submissionFile", submissionFile);

      const res = await axios.post("/api/v1/submissions/submit", formData);

      if (res.data?.success) {
        alert("Submitted successfully!");
        setIsModalOpen(false);
      }
    } catch {
      alert("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDue = (deadline) => new Date(deadline) > new Date();

  /* Loading */
  if (loading)
    return (
      <div className="p-10 text-center text-purple-600 font-semibold">
        Loading Assignments...
      </div>
    );

  /* Error */
  if (error)
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Assignment Portal
            </h2>
            <p className="text-purple-600 mt-2">
              Manage your coursework and submissions
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 border border-purple-100 px-6 py-4 rounded-2xl flex gap-3 items-center shadow">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-lg font-bold">
              {assignments.length}
            </div>
            <span className="text-purple-700 text-xs font-bold uppercase">
              Total
            </span>
          </div>
        </div>

        {/* Empty */}
        {assignments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md p-10 text-center rounded-2xl shadow border border-purple-100">
            No assignments available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((a) => {
              const due = isDue(a.deadline);

              return (
                <div
                  key={a._id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 shadow hover:shadow-xl hover:-translate-y-1 transition flex flex-col"
                >
                  <div className="p-6 flex-1">

                    {/* Top */}
                    <div className="flex justify-between mb-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 text-xs rounded-lg font-bold">
                        {a.courseCode}
                      </span>

                      <div className="flex gap-2">
                        {a.submission?.marksObtained !== undefined && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 text-[10px] rounded-lg font-extrabold uppercase">
                            Graded
                          </span>
                        )}
                        <span className={`text-xs font-bold ${
                          due ? "text-purple-700" : "text-gray-400"
                        }`}>
                          {due ? "Active" : "Closed"}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {a.title}
                    </h3>

                    {/* Description */}
                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {a.description}
                      </p>
                    </div>

                    {/* Deadline */}
                    <div className="flex justify-between text-xs text-gray-500 border-t pt-3">
                      <span>Due</span>
                      <span className="text-purple-700 font-bold">
                        {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t flex flex-col gap-2">
                    {a.mediaUrl && (
                      <a
                        href={a.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-purple-200 text-purple-700 text-center py-2 rounded-lg text-sm font-semibold hover:bg-purple-50"
                      >
                        📄 Reference Material
                      </a>
                    )}

                    <button
                      onClick={() => openSubmissionModal(a)}
                      className={`${
                        a.submission?.marksObtained !== undefined
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
                      } text-white py-2 rounded-lg font-semibold transition`}
                    >
                      {a.submission?.marksObtained !== undefined
                        ? "View Result"
                        : "Submit Work"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between rounded-t-2xl">
                <h3 className="font-bold">Submit Assignment</h3>
                <button onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {mySubmission && mySubmission.marksObtained !== undefined && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex justify-between">
                      <span className="font-bold text-green-900">
                        Result
                      </span>
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        {mySubmission.marksObtained}/100
                      </span>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  className="w-full border border-purple-200 rounded-lg p-2"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                />

                <textarea
                  placeholder="Add note..."
                  value={submissionDesc}
                  onChange={(e) => setSubmissionDesc(e.target.value)}
                  className="w-full border border-purple-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 py-2 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg"
                  >
                    {isSubmitting ? "Uploading..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentsTab;