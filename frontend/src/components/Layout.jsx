import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UploadCloud,
  LogOut,
  UserCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userJson = localStorage.getItem('sapps_user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('sapps_token');
    localStorage.removeItem('sapps_user');
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Analytics Overview', icon: LayoutDashboard },
        { to: '/faculty', label: 'Student Directory', icon: Users },
        { to: '/batch-upload', label: 'CSV Batch Ingestion', icon: UploadCloud },
      ];
    }

    if (user.role === 'FACULTY') {
      return [
        { to: '/faculty', label: 'Student Performance Roster', icon: Users },
        { to: '/batch-upload', label: 'Batch Assessment Upload', icon: UploadCloud },
        { to: '/admin', label: 'Class Insights & Analytics', icon: LayoutDashboard },
      ];
    }

    if (user.role === 'STUDENT') {
      return [
        { to: '/student', label: 'My Academic Standing', icon: UserCheck },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
                  SAPPS
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-300 pl-2">
                  Academic Performance Prediction
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-800">{user.name || user.email}</span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {user && (
                <span className="text-xs text-slate-600">
                  Signed in as <strong className="text-slate-800">{user.email}</strong> (
                  {user.role})
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SAPPS v1.0</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Explainable AI (Random Forest + Feature Attribution)
            </span>
          </div>
          <div>Strict Data Isolation • Early Academic Risk Intervention System</div>
        </div>
      </footer>
    </div>
  );
}

