import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  X,
  ChevronDown,
  Check,
  AlertTriangle,
  Archive,
  RotateCcw,
  Pencil,
  History,
  Lock
} from 'lucide-react';
import type { Product } from '../../types';
import { FIXED_PRICE } from '../../data/mockData';
import { Pagination } from '../../components/ui/Pagination';

interface ProductsViewProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onToggleArchiveProduct?: (barcode: string) => void;
  onUpdateProduct?: (
    barcode: string,
    updatedFields: { name: string; category: string; stock: number; price?: number; costPrice?: number },
    reason: string
  ) => void;
  canEdit?: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onToggleArchiveProduct,
  onUpdateProduct,
  canEdit = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modal Tambah Barang
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pakaian');
  const [stock, setStock] = useState<number>(50);

  // Modal Edit Barang
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(FIXED_PRICE);
  const [editCostPrice, setEditCostPrice] = useState<number>(20000);
  const [editReason, setEditReason] = useState('');

  // Modal Riwayat Audit Spesifik Barang
  const [viewHistoryProduct, setViewHistoryProduct] = useState<Product | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [categories, setCategories] = useState<string[]>([
    'Pakaian',
    'Perabotan',
    'Mainan',
    'Aksesoris'
  ]);

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

  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name) return;

    if (onAddProduct) {
      onAddProduct({
        barcode,
        name,
        category,
        stock: Number(stock),
        price: FIXED_PRICE,
        costPrice: 20000,
        isActive: true,
        history: []
      });
    }

    setBarcode('');
    setName('');
    setStock(50);
    setIsModalOpen(false);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditStock(p.stock);
    setEditPrice(p.price || FIXED_PRICE);
    setEditCostPrice(p.costPrice || 20000);
    setEditReason('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (onUpdateProduct) {
      onUpdateProduct(
        editingProduct.barcode,
        {
          name: editName,
          category: editCategory,
          stock: Number(editStock),
          price: Number(editPrice),
          costPrice: Number(editCostPrice),
        },
        editReason || 'Pembaruan data manual oleh staf'
      );
    }

    setEditingProduct(null);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Data Barang</h2>
          <p className="text-xs text-slate-500 mt-1">Katalog toko serba Rp 35.000 dengan audit trail per-SKU</p>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ACTIVE">Barang Aktif</option>
              <option value="ARCHIVED">Barang Diarsipkan</option>
              <option value="ALL">Semua Data</option>
            </select>
          </div>

          <div className="text-sm font-semibold text-slate-500">
            Total {filteredProducts.length} SKU
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
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Aksi & Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map(p => {
                const isArchived = p.isActive === false;
                const historyCount = p.history?.length || 0;

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
                    <td className="py-3 px-6 text-right font-semibold text-slate-700">
                      Rp {(p.price || FIXED_PRICE).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`font-bold font-mono ${p.stock < 0
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
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Edit */}
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => openEditModal(p)}
                          title={canEdit ? 'Edit SKU Barang' : 'Anda tidak punya izin mengedit barang'}
                          className={`p-1.5 rounded border transition-colors ${canEdit
                              ? 'text-indigo-600 hover:bg-indigo-50 border-indigo-200'
                              : 'text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Riwayat Audit Barang */}
                        <button
                          type="button"
                          onClick={() => setViewHistoryProduct(p)}
                          title="Lihat riwayat siapa & jam berapa mengupdate barang ini"
                          className="p-1.5 rounded border text-amber-600 hover:bg-amber-50 border-amber-200 relative transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          {historyCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                              {historyCount}
                            </span>
                          )}
                        </button>

                        {/* Tombol Arsipkan / Pulihkan */}
                        {onToggleArchiveProduct && (
                          <button
                            type="button"
                            onClick={() => onToggleArchiveProduct(p.barcode)}
                            title={isArchived ? 'Pulihkan Barang' : 'Arsipkan Barang'}
                            className={`p-1.5 rounded border transition-colors ${isArchived
                                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                : 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              }`}
                          >
                            {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredProducts.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* MODAL 1: EDIT BARANG */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-800">Edit SKU: {editingProduct.barcode}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Stok Fisik Real</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={e => setEditStock(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Biaya Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={editCostPrice}
                    onChange={e => setEditCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alasan Perubahan <span className="text-rose-500 font-bold">*Wajib Diisi untuk Audit Trail</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koreksi selisih fisik stock opname rak 3"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  className="w-full p-2.5 border border-amber-300 bg-amber-50/30 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Perubahan & Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RIWAYAT AUDIT PER-PRODUK */}
      {viewHistoryProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-lg text-slate-800">Riwayat Audit: {viewHistoryProduct.name}</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Barcode: {viewHistoryProduct.barcode}</p>
              </div>
              <button onClick={() => setViewHistoryProduct(null)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {(viewHistoryProduct.history && viewHistoryProduct.history.length > 0) ? (
                viewHistoryProduct.history.map((h) => {
                  // Cek field mana saja yang mengalami perubahan nilai
                  const isNameChanged = h.oldValues.name !== h.newValues.name;
                  const isCategoryChanged = h.oldValues.category !== h.newValues.category;
                  const isStockChanged = h.oldValues.stock !== h.newValues.stock;
                  const isPriceChanged = h.oldValues.price !== h.newValues.price;

                  return (
                    <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-bold text-slate-800">Diupdate oleh: <span className="text-indigo-600">{h.updatedBy}</span></span>
                        <span className="font-mono text-slate-400">{h.timestamp}</span>
                      </div>

                      <p className="text-slate-600">
                        <b className="text-slate-700">Alasan:</b> {h.reason}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        {/* Kolom Nilai Sebelum */}
                        <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded text-rose-800 space-y-1">
                          <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-rose-900 border-b border-rose-200 pb-1">
                            Nilai Sebelum:
                          </span>
                          <div className={isNameChanged ? 'font-black underline text-rose-950' : 'opacity-70'}>
                            Nama: {h.oldValues.name}
                          </div>
                          <div className={isCategoryChanged ? 'font-black underline text-rose-950' : 'opacity-70'}>
                            Kategori: {h.oldValues.category}
                          </div>
                          <div className={isStockChanged ? 'font-black underline text-rose-950' : 'opacity-70'}>
                            Stok: {h.oldValues.stock} pcs
                          </div>
                          <div className={isPriceChanged ? 'font-black underline text-rose-950' : 'opacity-70'}>
                            Harga: Rp {h.oldValues.price?.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Kolom Nilai Sesudah */}
                        <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded text-emerald-800 space-y-1">
                          <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
                            Nilai Sesudah:
                          </span>
                          <div className={isNameChanged ? 'font-black underline text-emerald-950' : 'opacity-70'}>
                            Nama: {h.newValues.name}
                          </div>
                          <div className={isCategoryChanged ? 'font-black underline text-emerald-950' : 'opacity-70'}>
                            Kategori: {h.newValues.category}
                          </div>
                          <div className={isStockChanged ? 'font-black underline text-emerald-950' : 'opacity-70'}>
                            Stok: {h.newValues.stock} pcs
                          </div>
                          <div className={isPriceChanged ? 'font-black underline text-emerald-950' : 'opacity-70'}>
                            Harga: Rp {h.newValues.price?.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Belum ada riwayat perubahan manual pada barang ini.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewHistoryProduct(null)}
                className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH BARANG */}
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
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${isSelected
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