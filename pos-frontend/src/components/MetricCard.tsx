import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  alert?: boolean;
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, alert, trend }) => (
  <div className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${
    alert ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'
  }`}>
    <div className="flex items-center justify-between text-slate-500 mb-4">
      <span className="text-xs font-semibold uppercase">{title}</span>
      <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : 'text-slate-500'}`} />
    </div>
    <h3 className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-slate-800'}`}>{value}</h3>
    <p className={`text-xs mt-2 ${alert ? 'text-amber-600' : trend ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
      {subtext}
    </p>
  </div>
);