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
      <div className="text-center py-6 text-[#57534E] text-sm">
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
        return '#b91c1c'; // Deep Red
      case 'Borderline':
        return '#B45309'; // Warm Terracotta/Amber Accent
      case 'Satisfactory':
      default:
        return '#047857'; // Deep Emerald
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111111] text-white p-3 rounded-xl shadow-xl text-xs max-w-xs border border-[#E7E5E4]/20">
          <p className="font-semibold text-sm mb-1 text-white">{data.name}</p>
          <div className="space-y-1 text-stone-300">
            <p className="flex justify-between">
              <span>Risk Contribution:</span>
              <span className="font-bold text-amber-400">{data.contribution}%</span>
            </p>
            <p className="flex justify-between">
              <span>Current Score:</span>
              <span className="font-medium text-white">{data.value}</span>
            </p>
            <p className="flex justify-between">
              <span>Standard Threshold:</span>
              <span className="font-medium text-white">{data.threshold}</span>
            </p>
            <p className="flex justify-between">
              <span>Model Weight:</span>
              <span className="font-medium text-white">{data.importance}%</span>
            </p>
            <div className="pt-2 border-t border-stone-700 text-stone-400 italic">
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
      <div className="h-60 w-full bg-[#F7F5F2] p-3 rounded-xl border border-[#E7E5E4]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E5E4" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#57534E' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#111111' }}
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
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
          Factor-by-Factor Explainability Breakdown
        </h4>
        <div className="divide-y divide-[#E7E5E4] border border-[#E7E5E4] rounded-xl overflow-hidden bg-[#FFFFFF] text-xs shadow-xs">
          {factors.map((factor, idx) => (
            <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-[#F7F5F2] transition-colors">
              <span
                className={`mt-0.5 inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  factor.status === 'Deficit'
                    ? 'bg-red-600'
                    : factor.status === 'Borderline'
                    ? 'bg-[#B45309]'
                    : 'bg-emerald-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#111111]">{factor.feature_label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#57534E]">
                      Actual: <strong className="text-[#111111]">{factor.value}</strong> / Benchmark: {factor.standard_threshold}
                    </span>
                    <span className="bg-[#F7F5F2] border border-[#E7E5E4] px-2 py-0.5 rounded font-medium text-[#111111]">
                      Contrib: {factor.contribution_pct}%
                    </span>
                  </div>
                </div>
                <p className="text-[#57534E] text-xs leading-relaxed">{factor.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
