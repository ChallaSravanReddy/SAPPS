import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

export default function FeatureImportanceChart({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No feature attribution metrics available.
      </div>
    );
  }

  // Format data for horizontal bar visualization
  const chartData = factors.map((item) => ({
    name: item.feature_label || item.feature,
    contribution: item.contribution_pct || 0,
    status: item.status,
    value: item.value,
    threshold: item.standard_threshold,
    reason: item.reason,
    importance: Math.round((item.importance_weight || 0) * 100),
  }));

  const getBarColor = (status) => {
    switch (status) {
      case 'Deficit':
        return '#f43f5e'; // Rose 500
      case 'Borderline':
        return '#f59e0b'; // Amber 500
      case 'Satisfactory':
      default:
        return '#10b981'; // Emerald 500
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs border border-slate-700">
          <p className="font-semibold text-sm mb-1 text-slate-100">{data.name}</p>
          <div className="space-y-1 text-slate-300">
            <p className="flex justify-between">
              <span>Risk Contribution:</span>
              <span className="font-bold text-rose-400">{data.contribution}%</span>
            </p>
            <p className="flex justify-between">
              <span>Current Score:</span>
              <span className="font-medium text-slate-100">{data.value}</span>
            </p>
            <p className="flex justify-between">
              <span>Standard Threshold:</span>
              <span className="font-medium text-slate-100">{data.threshold}</span>
            </p>
            <p className="flex justify-between">
              <span>Model Weight:</span>
              <span className="font-medium text-slate-100">{data.importance}%</span>
            </p>
            <div className="pt-2 border-t border-slate-700/60 text-slate-400 italic">
              {data.reason}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#334155' }}
              width={130}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Details Table & Threshold Breakdown */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Factor-by-Factor Explainability Breakdown
        </h4>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
          {factors.map((factor, idx) => (
            <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
              <span
                className={`mt-0.5 inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  factor.status === 'Deficit'
                    ? 'bg-rose-500'
                    : factor.status === 'Borderline'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">{factor.feature_label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      Actual: <strong className="text-slate-700">{factor.value}</strong> / Benchmark: {factor.standard_threshold}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                      Contrib: {factor.contribution_pct}%
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{factor.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

