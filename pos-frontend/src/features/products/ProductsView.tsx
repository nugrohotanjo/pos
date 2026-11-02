import React, { useState, useEffect } from 'react';
import type { Product, Employee, CustomRole } from '../../types';
import { useProductStore } from '../../stores/useProductStore';
import { getProductAuditLogsFromApi } from '../../utils/api';
import { ProductAuditModal } from './components/ProductAuditModal';
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
            <option value="ACTIVE">Aktif</option>
            <option value="ARCHIVED">Arsip</option>
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

      {/* Tabel Data Produk */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Barang & SKU</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-right">Harga Modal</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Memuat daftar produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              ) : (
                products.map((p: Product) => {
                  const isLowStock = p.stock <= (p.minStock || 5);
                  return (
                    <tr key={p.barcode} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.barcode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                          <Layers size={11} className="text-slate-400" />
                          <span>{p.category || '-'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono text-xs">
                        Rp {Number(p.costPrice ?? (p as any).cost_price ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLowStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.stock} {p.unit || 'Pcs'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.isActive !== false ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Diarsipkan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAuditModal(p)}
                            title="Riwayat Audit"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <History size={15} />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setViewMode('EDIT');
                                }}
                                title="Ubah Produk"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleArchive(p.barcode, p.isActive !== false)}
                                title={p.isActive !== false ? 'Arsipkan' : 'Aktifkan Kembali'}
                                className={`p-1.5 rounded-lg cursor-pointer ${
                                  p.isActive !== false
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {p.isActive !== false ? <Archive size={15} /> : <ArchiveRestore size={15} />}
                              </button>
                            </>
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

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Total <span className="font-bold text-slate-800">{totalItems}</span> barang (Halaman{' '}
            <span className="font-bold text-slate-800">{page}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setFilter("page", page - 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 cursor-pointer font-medium"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setFilter("page", page + 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 cursor-pointer font-medium"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

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
