import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  const isFiltered = Boolean(startDate || endDate);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-lg shadow-sm">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-500 font-medium">Dari:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="text-xs text-slate-700 bg-transparent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-lg shadow-sm">
        <span className="text-slate-500 font-medium">Sampai:</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="text-xs text-slate-700 bg-transparent focus:outline-none"
        />
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          title="Reset rentang tanggal"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      )}
    </div>
  );
};