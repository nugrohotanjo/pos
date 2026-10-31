import React, { useState, useMemo } from 'react';
import type { Product, Employee, CustomRole } from '../../types';
import { useProductStore } from '../../stores/useProductStore';
import { getProductAuditLogsFromApi } from '../../utils/api';
import { 
  Plus, 
  Search, 
  Edit3, 
  Archive, 
  RotateCcw, 
  History, 
  X, 
  Tag, 
  DollarSign, 
  MapPin, 
  AlertTriangle,
  Package,
  ShieldAlert,
  User,
  Calendar,
  FileText,
  ArrowRight
} from 'lucide-react';

interface ProductsViewProps {
  canEdit: boolean;
  currentUser: Employee | null;
  currentUserRole?: CustomRole;
  onAuditLog?: (module: any, action: any, details: string) => void;
}

// Helper untuk mengekstrak perubahan Before -> After dari teks database
function parseAuditDetails(details: string) {
  const comparisons: { label: string; from: string; to: string }[] = [];
  let reason = '';

  // Ekstrak Alasan jika ada
  const reasonMatch = details.match(/Alasan[:\s\-]+(.+?)(?:;|$)/i);
  if (reasonMatch) {
    reason = reasonMatch[1].trim();
  }

  // Ekstrak Perubahan Harga: Harga (RpA -> RpB)
  const priceMatch = details.match(/Harga\s*\(([^)]+)\)/i);
  if (priceMatch) {
    const parts = priceMatch[1].split('->');
    if (parts.length === 2) {
      comparisons.push({
        label: 'Harga Jual',
        from: parts[0].trim(),
        to: parts[1].trim()
      });
    }
  }

  // Ekstrak Perubahan Stok: Stok (A -> B Pcs)
  const stockMatch = details.match(/Stok\s*\(([^)]+)\)/i);
  if (stockMatch) {
    const parts = stockMatch[1].split('->');
    if (parts.length === 2) {
      comparisons.push({
        label: 'Stok Fisik',
        from: parts[0].trim(),
        to: parts[1].trim()
      });
    }
  }

  // Ekstrak HPP jika ada
  const hppMatch = details.match(/HPP\s*\(([^)]+)\)/i);
  if (hppMatch) {
    const parts = hppMatch[1].split('->');
    if (parts.length === 2) {
      comparisons.push({
        label: 'HPP Modal',
        from: parts[0].trim(),
        to: parts[1].trim()
      });
    }
  }

  return { comparisons, reason: reason || details };
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  canEdit,
  currentUser,
  currentUserRole,
  onAuditLog
}) => {
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const backendError = useProductStore((state) => state.backendError);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const toggleArchiveProduct = useProductStore((state) => state.toggleArchiveProduct);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // State Audit Modal dari Database
  const [auditProduct, setAuditProduct] = useState<Product | null>(null);
  const [dbAuditLogs, setDbAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Form Tambah State
  const [newBarcode, setNewBarcode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Umum');
  const [newPrice, setNewPrice] = useState('35000');
  const [newCostPrice, setNewCostPrice] = useState('20000');
  const [newStock, setNewStock] = useState('10');
  const [newUnit, setNewUnit] = useState('Pcs');
  const [newMinStock, setNewMinStock] = useState('5');
  const [newShelfLocation, setNewShelfLocation] = useState('');

  // Form Edit State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editUnit, setEditUnit] = useState('Pcs');
  const [editMinStock, setEditMinStock] = useState('5');
  const [editShelfLocation, setEditShelfLocation] = useState('');
  const [editReason, setEditReason] = useState('');

  const actorLabel = currentUser ? `${currentUser.name} (${currentUserRole?.name || 'Staf'})` : 'Sistem';

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm);
      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? p.isActive !== false :
        p.isActive === false;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditPrice(p.price.toString());
    setEditCostPrice(p.costPrice.toString());
    setEditStock(p.stock.toString());
    setEditUnit(p.unit || 'Pcs');
    setEditMinStock((p.minStock || 5).toString());
    setEditShelfLocation(p.shelfLocation || '');
    setEditReason('');
  };

  const handleOpenAuditModal = (p: Product) => {
    setAuditProduct(p);
    setIsLoadingAudit(true);
    setDbAuditLogs([]);

    getProductAuditLogsFromApi(p.barcode)
      .then((logs) => {
        setDbAuditLogs(logs);
      })
      .catch((err) => {
        console.error('Gagal mengambil audit logs:', err);
      })
      .finally(() => {
        setIsLoadingAudit(false);
      });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim() || !newName.trim()) {
      alert('Barcode dan Nama Barang wajib diisi!');
      return;
    }

    try {
      await addProduct(
        {
          barcode: newBarcode.trim(),
          name: newName.trim(),
          category: newCategory.trim() || 'Umum',
          price: Number(newPrice) || 0,
          costPrice: Number(newCostPrice) || 0,
          stock: Number(newStock) || 0,
          unit: newUnit,
          minStock: Number(newMinStock) || 5,
          shelfLocation: newShelfLocation.trim(),
          isActive: true
        },
        actorLabel,
        (details) => onAuditLog?.('PRODUCTS', 'CREATE_PRODUCT', details)
      );

      setIsAddModalOpen(false);
      setNewBarcode('');
      setNewName('');
      setNewPrice('35000');
      setNewCostPrice('20000');
      setNewStock('10');
      setNewShelfLocation('');
    } catch (err: any) {
      alert(`Gagal menambah produk: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editReason.trim()) {
      alert('Alasan perubahan wajib diisi untuk rekam audit!');
      return;
    }

    try {
      await updateProduct(
        editingProduct.barcode,
        {
          name: editName.trim(),
          category: editCategory.trim(),
          price: Number(editPrice) || 0,
          costPrice: Number(editCostPrice) || 0,
          stock: Number(editStock) || 0,
          unit: editUnit,
          minStock: Number(editMinStock) || 5,
          shelfLocation: editShelfLocation.trim()
        },
        editReason.trim(),
        actorLabel,
        (details) => onAuditLog?.('PRODUCTS', 'UPDATE_PRODUCT', details)
      );

      setEditingProduct(null);
    } catch (err: any) {
      alert(`Gagal memperbarui produk: ${err.message}`);
    }
  };

  const handleToggleArchive = async (barcode: string) => {
    try {
      await toggleArchiveProduct(barcode, (action, details) => {
        onAuditLog?.('PRODUCTS', action, details);
      });
    } catch (err: any) {
      alert(`Gagal mengubah status produk: ${err.message}`);
    }
  };

  if (backendError) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-rose-900 mb-2">
            Koneksi Backend Terputus
          </h2>
          <p className="text-rose-700 text-sm max-w-lg mx-auto mb-6">
            {backendError}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={fetchProducts}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition cursor-pointer shadow-sm"
            >
              Coba Hubungkan Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-sm">Memuat data produk dari database...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Sub Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Barang & Inventaris</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">
            Kelola harga jual, harga pokok (HPP), multi satuan, dan lokasi penataan fisik barang.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-sm transition cursor-pointer self-start md:self-auto"
          >
            <Plus size={18} />
            <span>Tambah Barang Baru</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari barcode / SKU atau nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ACTIVE">Status: Barang Aktif</option>
            <option value="ARCHIVED">Status: Diarsipkan</option>
            <option value="ALL">Status: Semua Barang</option>
          </select>
        </div>
      </div>

      {/* Tabel Master Barang */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs tracking-wider uppercase">
              <tr>
                <th className="py-4 px-5">Barcode / SKU</th>
                <th className="py-4 px-5">Nama Barang</th>
                <th className="py-4 px-5">Kategori</th>
                <th className="py-4 px-5 text-right">Harga Jual</th>
                <th className="py-4 px-5 text-right">HPP Modal</th>
                <th className="py-4 px-5 text-center">Stok</th>
                <th className="py-4 px-5">Lokasi Rak</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Aksi & Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-medium">Tidak ada barang yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock <= (p.minStock || 5);
                  return (
                    <tr key={p.barcode} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5 font-mono font-semibold text-indigo-600">
                        {p.barcode}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          <Tag size={12} className="text-slate-400" />
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-5 text-right text-slate-500 font-medium">
                        Rp {p.costPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          p.stock <= 0 ? 'text-rose-600' :
                          isLowStock ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {p.stock} <span className="text-xs font-normal text-slate-500">{p.unit || 'Pcs'}</span>
                          {isLowStock && (
                            <span title={`Stok minimum: ${p.minStock || 5}`}>
                              <AlertTriangle size={14} className="text-amber-500 inline ml-1" />
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-xs">
                        {p.shelfLocation ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                            <MapPin size={12} />
                            {p.shelfLocation}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          p.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.isActive !== false ? 'Aktif' : 'Arsip'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Data Barang"
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenAuditModal(p)}
                            title="Lihat Riwayat Audit (Tersimpan di DB)"
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                          >
                            <History size={16} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleToggleArchive(p.barcode)}
                              title={p.isActive !== false ? "Arsipkan Barang" : "Pulihkan Barang"}
                              className={`p-2 rounded-xl transition cursor-pointer ${
                                p.isActive !== false 
                                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' 
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {p.isActive !== false ? <Archive size={16} /> : <RotateCcw size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Barang */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Tambah Barang Baru (General Retail)
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Barcode / SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 89912345001"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pakaian, Material, Alat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kemeja Formal L / Semen 50kg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={0}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Harga Pokok / HPP (Rp)
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={newCostPrice}
                      onChange={(e) => setNewCostPrice(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Satuan
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Lusin">Lusin</option>
                    <option value="Box">Box / Dus</option>
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Meter">Meter</option>
                    <option value="Sak">Sak</option>
                    <option value="Kaleng">Kaleng</option>
                    <option value="Liter">Liter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Min. Stok
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Lokasi Rak / Gudang (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rak A-03, Gudang Barat"
                  value={newShelfLocation}
                  onChange={(e) => setNewShelfLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Barang */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Edit3 size={18} className="text-indigo-600" />
                  Koreksi Data Barang
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {editingProduct.barcode}</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Harga Pokok / HPP (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Stok Fisik
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Satuan
                  </label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Lusin">Lusin</option>
                    <option value="Box">Box / Dus</option>
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Meter">Meter</option>
                    <option value="Sak">Sak</option>
                    <option value="Kaleng">Kaleng</option>
                    <option value="Liter">Liter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Min. Stok
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Lokasi Rak
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rak B-01"
                  value={editShelfLocation}
                  onChange={(e) => setEditShelfLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Alasan Perubahan (Audit Trail) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koreksi harga dari distributor / Hasil stock opname"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-amber-200 bg-amber-50/40 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Audit Barang - Before & After Persisten dari Database */}
      {auditProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Riwayat Audit Perubahan Barang
                  </h3>
                  <p className="text-xs text-slate-500">
                    {auditProduct.name} <span className="font-mono text-indigo-600 font-semibold">({auditProduct.barcode})</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAuditProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {isLoadingAudit ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Mengambil catatan audit dari database...</p>
                </div>
              ) : dbAuditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <History size={24} />
                  </div>
                  <p className="font-semibold text-slate-700">Belum Ada Riwayat Perubahan di Database</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Setiap aksi Create, Update, dan Archive yang tersimpan di PostgreSQL akan tampil permanen di sini.
                  </p>
                </div>
              ) : (
                dbAuditLogs.map((log) => {
                  const { comparisons, reason } = parseAuditDetails(log.details || '');
                  return (
                    <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      {/* Header Log */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <User size={14} className="text-indigo-600" />
                          <span>{log.user || 'Sistem'} ({log.role || 'Admin'})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <Calendar size={13} />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>

                      {/* Alasan / Catatan Audit */}
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
                        <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                            Aksi: {log.action}
                          </span>
                          <p className="text-xs text-slate-800 font-medium mt-0.5">
                            {reason}
                          </p>
                        </div>
                      </div>

                      {/* Visualisasi Before -> After */}
                      {comparisons.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Komparasi Nilai (Before → After)
                          </span>
                          {comparisons.map((c, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 text-xs items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="col-span-3 font-semibold text-slate-600">{c.label}</span>
                              <span className="col-span-4 font-medium text-rose-700 line-through bg-rose-50 px-2.5 py-1 rounded">
                                {c.from}
                              </span>
                              <span className="col-span-1 text-center text-slate-400 font-bold">→</span>
                              <span className="col-span-4 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                                {c.to}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setAuditProduct(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
