import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export default function RiskBadge({ riskTier, confidence, size = 'md' }) {
  const tier = riskTier || 'Unpredicted';

  const configs = {
    'High Risk': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/20',
      dot: 'bg-rose-600',
      icon: AlertCircle,
      label: 'High Risk',
    },
    'Moderate Risk': {
      bg: 'bg-amber-50 text-amber-900 border-amber-300 ring-amber-600/20',
      dot: 'bg-[#B45309]',
      icon: AlertTriangle,
      label: 'Moderate Risk',
    },
    'Low Risk': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/20',
      dot: 'bg-emerald-600',
      icon: CheckCircle,
      label: 'Low Risk',
    },
    'Unpredicted': {
      bg: 'bg-[#F7F5F2] text-[#57534E] border-[#E7E5E4] ring-stone-300/20',
      dot: 'bg-[#57534E]',
      icon: HelpCircle,
      label: 'Unpredicted',
    },
  };

  const config = configs[tier] || configs['Unpredicted'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ring-1 ${config.bg} ${sizeClasses[size] || sizeClasses.md} transition-all`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {confidence !== undefined && confidence !== null && (
        <span className="opacity-75 font-normal ml-0.5">
          ({Math.round(confidence > 1 ? confidence : confidence * 100)}%)
        </span>
      )}
    </span>
  );
}
