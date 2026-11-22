import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Compass,
  RefreshCw,
  Sliders,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { studentsApi, predictionsApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import FeatureImportanceChart from '../components/FeatureImportanceChart';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // What-If Simulation State
  const [simValues, setSimValues] = useState({
    attendance_percentage: 75,
    internal_test_marks: 60,
    assignment_score: 70,
    quiz_score: 70,
    prev_semester_gpa: 6.5,
  });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const fetchSelfData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const res = await studentsApi.getMyProfile();
      setData(res);

      // Preload current actuals into simulator
      if (res.assessments && res.assessments.length > 0) {
        const curr = res.assessments[0];
        setSimValues({
          attendance_percentage: Number(curr.attendance_percentage),
          internal_test_marks: Number(curr.internal_test_marks),
          assignment_score: Number(curr.assignment_score),
          quiz_score: Number(curr.quiz_score),
          prev_semester_gpa: Number(curr.prev_semester_gpa),
        });
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
      setError('Unable to load personal academic records. Please ensure your account is linked to a valid student roll number.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSelfData();
  }, []);

  // Run simulation on demand or when sliders move
  const runSimulation = async (customValues = null) => {
    const payload = customValues || simValues;
    try {
      setSimulating(true);
      const res = await predictionsApi.simulate(payload);
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSliderChange = (field, value) => {
    const updated = { ...simValues, [field]: Number(value) };
    setSimValues(updated);
  };

  const handleResetSimulation = () => {
    if (data?.assessments && data.assessments.length > 0) {
      const curr = data.assessments[0];
      const initial = {
        attendance_percentage: Number(curr.attendance_percentage),
        internal_test_marks: Number(curr.internal_test_marks),
        assignment_score: Number(curr.assignment_score),
        quiz_score: Number(curr.quiz_score),
        prev_semester_gpa: Number(curr.prev_semester_gpa),
      };
      setSimValues(initial);
      setSimResult(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2 text-indigo-600 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your academic profile...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-rose-900">Student Profile Issue</h3>
            <p className="text-xs text-rose-700 mt-1">{error || 'No student profile record found.'}</p>
          </div>
          <button
            onClick={() => fetchSelfData(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { student, latest_prediction, assessments } = data;
  const latestAssess = assessments && assessments.length > 0 ? assessments[0] : null;

  const getEncouragementCard = (riskTier) => {
    switch (riskTier) {
      case 'Low Risk':
        return {
          title: 'Outstanding Academic Momentum! 🌟',
          text: 'You are maintaining solid course engagement and exemplary consistency across evaluations. Keep up your active participation and explore advanced seminar projects.',
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900',
          accent: 'text-emerald-700',
        };
      case 'Moderate Risk':
        return {
          title: 'Growth Opportunity in Sight 🎯',
          text: 'You have good potential, but a few indicators (such as internal tests or attendance) need a slight boost to keep you safely on track for top semester honors.',
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-900',
          accent: 'text-amber-700',
        };
      case 'High Risk':
        return {
          title: 'Academic Support Action Required 🤝',
          text: 'We are here to support your success. Reaching out early to your professors for doubt clarification and boosting lecture attendance will quickly turn things around.',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-900',
          accent: 'text-rose-700',
        };
      default:
        return {
          title: 'Continuous Assessment In Progress 📋',
          text: 'Your semester records are being continuously gathered. Review your metrics below and plan your study milestones with your course mentors.',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          accent: 'text-indigo-700',
        };
    }
  };

  const standing = getEncouragementCard(latest_prediction?.risk_tier);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
                Student Academic Profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student.name}</h1>
              <p className="text-xs sm:text-sm text-indigo-100 font-mono mt-1">
                Roll No: {student.roll_number} • {student.department} (Semester {student.current_semester})
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="text-right">
              <span className="text-xs text-indigo-200 font-medium mb-1 block">
                Current Performance Standing
              </span>
              <RiskBadge
                riskTier={latest_prediction?.risk_tier || 'Unpredicted'}
                confidence={latest_prediction?.confidence_score}
                size="lg"
              />
            </div>
            <button
              onClick={() => fetchSelfData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Records'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Encouragement Banner */}
      <div className={`p-5 rounded-2xl border ${standing.bg} flex items-start gap-4 shadow-xs`}>
        <div className="p-2.5 rounded-xl bg-white/80 shadow-xs flex-shrink-0">
          <Compass className={`w-6 h-6 ${standing.accent}`} />
        </div>
        <div>
          <h3 className="text-base font-bold mb-1">{standing.title}</h3>
          <p className="text-xs sm:text-sm leading-relaxed">{standing.text}</p>
        </div>
      </div>

      {/* Current Academic Indicators Cards */}
      {latestAssess ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Semester Assessment Snapshot (Semester {latestAssess.semester})
            </h2>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSimulator ? 'Hide What-If Simulator' : 'Try What-If Simulator'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Attendance</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-extrabold ${
                    latestAssess.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {latestAssess.attendance_percentage}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Min. required: 75%</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Internal Marks</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-extrabold ${
                    latestAssess.internal_test_marks < 50 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {latestAssess.internal_test_marks}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Passing: &ge; 50</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Assignment Score</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestAssess.assignment_score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Coursework grading</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Periodic Quizzes</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestAssess.quiz_score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Continuous review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
              <span className="text-xs text-slate-500 font-medium block">Previous GPA</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestAssess.prev_semester_gpa}
                </span>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Cumulative basis</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Assessment Records Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your course instructors haven't uploaded semester evaluation marks yet. Check back once mid-term evaluations are posted.
          </p>
        </div>
      )}

      {/* Interactive What-If Academic Scenario Simulator */}
      {showSimulator && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-lg space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Interactive "What-If" Academic Goal Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust target metrics to simulate how improved attendance or quiz marks reduce your risk score.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Actuals</span>
              </button>
              <button
                onClick={() => runSimulation()}
                disabled={simulating}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {simulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Run Simulation</span>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Attendance Target</span>
                <span className="text-indigo-600">{simValues.attendance_percentage}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={simValues.attendance_percentage}
                onChange={(e) => handleSliderChange('attendance_percentage', e.target.value)}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400">Institutional requirement: 75%</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Internal Test Marks Target</span>
                <span className="text-indigo-600">{simValues.internal_test_marks} / 100</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={simValues.internal_test_marks}
                onChange={(e) => handleSliderChange('internal_test_marks', e.target.value)}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400">Passing baseline: 50/100</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Assignment Score Target</span>
                <span className="text-indigo-600">{simValues.assignment_score} / 100</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={simValues.assignment_score}
                onChange={(e) => handleSliderChange('assignment_score', e.target.value)}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400">Continuous coursework</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Quiz Performance Target</span>
                <span className="text-indigo-600">{simValues.quiz_score} / 100</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={simValues.quiz_score}
                onChange={(e) => handleSliderChange('quiz_score', e.target.value)}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400">Periodic module assessments</span>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Simulated Performance Standing
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <RiskBadge
                      riskTier={simResult.risk_tier}
                      confidence={simResult.confidence_score}
                      size="md"
                    />
                    <span className="text-xs text-slate-600">
                      Model Confidence: <strong>{Math.round(simResult.confidence_score * 100)}%</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Model: </span>
                  <span className="font-mono text-slate-700 font-medium">{simResult.model_version}</span>
                </div>
              </div>

              {simResult.actionable_recommendations && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Simulated Action Recommendations:
                  </span>
                  {simResult.actionable_recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommended Academic Action Plan */}
      {latest_prediction?.actionable_recommendations && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Your Personalized Academic Guidance & Interventions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {latest_prediction.actionable_recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed text-slate-700">{rec}</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-3 uppercase tracking-wider">
                  Action Item #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Attribution Explanation */}
      {latest_prediction?.top_negative_factors && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Explainable AI: Key Factor Insights
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              How specific academic dimensions are influencing your performance standing this term.
            </p>
          </div>
          <FeatureImportanceChart factors={latest_prediction.top_negative_factors} />
        </div>
      )}

      {/* Past Assessment History */}
      {assessments && assessments.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Semester Assessment History
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Semester</th>
                  <th className="py-2.5 px-4">Attendance</th>
                  <th className="py-2.5 px-4">Internals</th>
                  <th className="py-2.5 px-4">Assignment</th>
                  <th className="py-2.5 px-4">Quiz</th>
                  <th className="py-2.5 px-4">Prior GPA</th>
                  <th className="py-2.5 px-4">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Semester {a.semester}</td>
                    <td className="py-3 px-4 font-medium">{a.attendance_percentage}%</td>
                    <td className="py-3 px-4 font-medium">{a.internal_test_marks}/100</td>
                    <td className="py-3 px-4 font-medium">{a.assignment_score}/100</td>
                    <td className="py-3 px-4 font-medium">{a.quiz_score}/100</td>
                    <td className="py-3 px-4 font-medium">{a.prev_semester_gpa}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
