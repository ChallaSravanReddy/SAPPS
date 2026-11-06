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
} from 'lucide-react';
import { studentsApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import FeatureImportanceChart from '../components/FeatureImportanceChart';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSelfData = async () => {
      try {
        setLoading(true);
        const res = await studentsApi.getMyProfile();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        setError('Unable to load personal academic records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSelfData();
  }, []);

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
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">Notice</h3>
          <p className="text-xs text-rose-700">{error || 'No student profile linked.'}</p>
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
      default:
        return {
          title: 'Academic Support Action Required 🤝',
          text: 'We are here to support your success. Reaching out early to your professors for doubt clarification and boosting lecture attendance will quickly turn things around.',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-900',
          accent: 'text-rose-700',
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

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-indigo-200 font-medium mb-1">Performance Standing</span>
            <RiskBadge
              riskTier={latest_prediction?.risk_tier || 'Low Risk'}
              confidence={latest_prediction?.confidence_score}
              size="lg"
            />
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
      {latestAssess && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Current Semester Assessment Snapshot (Semester {latestAssess.semester})
          </h2>
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

