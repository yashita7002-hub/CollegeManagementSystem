import React from 'react'
import { useState,useEffect } from 'react';
import axios from "axios";



function StudentCalendarTab() {

    const [calendar, setCalendar] = useState(null);

    useEffect(()=>{
        const fetchCalendar = async () =>{
          try{
            const res = await axios.get("/api/v1/calendar/all");
            setCalendar(res.data.data[0]);
          }catch(err){
            console.log(err);
          }
        };

        fetchCalendar();
  },[]);


  if(!calendar) return <div>LOADING....</div>;

  return(
  <>
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        {calendar.title} ({calendar.year})
      </h2>

      {/* If PDF */}
      {calendar.fileUrl.endsWith(".pdf") ? (
        <iframe
          src={calendar.fileUrl}
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

export default StudentCalendarTab