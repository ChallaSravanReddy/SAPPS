import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BatchUpload from './pages/BatchUpload';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

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

        {/* Fallback to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

