import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  content: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
        aria-label="Info field"
      >
        <HelpCircle size={14} className="stroke-[2.2]" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in duration-150 border border-slate-700">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
