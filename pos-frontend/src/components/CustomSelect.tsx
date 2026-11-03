import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, Check, X, Plus } from "lucide-react";

export interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  presetOptions: string[];
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  presetOptions,
  placeholder = "Silakan pilih",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !presetOptions.includes(value) && !customOptions.includes(value)) {
      setCustomOptions((prev) => [...prev, value]);
    }
  }, [value, presetOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
    setIsAdding(false);
  };

  const handleConfirmAdd = () => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (!presetOptions.includes(trimmed) && !customOptions.includes(trimmed)) {
      setCustomOptions((prev) => [...prev, trimmed]);
    }
    onChange(trimmed);
    setNewVal("");
    setIsAdding(false);
    setIsOpen(false);
  };

  const filteredPresets = presetOptions.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCustoms = customOptions.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-left"
      >
        <span className={value ? "text-slate-800 truncate" : "text-slate-400 truncate"}>
          {value || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={14} className="text-slate-400 shrink-0 ml-2" />
        ) : (
          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 top-[calc(100%+4px)] w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-80">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-2.5 text-slate-400"
              />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Masukkan min. 1 karakter"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-1 text-xs">
            {filteredPresets.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                  value === opt ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}

            {filteredCustoms.length > 0 && (
              <>
                <div className="px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                  Pilihan Isi Sendiri
                </div>
                {filteredCustoms.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                      value === opt ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </>
            )}

            {filteredPresets.length === 0 && filteredCustoms.length === 0 && (
              <div className="px-3.5 py-4 text-center text-slate-400 text-xs">
                Tidak ada opsi yang cocok
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            {isAdding ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmAdd();
                    } else if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewVal("");
                    }
                  }}
                  placeholder="Ketik nilai baru..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all"
                  title="Simpan"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewVal("");
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all"
                  title="Batal"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-indigo-50/50 transition-colors"
              >
                <Plus size={14} />
                Tambah nilai atribut
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
