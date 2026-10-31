import React from 'react';
import type { Product } from '../../../types';
import { Tag, MapPin, AlertTriangle, Edit3, History, Archive, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  canEdit: boolean;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onEdit: (product: Product) => void;
  onViewAudit: (product: Product) => void;
  onToggleArchive: (barcode: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  canEdit,
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
  onEdit,
  onViewAudit,
  onToggleArchive,
}) => {
  const safeTotalItems = Number(totalItems) || 0;
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;
  const safeTotalPages = Number(totalPages) || 1;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[980px] text-left text-sm text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs tracking-wider uppercase">
            <tr>
              <th className="py-4 px-5 w-32">Barcode / SKU</th>
              <th className="py-4 px-5 min-w-[220px]">Nama Barang</th>
              <th className="py-4 px-5">Kategori</th>
              <th className="py-4 px-5 text-right">Harga Jual</th>
              <th className="py-4 px-5 text-right">HPP Modal</th>
              <th className="py-4 px-5 text-center">Stok</th>
              <th className="py-4 px-5">Lokasi Rak</th>
              <th className="py-4 px-5 text-center">Status</th>
              <th className="py-4 px-5 text-center w-28">Aksi & Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <p className="font-medium">Tidak ada barang yang cocok dengan kriteria pencarian.</p>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const price = Number(p.price) || 0;
                const costPrice = Number(p.costPrice ?? (p as any).cost_price) || 0;
                const stock = Number(p.stock) || 0;
                const minStock = Number(p.minStock ?? (p as any).min_stock) || 5;
                const shelfLocation = p.shelfLocation || (p as any).shelf_location || '';
                const isLowStock = stock <= minStock;

                return (
                  <tr key={p.barcode} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 font-mono font-semibold text-indigo-600">{p.barcode}</td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-[280px] truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        <Tag size={12} className="text-slate-400" />
                        {p.category || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-slate-900">
                      Rp {price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-5 text-right text-slate-500 font-medium">
                      Rp {costPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          stock <= 0 ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {stock} <span className="text-xs font-normal text-slate-500">{p.unit || 'Pcs'}</span>
                        {isLowStock && (
                          <span title={`Stok minimum: ${minStock}`}>
                            <AlertTriangle size={14} className="text-amber-500 inline ml-1" />
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-xs">
                      {shelfLocation ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                          <MapPin size={12} />
                          {shelfLocation}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          p.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.isActive !== false ? 'Aktif' : 'Arsip'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(p)}
                            title="Edit Data Barang"
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => onViewAudit(p)}
                          title="Lihat Riwayat Audit (Tersimpan di DB)"
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                        >
                          <History size={16} />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onToggleArchive(p.barcode)}
                            title={p.isActive !== false ? 'Arsipkan Barang' : 'Pulihkan Barang'}
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

      {/* Footer Pagination Controls */}
      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Menampilkan{' '}
          <span className="font-bold text-slate-800">
            {safeTotalItems === 0 ? 0 : (safePage - 1) * safeLimit + 1}
          </span>{' '}
          -{' '}
          <span className="font-bold text-slate-800">
            {Math.min(safePage * safeLimit, safeTotalItems)}
          </span>{' '}
          dari <span className="font-bold text-slate-800">{safeTotalItems.toLocaleString('id-ID')}</span> barang
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(safePage - 1, 1))}
            disabled={safePage === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: safeTotalPages }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (safeTotalPages <= 7) return true;
                return pageNum === 1 || pageNum === safeTotalPages || Math.abs(pageNum - safePage) <= 1;
              })
              .map((pageNum, index, array) => {
                const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-8 h-8 px-2 rounded-xl font-bold transition text-xs cursor-pointer ${
                        safePage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => onPageChange(Math.min(safePage + 1, safeTotalPages))}
            disabled={safePage === safeTotalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Halaman Berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
