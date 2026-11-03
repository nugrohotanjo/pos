import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  content: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ content }) => {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => !prev);
        }}
        className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
      >
        <HelpCircle size={13} />
      </button>

      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-48 p-2 text-[10px] leading-tight text-white bg-slate-900/95 backdrop-blur rounded-lg shadow-lg pointer-events-none text-center">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
        </span>
      )}
    </span>
  );
};
