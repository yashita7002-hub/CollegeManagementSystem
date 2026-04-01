import React from 'react'
import { useState,useEffect } from 'react';
import axios from "axios";



function ProfessorCalendarTab() {

    const [calendar, setCalendar] = useState(null);

    useEffect(()=>{
        const fetchCalendar = async () =>{
          try{
            const res = await axios.get("/api/v1/calendar/all");
            if (res.data?.data && res.data.data.length > 0) {
              setCalendar(res.data.data[0]);
            } else {
              setCalendar("empty");
            }
          }catch(err){
            console.log(err);
          }
        };

        fetchCalendar();
  },[]);


  if (!calendar) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-emerald-100 rounded"></div>
      </div>
    </div>
  );

  if (calendar === "empty") return (
    <div className="bg-white rounded-3xl border border-dashed border-emerald-200 p-20 text-center shadow-sm">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
      <h3 className="text-gray-900 font-bold text-xl">No Calendar Published</h3>
      <p className="text-gray-500 mt-2 font-medium">The administration has not uploaded the academic calendar for this session yet.</p>
    </div>
  );

  return(
  <>
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {calendar.title} ({calendar.year})
        </h2>
        <a 
          href={calendar.fileUrl} 
          target="_blank" 
          rel="noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
        >
          Open in New Tab
        </a>
      </div>

      {/* If PDF */}
      {calendar.fileUrl.toLowerCase().endsWith(".pdf") ? (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(calendar.fileUrl)}&embedded=true`}
          title="Academic Calendar"
          className="w-full h-[600px] border rounded"
        />
      ) : (
        /* If Image */
        <img
          src={calendar.fileUrl}
          alt="Calendar"
          className="w-full rounded"
        />
      )}
    </div>
  
  
  
  
  
  
  
  </>
  )
}

export default ProfessorCalendarTab