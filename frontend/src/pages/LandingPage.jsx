import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Brain,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  FileSpreadsheet,
  BarChart3,
  Users,
  Layers,
  Activity,
  Zap,
  ChevronRight,
  ExternalLink,
  Lock,
  Cpu,
  Target,
  Search,
  BookOpen,
  PieChart,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Check if user is already logged in
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('sapps_token');
      const userJson = localStorage.getItem('sapps_user');
      if (token && userJson) {
        setCurrentUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.warn('Failed to parse user session', e);
    }
  }, []);

  // Dashboard Tab state: 'faculty' | 'student' | 'admin' | 'batch'
  const [activeTab, setActiveTab] = useState('faculty');

  // Interactive "What-If" Mini-Simulator state
  const [attendance, setAttendance] = useState(78);
  const [internals, setInternals] = useState(34);
  const [assignments, setAssignments] = useState(42);
  const [priorGpa, setPriorGpa] = useState(7.4);

  // Compute simulated outcome in real-time
  const computeSimulation = () => {
    // Weighted normalized index (similar to the Random Forest decision boundaries)
    const attNorm = attendance / 100;
    const intNorm = internals / 50;
    const assignNorm = assignments / 50;
    const gpaNorm = priorGpa / 10;

    const compositeScore = attNorm * 0.38 + intNorm * 0.34 + assignNorm * 0.15 + gpaNorm * 0.13;

    let risk = 'LOW_RISK';
    let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let ringColor = 'from-emerald-500 to-teal-400';
    let statusText = 'Optimal Academic Standing';
    let probability = Math.min(98, Math.max(68, Math.round(compositeScore * 100)));
    let recommendation = 'Maintain current lecture consistency and engage in peer mentorship programs.';

    if (compositeScore < 0.62) {
      risk = 'HIGH_RISK';
      riskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      ringColor = 'from-rose-500 to-amber-500';
      statusText = 'Critical Risk Detected';
      probability = Math.min(97, Math.max(76, Math.round((1 - compositeScore) * 100)));
      recommendation = 'Urgent faculty academic counseling advised. Assign mandatory remedial quizzes and monitor class attendance.';
    } else if (compositeScore < 0.76) {
      risk = 'MEDIUM_RISK';
      riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      ringColor = 'from-amber-500 to-orange-400';
      statusText = 'Moderate Vulnerability';
      probability = Math.min(94, Math.max(62, Math.round((compositeScore) * 100)));
      recommendation = 'Schedule review session for upcoming internal assessment. Boost assignment completion rate above 85%.';
    }

    return { risk, riskColor, ringColor, statusText, probability, recommendation, compositeScore };
  };

  const simResult = computeSimulation();

  // Navigate to login or direct dashboard
  const handleLaunchApp = (role) => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') navigate('/admin');
      else if (currentUser.role === 'FACULTY') navigate('/faculty');
      else if (currentUser.role === 'STUDENT') navigate('/student');
      else navigate('/login');
    } else {
      navigate('/login');
    }
  };

  // Quick launch with specific demo account
  const handleDemoLogin = (email, password) => {
    // Navigate to login with state or prefilled
    navigate('/login', { state: { prefillEmail: email, prefillPassword: password } });
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glow Mesh & Radial Gradients (Nixtio AI Palette) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[60%] -right-40 w-[650px] h-[650px] bg-purple-600/12 blur-[160px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050811]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SAPPS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Academic Performance Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors">
              Overview
            </a>
            <a href="#dashboards" className="hover:text-white transition-colors">
              Dashboard Roles
            </a>
            <a href="#simulator" className="hover:text-white transition-colors">
              What-If Simulator
            </a>
            <a href="#ml-architecture" className="hover:text-white transition-colors">
              ML Engine
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="https://sapps-tf0v.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-all"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {currentUser ? (
              <button
                onClick={() => handleLaunchApp()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-md shadow-indigo-500/20 transition-all hover:scale-102"
              >
                <span>Dashboard ({currentUser.role})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:opacity-95 rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-102"
                >
                  <span>Launch Demo</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-8">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI-POWERED ACADEMIC RETENTION SYSTEM</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-slate-400 font-normal">95.6% Predictive Accuracy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            Predict Student Performance Before Semester Finals with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Explainable AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-3xl mx-auto font-normal leading-relaxed">
            SAPPS replaces subjective end-of-term evaluations with real-time academic telemetry.
            Detect at-risk students weeks in advance, uncover mathematical feature drivers, and
            deploy prescriptive faculty interventions automatically.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Live Dashboards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <a
              href="#simulator"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-indigo-400/30 transition-all hover:scale-105"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Try What-If Simulator</span>
            </a>
          </div>

          {/* Micro Social Proof / Tech Specs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Random Forest Ensemble</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Data-Leakage Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Prescriptive Action Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant CSV Bulk Ingestion</span>
            </div>
          </div>

          {/* Hero Cockpit UI Mockup (Dark Glassmorphic Aesthetic) */}
          <div className="mt-14 relative mx-auto max-w-6xl">
            {/* Glow border ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />

            <div className="relative rounded-2xl bg-[#090d19]/90 border border-white/[0.12] shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Window Controls Header */}
              <div className="h-11 px-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-slate-400 font-mono">
                    sapps://faculty.cockpit.ai/cohort-evaluator
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Model Live • 12ms Latency
                  </span>
                </div>
              </div>

              {/* Inside Mockup Content */}
              <div className="p-6 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Real-time Evaluation Roster */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-bold text-white">Active Student Roster</h4>
                      <p className="text-xs text-slate-400">Class of 2026 • Computer Science (Sem VI)</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-1 rounded">
                      50 Active Telemetries
                    </span>
                  </div>

                  {/* Simulated Student Rows */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                          AS
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Aarav Sharma</p>
                          <p className="text-[11px] text-slate-400">Roll: CS2026-003 • Att: 52% • Internals: 18/50</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          HIGH RISK (94%)
                        </span>
                        <span className="text-[11px] text-indigo-400 font-medium underline cursor-pointer">
                          Explain XAI
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                          VR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Vikram Rao</p>
                          <p className="text-[11px] text-slate-400">Roll: CS2026-012 • Att: 72% • Internals: 31/50</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          MEDIUM RISK (71%)
                        </span>
                        <span className="text-[11px] text-indigo-400 font-medium underline cursor-pointer">
                          Explain XAI
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          SP
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Sneha Patel</p>
                          <p className="text-[11px] text-slate-400">Roll: CS2026-001 • Att: 94% • Internals: 46/50</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          LOW RISK (96%)
                        </span>
                        <span className="text-[11px] text-indigo-400 font-medium underline cursor-pointer">
                          Explain XAI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Simulated XAI Feature Explainer */}
                <div className="lg:col-span-5 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Brain className="w-4 h-4" />
                        XAI Mathematical Drivers
                      </span>
                      <span className="text-[10px] text-slate-400">Student: Aarav Sharma</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Classroom Attendance (52%)</span>
                          <span className="text-rose-400 font-bold">-34% Impact</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Internal Exam Score (18/50)</span>
                          <span className="text-rose-400 font-bold">-28% Impact</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-400 h-full rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Prior CGPA (6.1)</span>
                          <span className="text-amber-400 font-bold">-14% Impact</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '42%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      Prescriptive Intervention Action
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      Schedule 1-on-1 counseling with Academic Advisor. Enforce mandatory attendance in next 4 lab modules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative z-10 py-12 border-y border-white/[0.08] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                95.6%
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-200">Prediction Accuracy</p>
              <p className="text-[11px] text-slate-400">Validated on Random Forest</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
                93.9%
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-200">High-Risk Recall</p>
              <p className="text-[11px] text-slate-400">Minimizing false negatives</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                &lt; 50ms
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-200">Inference Latency</p>
              <p className="text-[11px] text-slate-400">Real-time model scoring</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                3 Portals
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-200">Role-Based Access</p>
              <p className="text-[11px] text-slate-400">Faculty, Student & Admin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Overview & The Academic Crisis SAPPS Solves */}
      <section id="overview" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Why SAPPS?
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Shifting Higher Education from Reactive Failure to Proactive Success
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Traditional universities only discover academic struggle after final semester grades are published. By then, it is too late to intervene.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-rose-500/20 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">The Traditional Approach (Lagging)</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>End-of-Semester Discovery:</strong> Students only know they failed when final transcripts arrive, leading to course repeats or dropouts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>Siloed Spreadsheets:</strong> Attendance registers, quiz scores, and lab exams live in isolated files with zero automated correlation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>Subjective Faculty Intuition:</strong> Heavy teaching workloads mean educators cannot manually track 300+ students individual risk slopes.</span>
                </li>
              </ul>
            </div>

            {/* The SAPPS Way */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 relative overflow-hidden shadow-xl shadow-indigo-950/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">The SAPPS Intelligence Engine (Leading)</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <span><strong>Weeks-in-Advance Early Warning:</strong> Continuous Random Forest machine learning models forecast outcomes mid-term while intervention is possible.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <span><strong>Transparent Explainable AI (XAI):</strong> Mathematical decomposition surfaces the exact features dragging a student down (e.g. attendance vs internals).</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <span><strong>Self-Service What-If Simulation:</strong> Students can experiment with study adjustments in real-time to visualize what it takes to graduate safely.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Comprehensive Dashboard Deep-Dive */}
      <section id="dashboards" className="relative z-10 py-24 bg-white/[0.01] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Architecture & User Roles
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              What SAPPS Does in Each Dashboard
            </h2>
            <p className="mt-4 text-base text-slate-400">
              A unified intelligent ecosystem tailored with dedicated role-based portals for Professors, Students, Deans, and Registrars.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] max-w-2xl mx-auto mb-12">
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Faculty Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dean & Admin Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV Batch Ingestion</span>
            </button>
          </div>

          {/* Tab Content Cards */}
          <div className="bg-[#0a0f1d] border border-white/[0.1] rounded-2xl p-6 sm:p-10 shadow-2xl">
            {/* Faculty Tab */}
            {activeTab === 'faculty' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    <span>Route: /faculty</span>
                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                    <span>Role: FACULTY & ADMIN</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Faculty Cohort Intelligence Cockpit
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Designed for professors and course instructors. It aggregates student assessments,
                    triggers single-click machine learning inference, and reveals actionable guidance recommendations.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Live Cohort Roster:</strong> Search, filter by department, and inspect individual academic vitals.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>1-Click ML Inference:</strong> Execute the Random Forest engine across students to update predictions on demand.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Explainable AI Modal:</strong> Opens mathematical feature attributions and 2-3 tailored intervention tasks for each student.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Instant CSV Export:</strong> Export sorted cohorts with risk classifications directly into accredited audit spreadsheets.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleDemoLogin('faculty@sapp.edu', 'Faculty@123')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
                    >
                      <span>Launch Faculty View (Demo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-900/80 border border-white/[0.08] rounded-xl p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-white">Faculty Cockpit Preview</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Live Data Active
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Aarav Sharma (CS2026-003)</span>
                        <span className="text-rose-400 font-extrabold bg-rose-500/10 px-2 py-0.5 rounded">HIGH_RISK</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-slate-400">
                        <div>Attendance: <span className="text-slate-200">54%</span></div>
                        <div>Internals: <span className="text-slate-200">18/50</span></div>
                        <div>CGPA: <span className="text-slate-200">6.1</span></div>
                      </div>
                      <div className="mt-2 text-[11px] text-indigo-300 bg-indigo-500/10 p-2 rounded">
                        <strong>Recommended:</strong> Mandatory tutoring & attendance counseling.
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Pooja Iyer (EC2026-005)</span>
                        <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded">LOW_RISK</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-slate-400">
                        <div>Attendance: <span className="text-slate-200">92%</span></div>
                        <div>Internals: <span className="text-slate-200">44/50</span></div>
                        <div>CGPA: <span className="text-slate-200">8.8</span></div>
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded">
                        <strong>Recommended:</strong> Nominate for department honor societies and research tracks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Student Tab */}
            {activeTab === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <span>Route: /student</span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>Role: STUDENT</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Personal Student Growth Portal
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    A private, student-centric hub providing complete transparency into personal performance,
                    actionable guidance, and an interactive sandbox to test future performance trajectories.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Personalized Academic Scorecard:</strong> Live GPA, current attendance status, and internal assessment tracking.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Interactive "What-If" Simulator:</strong> Adjust attendance, internal test targets, and assignment completion sliders to forecast future risk levels in real time.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Constructive AI Action Plan:</strong> Empathetic, personalized recommendations helping students improve without shame or ambiguity.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleDemoLogin('student@sapp.edu', 'Student@123')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30"
                    >
                      <span>Launch Student Portal (Demo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-900/80 border border-white/[0.08] rounded-xl p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-white">Student What-If Sandbox Preview</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Predictive Mode
                    </span>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Simulated Outcome</p>
                        <p className="text-base font-extrabold text-emerald-400">LOW_RISK (92% Confidence)</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">
                        Trajectory: Passing with Honors
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Target Attendance: 85%</span>
                          <span className="text-emerald-400">+15% improvement</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Target Internal Score: 40/50</span>
                          <span className="text-emerald-400">+10 marks</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '80%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                    <span>Route: /admin</span>
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    <span>Role: ADMIN</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Dean & Institutional Analytics Deck
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Designed for University Deans, Department Chairs, and Academic Quality Committees to evaluate campus-wide retention rates, model health, and cohort risk trends.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Institutional KPI Overview:</strong> Total campus enrollment, average cohort GPA, total evaluated students, and high-risk flags.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Risk Distribution Donut:</strong> Visual breakdown of High vs. Medium vs. Low risk percentages across the institution.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Attendance vs. GPA Scatter Correlation:</strong> Uncover multi-dimensional patterns and departmental retention disparities.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleDemoLogin('admin@sapp.edu', 'Admin@123')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                    >
                      <span>Launch Admin Deck (Demo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-900/80 border border-white/[0.08] rounded-xl p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-white">Executive Macro Analytics</span>
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Campus Metrics
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <p className="text-2xl font-bold text-white">50</p>
                      <p className="text-[11px] text-slate-400">Total Enrolled</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <p className="text-2xl font-bold text-indigo-400">7.62</p>
                      <p className="text-[11px] text-slate-400">Average Campus GPA</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <p className="text-2xl font-bold text-rose-400">14%</p>
                      <p className="text-[11px] text-slate-400">High Risk Cohort</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <p className="text-2xl font-bold text-emerald-400">68%</p>
                      <p className="text-[11px] text-slate-400">Low Risk Honors</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Ingestion Tab */}
            {activeTab === 'batch' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    <span>Route: /batch-upload</span>
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span>Role: FACULTY & ADMIN</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    High-Throughput CSV Assessment Ingestion
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Seamlessly ingest hundreds of student marks from university LMS systems (Moodle, Blackboard, Canvas) in seconds with client-side error checking.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Drag-and-Drop Dropzone:</strong> Upload any standardized CSV file containing student attendance and test results.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Instant Client-Side Validation:</strong> Highlights malformed student roll numbers, invalid scores, and missing columns before upload.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Sample CSV Template Download:</strong> Pre-formatted template guaranteed to pass parser specifications instantly.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleDemoLogin('faculty@sapp.edu', 'Faculty@123')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md shadow-amber-600/30"
                    >
                      <span>Try Batch Ingestion (Demo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-900/80 border border-white/[0.08] rounded-xl p-5 shadow-inner">
                  <div className="border-2 border-dashed border-indigo-500/30 rounded-xl p-8 text-center bg-indigo-500/[0.02]">
                    <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">Drag and Drop University CSV</p>
                    <p className="text-xs text-slate-400 mt-1">Supported: .csv files up to 10MB</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] text-[11px] text-slate-300 border border-white/[0.08]">
                      <span>Template: student_id, internal_marks, attendance_rate...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Live "What-If" Simulator */}
      <section id="simulator" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Interactive Live Engine
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Try the Real-Time Academic Simulator
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Test how behavioral indicators alter student risk scores. Adjust the sliders below to see the simulated Random Forest inference engine update in real time.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-[#0a0f1d] border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient background highlight */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Area */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      Class Attendance Percentage
                    </label>
                    <span className="text-sm font-extrabold text-indigo-400">{attendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>30% (Critical)</span>
                    <span>75% (Min. Required)</span>
                    <span>100% (Perfect)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Midterm Internal Assessment Score
                    </label>
                    <span className="text-sm font-extrabold text-purple-400">{internals} / 50</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={internals}
                    onChange={(e) => setInternals(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>10 (Fail)</span>
                    <span>25 (Passing)</span>
                    <span>50 (Max)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      Continuous Assignment Score
                    </label>
                    <span className="text-sm font-extrabold text-cyan-400">{assignments} / 50</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={assignments}
                    onChange={(e) => setAssignments(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>10 (Neglected)</span>
                    <span>35 (Average)</span>
                    <span>50 (Exceptional)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      Prior Cumulative GPA
                    </label>
                    <span className="text-sm font-extrabold text-emerald-400">{priorGpa.toFixed(1)} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.1"
                    value={priorGpa}
                    onChange={(e) => setPriorGpa(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>3.0 (Probation)</span>
                    <span>7.0 (Good)</span>
                    <span>10.0 (Top Honors)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Real-time Output Card */}
              <div className="lg:col-span-5 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-2xl p-6 text-center flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Live Random Forest Output
                  </span>

                  <div className="mt-4 flex flex-col items-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider border ${simResult.riskColor}`}>
                      {simResult.risk}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-2">
                      {simResult.statusText}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Model Confidence: <span className="font-bold text-white">{simResult.probability}%</span>
                    </p>
                  </div>

                  {/* Mathematical Feature Breakdown */}
                  <div className="mt-6 space-y-2.5 text-left text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendance Weight</span>
                      <span className={attendance >= 75 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {attendance >= 75 ? '+ Positive Factor' : '- Heavy Penalty'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Internal Test Correlation</span>
                      <span className={internals >= 30 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {internals >= 30 ? '+ Strong Retention' : '- Vulnerable Mark'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] text-left">
                  <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Prescriptive Action Plan:
                  </p>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    {simResult.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Machine Learning Pipeline & Architecture */}
      <section id="ml-architecture" className="relative z-10 py-24 bg-white/[0.01] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Technical Excellence
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Built on Modern ML Engineering Principles
            </h2>
            <p className="mt-4 text-base text-slate-400">
              From zero-data-leakage pipeline design to explainable SHAP-inspired decompositions, SAPPS meets enterprise institutional standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Ensemble Random Forest</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trained with 100 balanced decision trees. Systematically benchmarked against Logistic Regression and Decision Trees to achieve 95.6% Macro accuracy.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Transparent XAI Engine</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Replaces opaque black-box AI with continuous mathematical feature importance, granting professors complete visibility into the factors driving every score.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Institutional Security & RBAC</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                JWT bearer tokens, 72-byte safe bcrypt cryptography, and strict role guards guarantee that student academic vitals remain completely private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Instant 1-Click Demo Accounts */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-indigo-950/20 to-[#050811] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Instant Access
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Explore? Launch a Demo Session
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Test the live platform immediately using any of our pre-configured demo personas:
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {/* Faculty Card */}
            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Faculty Role
                  </span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-base font-bold text-white">Dr. Robert Chen</h4>
                <p className="text-xs text-slate-400 mt-1">faculty@sapp.edu</p>
                <p className="text-[11px] text-slate-400 mt-3">
                  Evaluate cohorts, review XAI explanations, and trigger predictions.
                </p>
              </div>
              <button
                onClick={() => handleDemoLogin('faculty@sapp.edu', 'Faculty@123')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30 text-center"
              >
                Log In as Faculty
              </button>
            </div>

            {/* Admin Card */}
            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Admin Role
                  </span>
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-base font-bold text-white">Dean Margaret Brooks</h4>
                <p className="text-xs text-slate-400 mt-1">admin@sapp.edu</p>
                <p className="text-[11px] text-slate-400 mt-3">
                  Inspect university-wide risk trends and attendance distributions.
                </p>
              </div>
              <button
                onClick={() => handleDemoLogin('admin@sapp.edu', 'Admin@123')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30 text-center"
              >
                Log In as Admin
              </button>
            </div>

            {/* Student Card */}
            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Student Role
                  </span>
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-base font-bold text-white">Alex Mercer</h4>
                <p className="text-xs text-slate-400 mt-1">student@sapp.edu</p>
                <p className="text-[11px] text-slate-400 mt-3">
                  Check personal GPA, trajectory recommendations, and simulator.
                </p>
              </div>
              <button
                onClick={() => handleDemoLogin('student@sapp.edu', 'Student@123')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 text-center"
              >
                Log In as Student
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: FAQ */}
      <section id="faq" className="relative z-10 py-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Questions & Answers
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                How does the Random Forest model avoid data leakage?
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Our machine learning pipeline uses continuous academic features measured prior to the final exam cutoff. Target status is computed solely from final semester performance, while training features rely strictly on leading indicators (midterm attendance, continuous assessments, and historical GPA).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                Can our university upload custom grade sheets?
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Yes! The CSV Batch Ingestion engine allows faculty and registrars to drag and drop standard CSV exports from any LMS (Moodle, Blackboard, Canvas) and commit hundreds of student assessment records in a single click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                How are the prescriptive interventions generated?
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                The XAI service analyzes the feature attributions of the prediction. If low attendance is the top negative driver, it prescribes attendance tracking and mandatory lab makeup sessions. If internal marks are low, it generates study group and tutoring recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/[0.08] bg-[#03060d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">SAPPS • Gradix</span>
              <p className="text-[11px] text-slate-400">Student Academic Performance Prediction System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <a
              href="https://github.com/ChallaSravanReddy/SAPPS"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <a
              href="https://sapps-tf0v.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Backend API (Render)
            </a>
            <Link to="/login" className="hover:text-white transition-colors">
              Staff & Student Login
            </Link>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} SAPPS. Production AI for Higher Education.
          </p>
        </div>
      </footer>
    </div>
  );
}
