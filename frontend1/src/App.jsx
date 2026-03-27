import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import your components and pages
import LoginCard from "./pages/LoginCard"; 
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Automatically redirect people from the root URL to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* The Login & 2FA Component we just built */}
        <Route path="/login" element={<LoginCard />} />
        
        {/* The Protected Dashboards */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Catch-all for 404 Pages */}
        <Route path="*" element={<h1 className="text-center mt-20 text-2xl">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
