import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-semibold text-gray-700">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'professor') return <Navigate to="/professor-dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student-dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
