import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  AlertOctagon,
  Users,
  Award,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { analyticsApi } from '../services/api';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center bg-[#FFFFFF]">
        <div className="inline-flex items-center gap-2 text-[#B45309] font-medium">
          <div className="w-5 h-5 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
          <span>Aggregating institutional predictive analytics...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="py-12 text-center text-[#57534E] bg-[#FFFFFF]">
        No analytics data available.
      </div>
    );
  }

  // Scatter Plot Custom Tooltip
  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111111] text-white p-3 rounded-xl shadow-xl text-xs border border-[#E7E5E4]/20">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-stone-400 font-mono mb-1">{data.roll_number}</p>
          <div className="space-y-0.5 text-stone-300">
            <p>
              Attendance: <strong className="text-white">{data.attendance}%</strong>
            </p>
            <p>
              Internals: <strong className="text-white">{data.internal_marks}/100</strong>
            </p>
            <p>
              Risk Status: <span className="font-bold text-amber-400">{data.risk_tier}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Group scatter points by risk tier for color consistency
  const highRiskPoints = summary.scatter_data.filter((d) => d.risk_tier === 'High Risk');
  const modRiskPoints = summary.scatter_data.filter((d) => d.risk_tier === 'Moderate Risk');
  const lowRiskPoints = summary.scatter_data.filter((d) => d.risk_tier === 'Low Risk');

  return (
    <div className="space-y-6 bg-[#FFFFFF]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F7F5F2] p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Institutional Predictive Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm text-[#57534E] mt-1">
            Macro-level academic risk distribution, continuous assessment correlation, and semester trend forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Active Model: Random Forest (v1.0.0-rf-optimized)</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cohort</span>
            <Users className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">{summary.total_students}</div>
          <span className="text-[11px] text-[#57534E] mt-1 block">
            {summary.evaluated_students} evaluated with ML
          </span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Risk</span>
            <AlertOctagon className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900">{summary.high_risk_count}</div>
          <span className="text-[11px] text-rose-800 mt-1 block font-medium">
            Immediate intervention required
          </span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between text-[#B45309] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
            <Activity className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="text-2xl font-extrabold text-[#B45309]">{summary.moderate_risk_count}</div>
          <span className="text-[11px] text-[#8B5A2B] mt-1 block font-medium">
            Borderline monitoring
          </span>
        </div>

        <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Attendance</span>
            <Award className="w-4 h-4 text-[#8B5A2B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">{summary.avg_attendance}%</div>
          <span className="text-[11px] text-[#57534E] mt-1 block">Threshold: 75%</span>
        </div>

        <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E7E5E4] shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#57534E] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Internals</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">{summary.avg_internals}</div>
          <span className="text-[11px] text-[#57534E] mt-1 block">Benchmark: 50/100</span>
        </div>
      </div>

      {/* Critical Indicator Warnings Strip */}
      <div className="bg-[#F7F5F2] p-5 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-3">
          Early Academic Alert Triggers (Institutional Vulnerability Areas)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summary.subject_alerts &&
            summary.subject_alerts.map((alert, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{alert.category}</span>
                  <span className="text-[11px] opacity-80 mt-0.5 block">
                    {alert.count} students affected
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold">{alert.percentage}%</span>
                  <span className="text-[10px] block opacity-75">of class</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Primary Visualizations: Donut & Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Category Donut Chart */}
        <div className="bg-[#F7F5F2] p-6 rounded-2xl border border-[#E7E5E4] shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#111111]">
              Risk Category Stratification
            </h2>
            <p className="text-xs text-[#57534E]">Distribution of cohort by risk vulnerability</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {summary.risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#F7F5F2" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} students`, name]}
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#E7E5E4',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-[#57534E] font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Internal Marks Scatter Plot */}
        <div className="bg-[#F7F5F2] p-6 rounded-2xl border border-[#E7E5E4] shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111111]">
                Attendance vs. Internal Test Marks (Multi-Factor Correlation)
              </h2>
              <p className="text-xs text-[#57534E]">
                Quadrant view showing danger zones (Attendance &lt; 75% or Internals &lt; 50)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> High Risk
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#B45309]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" /> Moderate
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Safe
              </span>
            </div>
          </div>

          <div className="h-64 w-full bg-[#FFFFFF] p-2 rounded-xl border border-[#E7E5E4]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  unit="%"
                  domain={[20, 100]}
                  tick={{ fontSize: 11, fill: '#57534E' }}
                  label={{ value: 'Attendance (%)', position: 'bottom', offset: 0, fontSize: 11, fill: '#57534E' }}
                />
                <YAxis
                  type="number"
                  dataKey="internal_marks"
                  name="Internals"
                  unit=" marks"
                  domain={[10, 100]}
                  tick={{ fontSize: 11, fill: '#57534E' }}
                  label={{ value: 'Internal Marks (/100)', angle: -90, position: 'left', offset: 0, fontSize: 11, fill: '#57534E' }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter name="High Risk" data={highRiskPoints} fill="#dc2626" shape="circle" />
                <Scatter name="Moderate Risk" data={modRiskPoints} fill="#B45309" shape="circle" />
                <Scatter name="Low Risk" data={lowRiskPoints} fill="#059669" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Semester Trend Lines Chart */}
      {summary.semester_trends && summary.semester_trends.length > 0 && (
        <div className="bg-[#F7F5F2] p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#111111]">
              Semester Longitudinal Performance Trends
            </h2>
            <p className="text-xs text-[#57534E]">
              Average Attendance (%), Internal Examination Marks (/100), and Scaled GPA across academic semesters
            </p>
          </div>
          <div className="h-64 w-full bg-[#FFFFFF] p-2 rounded-xl border border-[#E7E5E4]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={summary.semester_trends}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#57534E' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#57534E' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#E7E5E4',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance %"
                  stroke="#B45309"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="internal_marks"
                  name="Internal Marks (/100)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  name="Prior GPA (Scaled /100)"
                  stroke="#8B5A2B"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
