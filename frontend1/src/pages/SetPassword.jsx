import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.patch(`/api/v1/users/set-password/${token}`, { password });
      if (res.status === 200) {
        setMessage(res.data.message || "Password set successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set password. Token might be expired.");
    } finally {
      setLoading(false);
    }
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

        <h1 className="text-xl font-semibold text-blue-900">Set New Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-medium py-2 px-4 rounded mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 text-green-600 text-sm font-medium py-2 px-4 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="New Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
            required 
            minLength={6}
          />
          
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
            required 
            minLength={6}
          />
          
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2.5 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400">
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-12 text-white text-sm text-center">
        Copyright © 2023,{" "}
        <a
          href="https://www.nitjsr.ac.in"
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer hover:text-blue-400 transition"
        >
          National Institute of Technology
        </a>
        , Jamshedpur. All Rights Reserved.
      </div>
    </div>
  );
}
