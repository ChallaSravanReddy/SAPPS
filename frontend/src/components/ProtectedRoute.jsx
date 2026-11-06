import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem('sapps_token');
  const userJson = localStorage.getItem('sapps_user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their respective authorized home page
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

