import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Tag } from 'lucide-react';

interface CategoryComboboxProps {
  categories: string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  categories,
  value,
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi input teks ketika nilai value dari luar berubah
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Jika ditutup tanpa memilih opsi baru, reset teks ke value yang tersimpan
        if (!query.trim()) {
          setQuery(value);
        } else {
          onChange(query.trim());
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query, value, onChange]);

  // Filter kategori berdasarkan ketikan user
  const filtered = categories.filter((cat) =>
    cat.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = categories.some(
    (cat) => cat.toLowerCase() === query.trim().toLowerCase()
  );

  const handleSelect = (cat: string) => {
    onChange(cat);
    setQuery(cat);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    const trimmed = query.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          required={required}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Ketik cari atau tambah kategori..."
          className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
          {/* Tombol Buat Kategori Baru jika tidak ada kecocokan persis */}
          {query.trim() !== '' && !exactMatch && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 border-b border-slate-100 cursor-pointer"
            >
              <Plus size={14} className="shrink-0" />
              <span>Gunakan Kategori Baru: <strong className="text-indigo-800">"{query.trim()}"</strong></span>
            </button>
          )}

          {/* List Kategori yang Cocok */}
          {filtered.length > 0 ? (
            filtered.map((cat) => {
              const isSelected = cat.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                    isSelected ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={13} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{cat}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-indigo-600" />}
                </button>
              );
            })
          ) : (
            !query.trim() && (
              <div className="px-3.5 py-3 text-center text-xs text-slate-400">
                Belum ada kategori. Ketik untuk membuat baru.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
