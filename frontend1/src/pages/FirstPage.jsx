import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FirstPage() {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/jubliee.png" 
          className="w-full h-full object-cover grayscale opacity-70"
          alt=""
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-blue-900/40"></div>

      {/* Card */}
      <div className="relative z-10 bg-white w-[450px] p-8 rounded-xl shadow-2xl text-center">

        {/* Logo */}
        <img src="/NitLogo.jpg" className="w-24 mx-auto mb-4" alt="logo" />

        <h1 className="text-xl font-semibold text-blue-900">NATIONAL INSTITUTE OF TECHNOLOGY</h1>
        <p className="text-sm text-gray-500 mb-4">JAMSHEDPUR</p>

        {/* Radio Buttons */}
        <div className="flex justify-center gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="role" 
              value="student"
              checked={role === 'student'}
              onChange={(e) => setRole(e.target.value)}
              className="accent-blue-600" 
            />
            Student
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="role" 
              value="admin"
              checked={role === 'admin'}
              onChange={(e) => setRole(e.target.value)}
              className="accent-blue-600" 
            />
            Admin
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="role" 
              value="professor"
              checked={role === 'professor'}
              onChange={(e) => setRole(e.target.value)}
              className="accent-blue-600" 
            />
            Professor
          </label>
        </div>

        {/* Button */}
        <button 
          onClick={handleContinue} 
          className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition"
        >
          Continue
        </button>
      </div>

      {/* Footer */}
     <div className="relative z-10 mt-12 text-white text-sm text-center">
  Copyright © 2023,{" "}
  
  <span
    onClick={() => window.open("https://www.nitjsr.ac.in", "_blank")}
    className="cursor-pointer hover:text-blue-400 transition"
  >
    National Institute of Technology
  </span>
  
  , Jamshedpur. All Rights Reserved.
</div>

    </div>
  )
}

export default FirstPage