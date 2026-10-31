import React, { useState, useEffect } from 'react';
import type { Product, Employee, CustomRole } from '../../types';
import { useProductStore } from '../../stores/useProductStore';
import { getProductAuditLogsFromApi } from '../../utils/api';
import { ProductTable } from './components/ProductTable';
import { ProductAddModal } from './components/ProductAddModal';
import { ProductEditModal } from './components/ProductEditModal';
import { ProductAuditModal } from './components/ProductAuditModal';
import { Plus, Search, Package, ShieldAlert } from 'lucide-react';

interface ProductsViewProps {
  canEdit: boolean;
  currentUser: Employee | null;
  currentUserRole?: CustomRole;
  onAuditLog?: (module: any, action: any, details: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  canEdit,
  currentUser,
  currentUserRole,
  onAuditLog,
}) => {
  const {
    products = [],
    categories = [],
    isLoading,
    backendError,
    page = 1,
    limit = 10,
    totalItems = 0,
    totalPages = 1,
    search = '',
    categoryFilter = 'ALL',
    statusFilter = 'ACTIVE',
    fetchProducts,
    fetchCategories,
    setFilter,
    addProduct,
    updateProduct,
    toggleArchiveProduct,
  } = useProductStore();

  const [searchInput, setSearchInput] = useState(search);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [auditProduct, setAuditProduct] = useState<Product | null>(null);
  const [dbAuditLogs, setDbAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Debounce search agar hemat beban query server
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        setFilter('search', searchInput);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const actorLabel = currentUser ? `${currentUser.name} (${currentUserRole?.name || 'Staf'})` : 'Sistem';

  const handleOpenAuditModal = (p: Product) => {
    setAuditProduct(p);
    setIsLoadingAudit(true);
    setDbAuditLogs([]);

    getProductAuditLogsFromApi(p.barcode)
      .then((logs) => setDbAuditLogs(logs))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingAudit(false));
  };

  const handleSaveAdd = async (newProduct: Product) => {
    await addProduct(newProduct, actorLabel, (details) =>
      onAuditLog?.('PRODUCTS', 'CREATE_PRODUCT', details)
    );
  };

  const handleSaveEdit = async (barcode: string, updatedFields: any, reason: string) => {
    await updateProduct(barcode, updatedFields, reason, actorLabel, (details) =>
      onAuditLog?.('PRODUCTS', 'UPDATE_PRODUCT', details)
    );
  };

  const handleToggleArchive = async (barcode: string) => {
    try {
      await toggleArchiveProduct(barcode, (action, details) => {
        onAuditLog?.('PRODUCTS', action, details);
      });
    } catch (err: any) {
      alert(`Gagal ubah status arsip: ${err.message}`);
    }
  };

  if (backendError) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-rose-900 mb-2">Koneksi Backend Terputus</h2>
          <p className="text-rose-700 text-sm max-w-lg mx-auto mb-6">{backendError}</p>
          <button
            onClick={() => fetchProducts()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition cursor-pointer shadow-sm"
          >
            Coba Hubungkan Kembali
          </button>
        </div>
      </div>
    );
  }

  const safeTotalItems = Number(totalItems) || 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
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
            Terhubung ke database server-side. Total {safeTotalItems.toLocaleString('id-ID')} barang terindeks.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-sm transition cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus size={18} />
            <span>Tambah Barang Baru</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar Server Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs items-center">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari barcode / SKU atau nama barang..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setFilter('categoryFilter', e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori ({categories?.length || 0})</option>
            {categories?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setFilter('statusFilter', e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ACTIVE">Barang Aktif</option>
            <option value="ARCHIVED">Diarsipkan</option>
            <option value="ALL">Semua Status</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex items-center justify-end gap-2 text-xs text-slate-500">
          <span className="shrink-0 font-medium">Tampil:</span>
          <select
            value={limit}
            onChange={(e) => setFilter('limit', Number(e.target.value))}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
          >
            <option value={10}>10 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
            <option value={100}>100 Baris</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Produk */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        canEdit={canEdit}
        page={page}
        limit={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(p) => setFilter('page', p)}
        onEdit={(p) => setEditingProduct(p)}
        onViewAudit={handleOpenAuditModal}
        onToggleArchive={handleToggleArchive}
      />

      {/* Dialog Modals */}
      <ProductAddModal
        isOpen={isAddModalOpen}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAdd}
      />

      <ProductEditModal
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEdit}
      />

      <ProductAuditModal
        product={auditProduct}
        logs={dbAuditLogs}
        isLoading={isLoadingAudit}
        onClose={() => setAuditProduct(null)}
      />
    </div>
  );
};
