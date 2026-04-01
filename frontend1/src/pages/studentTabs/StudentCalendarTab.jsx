
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";



function StudentCalendarTab() {

 const [calendar, setCalendar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=>{
        const fetchCalendar = async () =>{
          try{
            setLoading(true);
            setError("");
            const res = await axios.get("/api/v1/calendar/all");
            setCalendar(res.data.data[0]);
          }catch(err){
            console.log(err);
            const backendMsg = err.response?.data?.message || err.message || "Unknown error";
            setError(`Failed to load academic calendar: ${backendMsg}`);
            setCalendar(null);
          } finally {
            setLoading(false);
          }
        };

        fetchCalendar();
  },[]);

  const isPdf = useMemo(() => {
    const url = calendar?.fileUrl || "";
    return url.toLowerCase().endsWith(".pdf");
  }, [calendar?.fileUrl]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-[520px] bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Academic Calendar
        </h2>
        <div className="p-3 rounded-md border bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  if(!calendar) return <div className="text-gray-600">No calendar uploaded yet.</div>;

  return(
  <>
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {calendar.title}{" "}
            <span className="text-gray-500 font-medium">({calendar.year})</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            View or download the latest academic calendar.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={calendar.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Open
          </a>
          <a
            href={calendar.fileUrl}
            download
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
          >
            Download
          </a>
        </div>
      </div>

      {/* If PDF */}
      {isPdf ? (
        <iframe
          src={calendar.fileUrl}
          title="Academic Calendar"
          className="w-full h-[600px] border rounded-lg"
        />
      ) : (
        /* If Image */
        <img
          src={calendar.fileUrl}
          alt="Calendar"
          className="w-full rounded-lg border"
        />
      )}
    </div>
  
  
  
  
  
  
  
  </>
  )
}

export default StudentCalendarTab