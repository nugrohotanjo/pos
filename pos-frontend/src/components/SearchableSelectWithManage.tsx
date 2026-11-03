import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, Trash2, Plus, Loader2 } from "lucide-react";

export type OptionItem = {
  id: number | string;
  name: string;
};

interface SearchableSelectWithManageProps {
  value: string;
  onSelect: (item: OptionItem | null) => void;
  options: OptionItem[];
  placeholder?: string;
  onCreate: (name: string) => Promise<OptionItem | null>;
  onDelete: (item: OptionItem) => Promise<boolean>;
  emptyLabel?: string;
}

export const SearchableSelectWithManage: React.FC<SearchableSelectWithManageProps> = ({
  value,
  onSelect,
  options = [],
  placeholder = "-- Pilih --",
  onCreate,
  onDelete,
  emptyLabel = "Tidak Ada",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Sanitasi options agar selalu valid objek & memiliki name string
  const validOptions = (Array.isArray(options) ? options : []).filter(
    (opt): opt is OptionItem => Boolean(opt && typeof opt.name === "string")
  );

  const cleanSearch = (searchTerm || "").trim().toLowerCase();

  const filtered = validOptions.filter((opt) =>
    (opt.name || "").toLowerCase().includes(cleanSearch)
  );

  const exactMatch = validOptions.some(
    (opt) => (opt.name || "").toLowerCase() === cleanSearch
  );

  const handleCreate = async () => {
    const clean = searchTerm.trim();
    if (!clean || loadingAction) return;
    try {
      setLoadingAction(true);
      const created = await onCreate(clean);
      if (created) {
        onSelect(created);
        setSearchTerm("");
        setIsOpen(false);
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, item: OptionItem) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus "${item.name}" dari daftar master?`);
    if (!confirmed) return;

    try {
      setLoadingAction(true);
      const success = await onDelete(item);
      if (success && value === item.name) {
        onSelect(null);
      }
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-left"
      >
        <span className={value ? "text-slate-800 truncate font-medium" : "text-slate-400 truncate"}>
          {value || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={14} className="text-slate-400 shrink-0 ml-2" />
        ) : (
          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-[calc(100%+4px)] w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchTerm.trim() && !exactMatch) {
                      handleCreate();
                    } else if (filtered.length > 0) {
                      onSelect(filtered[0]);
                      setIsOpen(false);
                      setSearchTerm("");
                    }
                  }
                }}
                placeholder="Cari atau ketik lalu tekan Enter..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {searchTerm.trim() && !exactMatch && (
              <p className="mt-1.5 text-[10px] text-slate-400 px-1">
                Tekan <kbd className="font-semibold text-slate-600 bg-slate-100 px-1 rounded">Enter</kbd> untuk membuat &ldquo;{searchTerm.trim()}&rdquo;
              </p>
            )}
          </div>

          {/* List Options */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-1 text-xs">
            <div
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-slate-500 italic transition-colors"
            >
              {emptyLabel}
            </div>

            {filtered.map((item) => {
              const isSelected = value === item.name;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-slate-50 transition-colors group ${
                    isSelected ? "bg-indigo-50/60 font-semibold text-indigo-600" : "text-slate-700"
                  }`}
                >
                  <span className="truncate pr-2">{item.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item)}
                    title={`Hapus ${item.name}`}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && !searchTerm.trim() && (
              <div className="px-3.5 py-4 text-center text-slate-400 text-xs">
                Belum ada data
              </div>
            )}
          </div>

          {/* Quick Create Button */}
          {searchTerm.trim() && !exactMatch && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loadingAction}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1.5 px-3 bg-white border border-indigo-200 rounded-lg shadow-xs hover:bg-indigo-50/40 transition"
              >
                {loadingAction ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={13} />
                )}
                Tambah &ldquo;{searchTerm.trim()}&rdquo; ke Master
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelectWithManage;
