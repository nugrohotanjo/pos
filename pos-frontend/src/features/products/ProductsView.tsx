import React, { useState, useEffect } from 'react';
import type { Product, Employee, CustomRole } from '../../types';
import { useProductStore } from '../../stores/useProductStore';
import { getProductAuditLogsFromApi } from '../../utils/api';
import { ProductAuditModal } from './components/ProductAuditModal';
import { ProductTable } from './components/ProductTable';
import { ProductFormPage } from './ProductFormPage';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Archive, 
  ArchiveRestore, 
  History, 
  Edit3, 
  AlertTriangle,
  Package,
  Layers
} from 'lucide-react';

interface ProductsViewProps {
  currentUser: Employee | null;
  currentUserRole?: CustomRole;
  canEdit?: boolean;
  onAuditLog?: (module: any, action: any, details: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  currentUser,
  currentUserRole,
  canEdit = true,
  onAuditLog,
}) => {
  const {
    products,
    categories,
    isLoading,
    backendError,
    search,
    categoryFilter,
    statusFilter,
    page,
    limit,
    totalItems,
    totalPages,
    fetchProducts,
    fetchCategories,
    setFilter,
addProduct,
    updateProduct,
    toggleArchiveProduct,
  } = useProductStore();

  const [searchInput, setSearchInput] = useState(search);
  const [viewMode, setViewMode] = useState<'LIST' | 'ADD' | 'EDIT'>('LIST');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Audit Logs Modal State
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
    await addProduct(newProduct);
  };

  const handleSaveEdit = async (barcode: string, updatedFields: any) => {
    try {
      await updateProduct(barcode, updatedFields, "Pembaruan produk via Form SPA");
    } catch (err: any) {
      alert(`Gagal ubah data produk: ${err.message}`);
    }
  };

  const handleToggleArchive = async (barcode: string, currentIsActive: boolean) => {
    const actionLabel = currentIsActive ? "mengarsipkan" : "mengaktifkan kembali";
    if (!confirm(`Apakah Anda yakin ingin ${actionLabel} produk ini?`)) return;

    try {
      await toggleArchiveProduct(barcode);
    } catch (err: any) {
      alert(`Gagal ubah status arsip: ${err.message}`);
    }
  };

  // --- SPA VIEW ROUTING ---
  if (viewMode === 'ADD') {
    return (
      <ProductFormPage
        onSave={async (newProd) => {
          await handleSaveAdd(newProd);
          setViewMode('LIST');
          fetchProducts();
        }}
        onBack={() => setViewMode('LIST')}
      />
    );
  }

  if (viewMode === 'EDIT' && editingProduct) {
    return (
      <ProductFormPage
        initialProduct={editingProduct}
        onSave={async (updatedData) => {
          await handleSaveEdit(editingProduct.barcode, updatedData);
          setEditingProduct(null);
          setViewMode('LIST');
          fetchProducts();
        }}
        onBack={() => {
          setEditingProduct(null);
          setViewMode('LIST');
        }}
      />
    );
  }

  if (backendError) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={36} />
        <h3 className="text-base font-bold text-rose-800">Gagal Memuat Produk</h3>
        <p className="text-xs text-rose-600 mt-1">{backendError}</p>
        <button
          type="button"
          onClick={() => fetchProducts()}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Produk & Stok</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            Kelola data master barang, harga modal/jual, dan hierarki kategori toko.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setViewMode('ADD')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Barang</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari barcode atau nama produk..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setFilter('categoryFilter', e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            {categories?.map((c: any, idx: number) => {
              const catName = typeof c === 'string' ? c : c?.name || '';
              return (
                <option key={idx} value={catName}>
                  {catName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setFilter('statusFilter', e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">🟢 Aktif</option>
            <option value="INACTIVE">🔴 Tidak Aktif (Draft)</option>
          </select>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => fetchProducts()}
            title="Refresh Data"
            className="w-full p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* Tabel Data Produk (Menggunakan Komponen Reusable) */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        canEdit={canEdit}
        page={page}
        limit={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(newPage) => setFilter('page', newPage)}
        onLimitChange={(newLimit) => {
          setFilter('limit', newLimit);
          setFilter('page', 1);
        }}
        onEdit={(p) => {
          setEditingProduct(p);
          setViewMode('EDIT');
        }}
        onViewAudit={handleOpenAuditModal}
        onToggleArchive={(barcode) => {
          const targetProduct = products.find((p) => p.barcode === barcode);
          const currentIsActive = targetProduct ? targetProduct.isActive !== false : true;
          handleToggleArchive(barcode, currentIsActive);
        }}
      />

      {/* Modal Audit Trail Log */}
      {auditProduct && (
        <ProductAuditModal
          product={auditProduct}
          logs={dbAuditLogs}
          isLoading={isLoadingAudit}
          onClose={() => setAuditProduct(null)}
        />
      )}
    </div>
  );
};
