import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Pencil 
} from 'lucide-react';
import { getCategoriesServerSide, type CategoryItem } from '../utils/api';

interface CategoryCascadeModalProps {
  value: string;
  categoryId?: number;
  onChange: (categoryName: string, categoryId?: number) => void;
  disabled?: boolean;
}

export const CategoryCascadeModal: React.FC<CategoryCascadeModalProps> = ({
  value,
  categoryId,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [flatList, setFlatList] = useState<CategoryItem[]>([]);
  const [tree, setTree] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activePath, setActivePath] = useState<CategoryItem[]>([]);
  const [confirmedPath, setConfirmedPath] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Ambil daftar kategori dari server
  const loadCategories = async () => {
    if (flatList.length > 0) return;
    setIsLoading(true);
    try {
      const res = await getCategoriesServerSide({ all: true });
      if (res && res.success && Array.isArray(res.data)) {
        const items: CategoryItem[] = res.data;
        setFlatList(items);

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
      console.error('Gagal mengambil data kategori:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Muat kategori saat awal render agar path label di form langsung terbentuk
  useEffect(() => {
    loadCategories();
  }, []);

  // Rekonstruksi rantai hierarki kategori
  const findPathByTarget = (
    nodes: CategoryItem[],
    targetVal?: string,
    targetId?: number,
    currentPath: CategoryItem[] = []
  ): CategoryItem[] | null => {
    for (const node of nodes) {
      const nextPath = [...currentPath, node];
      const matchId = targetId && Number(node.id) === Number(targetId);
      const matchName = targetVal && (
        node.name.toLowerCase().trim() === targetVal.toLowerCase().trim() ||
        node.slug.toLowerCase().trim() === targetVal.toLowerCase().trim()
      );

      if (matchId || matchName) {
        return nextPath;
      }
      if (node.children && node.children.length > 0) {
        const found = findPathByTarget(node.children, targetVal, targetId, nextPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Sinkronkan rantai path yang dikonfirmasi saat data produk atau pohon kategori siap
  useEffect(() => {
    if (tree.length > 0 && (value || categoryId)) {
      const matched = findPathByTarget(tree, value, categoryId);
      if (matched && matched.length > 0) {
        setConfirmedPath(matched);
        setActivePath(matched);
      }
    }
  }, [tree, value, categoryId]);

  // Buka modal: reset jalur navigasi aktif sesuai path yang tersimpan
  const handleOpenModal = () => {
    if (disabled) return;
    if (confirmedPath.length > 0) {
      setActivePath(confirmedPath);
    }
    setSearchQuery('');
    setIsOpen(true);
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 100);
    return () => clearTimeout(timer);
  }, [activePath, isOpen]);

  const handleSlide = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const columns = useMemo(() => {
    const cols: CategoryItem[][] = [];
    if (tree.length === 0) return cols;

    cols.push(tree);

    for (let i = 0; i < activePath.length; i++) {
      const selectedNode = activePath[i];
      if (selectedNode.children && selectedNode.children.length > 0) {
        cols.push(selectedNode.children);
      }
    }

    return cols;
  }, [tree, activePath]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
          });
          updateScrollButtons();
        }
      }, 50);
    }
  }, [activePath.length]);

  const handleSelectNode = (node: CategoryItem, levelIndex: number) => {
    const nextPath = [...activePath.slice(0, levelIndex), node];
    setActivePath(nextPath);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || flatList.length === 0) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const idMap = new Map<number, CategoryItem>();
    flatList.forEach(item => idMap.set(item.id, item));

    const buildFullPath = (leaf: CategoryItem): CategoryItem[] => {
      const path: CategoryItem[] = [];
      let curr: CategoryItem | undefined = leaf;
      while (curr) {
        path.unshift(curr);
        curr = curr.parent_id ? idMap.get(curr.parent_id) : undefined;
      }
      return path;
    };

    return flatList
      .filter(item => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q))
      .slice(0, 40)
      .map(item => ({
        leaf: item,
        fullPath: buildFullPath(item)
      }));
  }, [searchQuery, flatList]);

  const handleApply = () => {
    if (activePath.length === 0) return;
    const finalNode = activePath[activePath.length - 1];
    setConfirmedPath(activePath);
    onChange(activePath.map(n => n.name).join(' > '), finalNode.id);
    setIsOpen(false);
  };

  // Label tampilan rantai kategori di field
  const displayText = useMemo(() => {
    if (confirmedPath.length > 0) {
      return confirmedPath.map((p) => p.name).join(' > ');
    }
    return value || '';
  }, [confirmedPath, value]);

  const currentSelectionLabel = activePath.map((p) => p.name).join(' > ');

  return (
    <div className="w-full">
      {/* Box Input Kategori Sesuai Mockup */}
      <div 
        onClick={handleOpenModal}
        className={`w-full min-h-[42px] px-3.5 py-2.5 bg-white border rounded-lg flex items-center justify-between gap-3 transition cursor-pointer select-none ${
          displayText 
            ? 'border-slate-300 hover:border-slate-400 text-slate-800' 
            : 'border-slate-200 hover:border-indigo-400 text-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <span className="text-sm font-normal truncate tracking-tight">
          {displayText || 'Pilih Kategori'}
        </span>
        <Pencil size={15} className="text-slate-400 hover:text-slate-600 shrink-0" />
      </div>

      {/* MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-900">Ubah Kategori</h2>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 shrink-0">
              <div className="relative w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik minimal 1 karakter untuk mencari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Pilih hingga subkategori terdalam
              </span>
            </div>

            {/* Area Pilihan Kolom Hierarki / Search */}
            <div className="relative flex-1 min-h-[360px] max-h-[460px] bg-white overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Memuat data hierarki kategori...
                </div>
              ) : searchQuery.trim() ? (
                <div className="h-full overflow-y-auto p-4 space-y-1">
                  {searchResults.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Tidak ada kategori yang cocok dengan "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((res) => {
                      const isSelected = activePath.length > 0 && activePath[activePath.length - 1].id === res.leaf.id;
                      return (
                        <div
                          key={res.leaf.id}
                          onClick={() => setActivePath(res.fullPath)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                              : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {res.fullPath.map((p, idx) => (
                              <React.Fragment key={p.id}>
                                <span>{p.name}</span>
                                {idx < res.fullPath.length - 1 && (
                                  <ChevronRight size={12} className="text-slate-300" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="relative h-full flex items-stretch">
                  {canScrollLeft && (
                    <button
                      type="button"
                      onClick={() => handleSlide('left')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center transition"
                      title="Geser Kiri"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}

                  <div
                    ref={scrollContainerRef}
                    onScroll={updateScrollButtons}
                    className="flex-1 flex overflow-x-auto scrollbar-none divide-x divide-slate-100 h-full select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {columns.map((colItems, colIdx) => {
                      const selectedInCol = activePath[colIdx];
                      return (
                        <div 
                          key={colIdx} 
                          className="w-64 min-w-[250px] shrink-0 h-full overflow-y-auto p-2 space-y-0.5 bg-white"
                        >
                          {colItems.map((item) => {
                            const isNodeSelected = selectedInCol?.id === item.id;
                            const hasChildren = item.children && item.children.length > 0;
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectNode(item, colIdx)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition ${
                                  isNodeSelected
                                    ? 'text-indigo-700 font-semibold bg-indigo-50/70'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span className="truncate">{item.name}</span>
                                {hasChildren ? (
                                  <ChevronRight 
                                    size={14} 
                                    className={`shrink-0 ${isNodeSelected ? 'text-indigo-600' : 'text-slate-300'}`} 
                                  />
                                ) : (
                                  isNodeSelected && <Check size={14} className="text-indigo-600 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {canScrollRight && (
                    <button
                      type="button"
                      onClick={() => handleSlide('right')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center transition"
                      title="Geser Kanan"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 truncate max-w-xl">
                <span>Dipilih : </span>
                <span className="font-semibold text-slate-800">
                  {currentSelectionLabel || '(Belum memilih kategori)'}
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={activePath.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
