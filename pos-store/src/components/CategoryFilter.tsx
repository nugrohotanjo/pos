import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  filteredCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  filteredCount
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-orange-600" />
          Pilih Kategori Barang
        </h2>
        <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
          Menampilkan {filteredCount} Produk
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeCategory === cat 
                ? 'bg-orange-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
};