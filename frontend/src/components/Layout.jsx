import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
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
        return 'bg-[#F7F5F2] text-[#111111] border-[#E7E5E4]';
      case 'FACULTY':
        return 'bg-amber-50 text-[#B45309] border-amber-200';
      case 'STUDENT':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-[#F7F5F2] text-[#57534E] border-[#E7E5E4]';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111111] font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E5E4] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#B45309] flex items-center justify-center text-white shadow-sm shadow-[#B45309]/20 group-hover:bg-[#8B5A2B] transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#111111]">
                  SAPPS
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-[#57534E] border-l border-[#E7E5E4] pl-2">
                  Academic Performance Prediction
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#F7F5F2] text-[#B45309] font-bold border border-[#E7E5E4]'
                          : 'text-[#57534E] hover:text-[#111111] hover:bg-[#F7F5F2]'
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
                <div className="flex items-center gap-2 text-sm bg-[#F7F5F2] border border-[#E7E5E4] px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                  <span className="font-semibold text-[#111111]">{user.name || user.email}</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#57534E] hover:text-[#B45309] hover:bg-[#F7F5F2] border border-[#E7E5E4] rounded-lg transition-all"
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
                className="p-2 rounded-lg text-[#57534E] hover:text-[#111111] hover:bg-[#F7F5F2]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E7E5E4] bg-[#FFFFFF] px-4 pt-2 pb-4 space-y-2">
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
                        ? 'bg-[#F7F5F2] text-[#B45309] font-bold border border-[#E7E5E4]'
                        : 'text-[#57534E] hover:bg-[#F7F5F2]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
              {user && (
                <span className="text-xs text-[#57534E]">
                  Signed in as <strong className="text-[#111111]">{user.email}</strong> (
                  {user.role})
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-[#B45309] font-semibold hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFFFF]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#F7F5F2] border-t border-[#E7E5E4] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#57534E] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111111]">SAPPS v1.0</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#B45309] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Explainable AI (Random Forest Architecture)
            </span>
          </div>
          <div>Strict Data Isolation • Early Academic Risk Intervention System</div>
        </div>
      </footer>
    </div>
  );
}
