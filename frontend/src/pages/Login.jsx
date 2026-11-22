import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, ShieldAlert, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.prefillEmail || 'faculty@sapp.edu');
  const [password, setPassword] = useState(location.state?.prefillPassword || 'Faculty@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'Faculty',
      email: 'faculty@sapp.edu',
      password: 'Faculty@123',
      desc: 'Evaluate student cohorts & manage assessments',
      badge: 'bg-amber-100 text-[#B45309] border-amber-200',
    },
    {
      role: 'Admin',
      email: 'admin@sapp.edu',
      password: 'Admin@123',
      desc: 'Institutional analytics & model governance',
      badge: 'bg-stone-200 text-[#111111] border-[#E7E5E4]',
    },
    {
      role: 'Student',
      email: 'student@sapp.edu',
      password: 'Student@123',
      desc: 'Personal academic report & guidance',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const data = await authApi.login(trimmedEmail, cleanPassword);

      // Save token and user details to localStorage
      localStorage.setItem('sapps_token', data.access_token);
      localStorage.setItem(
        'sapps_user',
        JSON.stringify({
          id: data.user_id,
          email: data.email,
          role: data.role,
          name: data.name,
          student_id: data.student_id,
          faculty_id: data.faculty_id,
        })
      );

      // Direct to respective role dashboard
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.role === 'FACULTY') {
        navigate('/faculty');
      } else if (data.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      let detail = 'Invalid email or password. Please verify your credentials.';
      if (err.response?.data?.detail) {
        detail = err.response.data.detail;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        detail = 'Cannot reach backend API. Please ensure the backend server is running.';
      }
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Warm Ambient Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#F7F5F2] via-[#F7F5F2]/40 to-transparent blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-between px-4 mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            SAPPS AI
          </span>
        </div>
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#B45309] flex items-center justify-center text-white shadow-md shadow-[#B45309]/20">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-[#111111]">
          SAPPS Portal
        </h2>
        <p className="mt-2 text-center text-sm text-[#57534E]">
          Student Academic Performance Prediction & Early Intervention System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#F7F5F2] py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E7E5E4]">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
                Institutional Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#57534E]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. faculty@sapp.edu"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] text-[#111111] bg-[#FFFFFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#57534E]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] text-[#111111] bg-[#FFFFFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#B45309] hover:bg-[#8B5A2B] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#B45309] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Prefill */}
          <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
            <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    email === acc.email
                      ? 'border-[#B45309] bg-white ring-1 ring-[#B45309] shadow-xs'
                      : 'border-[#E7E5E4] bg-white hover:bg-[#F7F5F2]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${acc.badge}`}>
                        {acc.role}
                      </span>
                      <span className="font-bold text-[#111111]">{acc.email}</span>
                    </div>
                    <p className="text-[#57534E] text-[11px] mt-0.5 truncate">{acc.desc}</p>
                  </div>
                  {email === acc.email ? (
                    <CheckCircle2 className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] text-[#57534E] font-medium">Use</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
