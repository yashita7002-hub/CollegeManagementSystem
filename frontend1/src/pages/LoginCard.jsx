import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(location.state?.role ? 2 : 1);
  const [role, setRole] = useState(location.state?.role || "student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  // Update if they navigate back to the page with a new state
  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
      setStep(2);
    }
  }, [location.state]);

  // --- Step Handlers ---
  const handleRoleSelection = (e) => {
    e.preventDefault();
    setStep(2); 
    setError(""); 
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Hit your backend endpoint
      const res = await axios.post("/api/v1/users/login", { username, password, role });
      if (res.status === 200) {
        setStep(3); // Password correct! Move to OTP screen
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/v1/users/verify-otp", { username, otp });
      if (res.status === 200) {
        // Set context
        if (res.data?.user) {
          login(res.data.user);
        }
        // Redirect to the correct exact dashboard
        if (role === "student") navigate("/student-dashboard");
        if (role === "professor") navigate("/professor-dashboard");
        if (role === "admin") navigate("/admin-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
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

        <h1 className="text-xl font-semibold text-blue-900">NATIONAL INSTITUTE OF TECHNOLOGY</h1>
        <p className="text-sm text-gray-500 mb-4">JAMSHEDPUR</p>

        {/* Show Errors (if any) universally at the top of the card */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-medium py-2 px-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* ========================================= */}
        {/* STEP 1: YOUR ORIGINAL ROLE SELECTION UI */}
        {/* ========================================= */}
        {step === 1 && (
          <form onSubmit={handleRoleSelection}>
            {/* Radio Buttons */}
            <div className="flex justify-center gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="student"
                  checked={role === "student"}
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
                  checked={role === "admin"}
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
                  checked={role === "professor"}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-blue-600" 
                />
                Professor
              </label>
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition">
              Continue
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* STEP 2: USERNAME & PASSWORD INPUTS */}
        {/* ========================================= */}
        {step === 2 && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 font-medium">
              Logging in as: <span className="text-blue-900 font-bold capitalize">{role}</span>
            </p>
            
            <input 
              type="text" 
              placeholder="Enter Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
              required 
            />
            
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
              required 
            />
            
            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2.5 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400">
              {loading ? "Checking Credentials..." : "Login"}
            </button>
            
            <div className="flex justify-between items-center mt-2">
              <p 
                className="text-xs text-blue-600 cursor-pointer hover:underline" 
                onClick={() => setStep(1)}
              >
                ← Back to role selection
              </p>
              <Link 
                to="/forgot-password" 
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        )}

        {/* ========================================= */}
        {/* STEP 3: OTP VERIFICATION INPUT */}
        {/* ========================================= */}
        {step === 3 && (
           <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 font-medium">
              A 6-digit OTP has been sent to your email.
            </p>
            
            <input 
              type="text" 
              placeholder="------" 
              maxLength={6}
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-600" 
              required 
            />
            
            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2.5 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400">
              {loading ? "Verifying..." : "Verify & Enter"}
            </button>
          </form>
        )}

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
