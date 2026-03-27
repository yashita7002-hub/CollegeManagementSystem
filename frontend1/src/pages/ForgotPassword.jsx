import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/api/v1/users/forgotPassword", { email });
      if (res.status === 200) {
        setMessage(res.data.message || "Password reset link sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
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

        <h1 className="text-xl font-semibold text-blue-900">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link.</p>

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
            type="email" 
            placeholder="Enter Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
            required 
          />
          
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2.5 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          
          <Link to="/login" className="text-xs text-blue-600 mt-2 hover:underline">
            ← Back to Login
          </Link>
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
