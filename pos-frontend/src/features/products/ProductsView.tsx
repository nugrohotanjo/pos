import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, Check, AlertTriangle, Archive, RotateCcw } from 'lucide-react';
import type { Product } from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface ProductsViewProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onToggleArchiveProduct?: (barcode: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ 
  products, 
  onAddProduct,
  onToggleArchiveProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categories, setCategories] = useState<string[]>([
    'Pakaian',
    'Perabotan',
    'Mainan',
    'Aksesoris'
  ]);

  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pakaian');
  const [stock, setStock] = useState<number>(50);

  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategoryOptions = categories.filter(cat =>
    cat.toLowerCase().includes(catSearchQuery.toLowerCase())
  );

  const isExactCategoryExist = categories.some(
    cat => cat.toLowerCase() === catSearchQuery.trim().toLowerCase()
  );

  const handleAddNewCategoryFromDropdown = () => {
    const trimmed = catSearchQuery.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setCategory(trimmed);
    setCatSearchQuery('');
    setIsCatDropdownOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const isArchived = p.isActive === false;
    const matchStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !isArchived) ||
      (statusFilter === 'ARCHIVED' && isArchived);

    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchCategory = selectedCategoryFilter === 'Semua' || p.category === selectedCategoryFilter;
    return matchStatus && matchSearch && matchCategory;
  });

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name) return;

    if (onAddProduct) {
      onAddProduct({
        barcode,
        name,
        category,
        stock: Number(stock),
        isActive: true
      });
    }

    setBarcode('');
    setName('');
    setStock(50);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Data Barang</h2>
          <p className="text-xs text-slate-500 mt-1">Katalog toko serba Rp 35.000 dengan sistem arsip soft delete</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Barang Baru
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari nama atau barcode..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white" 
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Filter Status Soft Delete */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ACTIVE">Barang Aktif</option>
              <option value="ARCHIVED">Barang Diarsipkan</option>
              <option value="ALL">Semua Data</option>
            </select>
          </div>

          <div className="text-sm font-semibold text-slate-500">
            Menampilkan {filteredProducts.length} dari {products.length} SKU
          </div>
        </div>

        {/* Tabel Data Barang */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 sticky top-0 border-b border-slate-200 shadow-sm text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Barcode</th>
                <th className="py-3 px-6">Nama Barang</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6 text-right">Harga Jual</th>
                <th className="py-3 px-6 text-center">Stok Gudang</th>
                <th className="py-3 px-6 text-center">Status Barang</th>
                <th className="py-3 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isArchived = p.isActive === false;
                return (
                  <tr key={p.barcode} className={`hover:bg-slate-50 ${isArchived ? 'bg-slate-50/70 opacity-60' : p.stock < 0 ? 'bg-rose-50/40' : ''}`}>
                    <td className="py-3 px-6 font-mono text-indigo-600 font-medium">{p.barcode}</td>
                    <td className="py-3 px-6 font-medium text-slate-800">
                      {p.name}
                      {isArchived && <span className="text-[10px] ml-2 text-slate-400 font-normal">(Diarsipkan)</span>}
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-semibold text-slate-700">Rp {FIXED_PRICE.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`font-bold font-mono ${
                        p.stock < 0 
                          ? 'text-rose-600 underline' 
                          : p.stock < 10 
                          ? 'text-amber-600' 
                          : 'text-emerald-600'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {isArchived ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                          Nonaktif
                        </span>
                      ) : p.stock < 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Wajib Opname
                        </span>
                      ) : p.stock < 10 ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700">
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {onToggleArchiveProduct && (
                        <button
                          type="button"
                          onClick={() => onToggleArchiveProduct(p.barcode)}
                          className={`text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                            isArchived 
                              ? 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200' 
                              : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                          }`}
                        >
                          {isArchived ? (
                            <>
                              <RotateCcw className="w-3 h-3" /> Pulihkan
                            </>
                          ) : (
                            <>
                              <Archive className="w-3 h-3" /> Arsipkan
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Barang */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800">Tambah SKU Barang Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kode Barcode / EAN</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 899112233" 
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Piring Melamin Motif Daun" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Barang</label>
                
                <button
                  type="button"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white flex items-center justify-between focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <span className="font-medium text-slate-800">{category}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Cari atau tambah kategori..."
                          value={catSearchQuery}
                          onChange={(e) => setCatSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {catSearchQuery.trim() !== '' && !isExactCategoryExist && (
                      <div className="p-2 border-b border-slate-100 bg-indigo-50/60">
                        <button
                          type="button"
                          onClick={handleAddNewCategoryFromDropdown}
                          className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambahkan "{catSearchQuery.trim()}"
                        </button>
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto p-1">
                      {filteredCategoryOptions.length > 0 ? (
                        filteredCategoryOptions.map((cat) => {
                          const isSelected = category === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCategory(cat);
                                setIsCatDropdownOpen(false);
                                setCatSearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                                isSelected 
                                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span>{cat}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Tidak ada kategori yang cocok
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Jumlah Stok Awal</label>
                <input 
                  type="number" 
                  min={0}
                  value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Harga Jual Terkunci</label>
                <input 
                  type="text" 
                  disabled
                  value="Rp 35.000 (Toko Serba 35rb)" 
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};