import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, Check } from 'lucide-react';
import type { Product } from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface ProductsViewProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Kategori Master
  const [categories, setCategories] = useState<string[]>([
    'Pakaian',
    'Perabotan',
    'Mainan',
    'Aksesoris'
  ]);

  // Form State Tambah Produk
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pakaian');
  const [stock, setStock] = useState<number>(50);

  // State Dropdown Kategori di Form Modal
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Kategori di dalam Dropdown
  const filteredCategoryOptions = categories.filter(cat =>
    cat.toLowerCase().includes(catSearchQuery.toLowerCase())
  );

  const isExactCategoryExist = categories.some(
    cat => cat.toLowerCase() === catSearchQuery.trim().toLowerCase()
  );

  // Fungsi Tambah Kategori Baru Langsung dari List Dropdown
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

  // Filter Data Produk Tabel
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchCategory = selectedCategoryFilter === 'Semua' || p.category === selectedCategoryFilter;
    return matchSearch && matchCategory;
  });

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name) return;

    if (onAddProduct) {
      onAddProduct({
        barcode,
        name,
        category,
        stock: Number(stock)
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
        <h2 className="text-2xl font-bold text-slate-800">Master Data Barang</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Barang Baru
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar Tabel */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
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

            {/* Filter Kategori Tabel */}
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
          </div>

          <div className="text-sm font-semibold text-slate-500">
            Menampilkan {filteredProducts.length} dari {products.length} SKU
          </div>
        </div>

        {/* Tabel Data Barang */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 sticky top-0 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="py-3 px-6">Barcode</th>
                <th className="py-3 px-6">Nama Barang</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6 text-right">Harga Jual</th>
                <th className="py-3 px-6 text-center">Stok Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.barcode} className="hover:bg-slate-50">
                  <td className="py-3 px-6 font-mono text-indigo-600 font-medium">{p.barcode}</td>
                  <td className="py-3 px-6 font-medium text-slate-800">{p.name}</td>
                  <td className="py-3 px-6">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-700">Rp {FIXED_PRICE.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>{p.stock}</span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT BARANG BARU */}
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

              {/* Custom Searchable Select dengan Tombol Tambah di List */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Barang</label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white flex items-center justify-between focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <span className="font-medium text-slate-800">{category}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu Popover */}
                {isCatDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {/* Input Search di Atas List Option */}
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

                    {/* Tombol Tambahkan Jika Kategori Belum Terdaftar */}
                    {catSearchQuery.trim() !== '' && !isExactCategoryExist && (
                      <div className="p-2 border-b border-slate-100 bg-indigo-50/60">
                        <button
                          type="button"
                          onClick={handleAddNewCategoryFromDropdown}
                          className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambahkan &quot;{catSearchQuery.trim()}&quot;
                        </button>
                      </div>
                    )}

                    {/* Daftar Opsi Kategori */}
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
                  min={1}
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