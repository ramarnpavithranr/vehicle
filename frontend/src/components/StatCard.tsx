import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBgColor = 'bg-sky-50',
  iconColor = 'text-sky-600',
  subtitle,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:shadow-lg hover:shadow-slate-200/60 hover:border-sky-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm'
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {value}
          </div>
        </div>

        <div className={`w-11 h-11 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shadow-sm flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
          {change && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {changeType === 'positive' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
              {changeType === 'negative' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate ml-2">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
