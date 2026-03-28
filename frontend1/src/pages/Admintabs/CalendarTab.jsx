import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CalendarTab() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/calendar/all");
      setCalendars(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch calendars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('year', year);
    formData.append('file', file);

    try {
      setUploading(true);
      await axios.post("/api/v1/calendar/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setTitle('');
      setYear('');
      setFile(null);
      fetchCalendars();
    } catch (err) {
      alert("Failed to upload calendar: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this calendar?")) {
      try {
        await axios.delete(`/api/v1/calendar/delete/${id}`, { withCredentials: true });
        fetchCalendars();
      } catch (err) {
        alert("Failed to delete calendar: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Section */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Calendar</h2>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Spring 2024 Final" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <input required value={year} onChange={e => setYear(e.target.value)} type="number" placeholder="2024" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF Document *</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input type="file" className="sr-only" onChange={e => setFile(e.target.files[0])} accept="application/pdf,image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : "PNG, JPG, PDF up to 10MB"}</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4 disabled:bg-blue-300">
            {uploading ? "Uploading to Cloudinary..." : "Publish Calendar"}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Published Calendars</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading calendars...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {calendars.map(c => (
              <div key={c._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <p className="text-sm text-gray-500">Academic Year {c.year} • Published on {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    View Document
                  </a>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Delete Calendar">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {calendars.length === 0 && (
              <div className="p-8 text-center text-gray-500">No calendars published yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
