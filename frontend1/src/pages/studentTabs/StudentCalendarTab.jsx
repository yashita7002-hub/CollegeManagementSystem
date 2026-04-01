import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function StudentCalendarTab() {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/api/v1/calendar/all");
        setCalendar(res.data.data[0]);
      } catch (err) {
        console.log(err);
        const backendMsg =
          err.response?.data?.message || err.message || "Unknown error";
        setError(`Failed to load academic calendar: ${backendMsg}`);
        setCalendar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  const isPdf = useMemo(() => {
    const url = calendar?.fileUrl || "";
    return url.toLowerCase().endsWith(".pdf");
  }, [calendar?.fileUrl]);

  /* 🔄 Loading */
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100">
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-purple-200 rounded w-1/3" />
          <div className="h-4 bg-purple-100 rounded w-1/4" />
          <div className="h-[550px] bg-purple-50 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ❌ Error */
  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100">
        <h2 className="text-xl font-semibold text-purple-900 mb-3">
          Academic Calendar
        </h2>
        <div className="p-4 rounded-lg border bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  /* 📭 Empty */
  if (!calendar) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-md border border-purple-100 text-center">
        <p className="text-purple-500 text-sm">
          📭 No academic calendar uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        
        <div>
          <h2 className="text-2xl font-bold text-purple-900">
            {calendar.title}
            <span className="ml-2 text-purple-500 text-lg font-medium">
              ({calendar.year})
            </span>
          </h2>
          <p className="text-sm text-purple-500 mt-1">
            View or download the academic calendar
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <a
            href={calendar.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all"
          >
            🔍 Open
          </a>

          <a
            href={calendar.fileUrl}
            download
            className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200 transition"
          >
            ⬇ Download
          </a>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-purple-100">
        {isPdf ? (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(calendar.fileUrl)}&embedded=true`}
            title="Academic Calendar"
            className="w-full h-[600px]"
          />
        ) : (
          <img
            src={calendar.fileUrl}
            alt="Calendar"
            className="w-full object-contain bg-purple-50"
          />
        )}
      </div>
    </div>
  );
}

export default StudentCalendarTab;