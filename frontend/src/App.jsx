import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BatchUpload from './pages/BatchUpload';

function RootRedirect() {
  const token = localStorage.getItem('sapps_token');
  const userJson = localStorage.getItem('sapps_user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Root Redirect based on user credentials */}
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Admin View */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Faculty View */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <Layout>
                <FacultyDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Student View */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected CSV Batch Ingestion View */}
        <Route
          path="/batch-upload"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
              <Layout>
                <BatchUpload />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
