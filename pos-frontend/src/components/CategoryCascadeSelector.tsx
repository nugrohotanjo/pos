import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, FolderTree } from 'lucide-react';
import { getCategoriesServerSide, type CategoryItem } from '../utils/api';

interface CategoryCascadeSelectorProps {
  value: string; // Menyimpan nama kategori atau slug terpilih
  onChange: (categoryName: string, categoryId?: number) => void;
}

export const CategoryCascadeSelector: React.FC<CategoryCascadeSelectorProps> = ({
  value,
  onChange,
}) => {
  const [tree, setTree] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Menyimpan jalur ID yang sedang dipilih di tiap kolom/level
  const [selectedPath, setSelectedPath] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const loadCategoryTree = async () => {
      setIsLoading(true);
      try {
        const res = await getCategoriesServerSide({ all: true });
        if (res && res.success && Array.isArray(res.data)) {
          // Bentuk struktur pohon hierarki dari daftar flat
          const items: CategoryItem[] = res.data;
          const itemMap = new Map<number, CategoryItem>();
          const roots: CategoryItem[] = [];

          items.forEach((item) => {
            itemMap.set(item.id, { ...item, children: [] });
          });

          items.forEach((item) => {
            const current = itemMap.get(item.id)!;
            if (item.parent_id && itemMap.has(item.parent_id)) {
              itemMap.get(item.parent_id)!.children!.push(current);
            } else {
              roots.push(current);
            }
          });

          setTree(roots);
        }
      } catch (err) {
        console.error('Gagal mengambil pohon kategori:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryTree();
  }, []);

  // Auto-map path saat value awal ada (misal mode edit produk)
  useEffect(() => {
    if (!value || tree.length === 0) return;

    // Helper rekursif untuk mencari rantai kategori sampai node yang cocok
    const findPath = (nodes: CategoryItem[], target: string, currentPath: CategoryItem[]): CategoryItem[] | null => {
      for (const node of nodes) {
        const nextPath = [...currentPath, node];
        if (
          node.name.toLowerCase().trim() === target.toLowerCase().trim() ||
          node.slug.toLowerCase().trim() === target.toLowerCase().trim()
        ) {
          return nextPath;
        }
        if (node.children && node.children.length > 0) {
          const res = findPath(node.children, target, nextPath);
          if (res) return res;
        }
      }
      return null;
    };

    const matchedPath = findPath(tree, value, []);
    if (matchedPath && matchedPath.length > 0) {
      setSelectedPath(matchedPath);
    }
  }, [value, tree]);


  // Handler saat seller mengklik item di kolom tingkat tertentu (levelIndex)
  const handleSelect = (category: CategoryItem, levelIndex: number) => {
    const newPath = selectedPath.slice(0, levelIndex);
    newPath.push(category);
    setSelectedPath(newPath);

    // Update nilai kategori ke form produk
    onChange(category.name, category.id);
  };

  // Menentukan data item yang muncul di masing-masing kolom bertingkat
  const columns: CategoryItem[][] = [];
  columns.push(tree); // Kolom 0 (Level 1: Root categories)

  selectedPath.forEach((selectedCat) => {
    if (selectedCat.children && selectedCat.children.length > 0) {
      columns.push(selectedCat.children);
    }
  });

  return (
    <div className="space-y-3">
      {/* Label Breadcrumb Jalur Terpilih */}
      <div className="flex items-center flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <FolderTree size={15} className="text-indigo-600 shrink-0 mr-1" />
        <span className="font-semibold text-slate-500">Kategori Terpilih:</span>
        {selectedPath.length > 0 ? (
          selectedPath.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <ChevronRight size={12} className="text-slate-400" />}
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  idx === selectedPath.length - 1
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {item.name}
              </span>
            </React.Fragment>
          ))
        ) : (
          <span className="text-slate-400 italic">
            {value ? value : 'Belum memilih kategori'}
          </span>
        )}
      </div>

      {/* Kolom Cascading Multi-Level (Cascading Multi-Level) */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          Memuat susunan kategori...
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 border border-slate-200 rounded-xl bg-white p-2 min-h-[280px]">
          {columns.map((columnItems, levelIndex) => (
            <div
              key={levelIndex}
              className="flex-1 min-w-[210px] max-w-[260px] border-r last:border-r-0 border-slate-100 pr-1 overflow-y-auto max-h-[340px] space-y-1"
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 sticky top-0 bg-white z-10 border-b border-slate-50">
                Level {levelIndex + 1}
              </div>

              {columnItems.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic p-3 text-center">
                  Tidak ada sub-kategori
                </div>
              ) : (
                columnItems.map((cat) => {
                  const isSelected = selectedPath[levelIndex]?.id === cat.id;
                  const hasChildren = Boolean(cat.children && cat.children.length > 0);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat, levelIndex)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 font-bold text-indigo-700 border border-indigo-200/80'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <div className="flex items-center shrink-0">
                        {hasChildren ? (
                          <ChevronRight
                            size={14}
                            className={isSelected ? 'text-indigo-600' : 'text-slate-400'}
                          />
                        ) : isSelected ? (
                          <Check size={14} className="text-indigo-600" />
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
