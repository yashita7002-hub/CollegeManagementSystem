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
      if (res.data?.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
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

      const res = await axios.post(
        "/api/v1/submissions/submit",
        formData
      );

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

  const isDue = (deadline) =>
    new Date(deadline) > new Date();

  if (loading)
    return (
      <div className="p-8 text-center text-purple-600 font-semibold">
        Loading Assignments...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border">
        {error}
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-purple-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold text-purple-900">
              Assignment Portal
            </h2>
            <p className="text-purple-600 mt-2">
              Manage your coursework and submissions
            </p>
          </div>

          <div className="bg-white border border-purple-100 px-6 py-4 rounded-xl flex gap-3 items-center">
            <div className="bg-purple-100 text-purple-700 w-10 h-10 flex items-center justify-center rounded-lg font-bold">
              {assignments.length}
            </div>
            <span className="text-purple-700 text-xs font-bold uppercase">
              Total
            </span>
          </div>
        </div>

        {/* Empty */}
        {assignments.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl shadow-sm border border-purple-100">
            No assignments available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((a) => {
              const due = isDue(a.deadline);

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition"
                >
                  <div className="p-6">
                    
                    {/* Top */}
                    <div className="flex justify-between mb-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 text-xs rounded-lg font-bold">
                        {a.courseCode}
                      </span>
                      <span className={`text-xs font-bold ${
                        due ? "text-purple-700" : "text-gray-400"
                      }`}>
                        {due ? "Active" : "Closed"}
                      </span>
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
                        Reference Material
                      </a>
                    )}

                    <button
                      onClick={() => openSubmissionModal(a)}
                      className="bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                    >
                      Submit Work
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-2xl w-full max-w-md">
              
              {/* Header */}
              <div className="bg-purple-700 text-white p-4 flex justify-between">
                <h3 className="font-bold">Submit Assignment</h3>
                <button onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {mySubmission && (
                  <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-700">
                    Updating previous submission
                  </div>
                )}

                {/* File */}
                <input type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} />

                {/* Desc */}
                <textarea
                  placeholder="Add note..."
                  value={submissionDesc}
                  onChange={(e) => setSubmissionDesc(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                />

                {/* Buttons */}
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
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg"
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