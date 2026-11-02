import React from 'react';
import type { Product } from '../../../types';
import { DataTable, type Column } from '../../../components/DataTable';
import { Tag, MapPin, AlertTriangle, Edit3, History, Archive, RotateCcw } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  canEdit: boolean;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
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
  onLimitChange,
  onEdit,
  onViewAudit,
  onToggleArchive,
}) => {
  const columns: Column<Product>[] = [
    {
      header: 'Barcode / SKU',
      headerClassName: 'py-4 px-5 w-32 whitespace-nowrap text-left text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 font-mono font-semibold text-indigo-600 whitespace-nowrap',
      render: (p) => p.barcode,
    },
    {
      header: 'Nama Barang',
      headerClassName: 'py-4 px-5 min-w-[220px] whitespace-nowrap text-left text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 font-bold text-slate-900 max-w-[280px] truncate whitespace-nowrap',
      render: (p) => (
        <span title={p.name}>{p.name}</span>
      ),
    },
    {
      header: 'Kategori',
      headerClassName: 'py-4 px-5 whitespace-nowrap text-left text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 whitespace-nowrap',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
          <Tag size={12} className="text-slate-400" />
          {(p as any).category_ref?.name || (typeof p.category === "object" ? (p.category as any)?.name : p.category) || "-"}
        </span>
      ),
    },
    {
      header: 'Harga Jual',
      headerClassName: 'py-4 px-5 text-right whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-right font-bold text-slate-900 whitespace-nowrap',
      render: (p) => `Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
    },
    {
      header: 'HPP Modal',
      headerClassName: 'py-4 px-5 text-right whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-right text-slate-500 font-medium whitespace-nowrap',
      render: (p) => {
        const costPrice = Number(p.costPrice ?? (p as any).cost_price) || 0;
        return `Rp ${costPrice.toLocaleString('id-ID')}`;
      },
    },
    {
      header: 'Stok',
      headerClassName: 'py-4 px-5 text-center whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-center whitespace-nowrap',
      render: (p) => {
        const stock = Number(p.stock) || 0;
        const minStock = Number(p.minStock ?? (p as any).min_stock) || 5;
        const isLowStock = stock <= minStock;

        return (
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
        );
      },
    },
    {
      header: 'Lokasi Rak',
      headerClassName: 'py-4 px-5 whitespace-nowrap text-left text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-slate-500 text-xs whitespace-nowrap',
      render: (p) => {
        const shelfLocation = p.shelfLocation || (p as any).shelf_location || '';
        return shelfLocation ? (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
            <MapPin size={12} />
            {shelfLocation}
          </span>
        ) : (
          <span className="text-slate-300">-</span>
        );
      },
    },
    {
      header: 'Status',
      headerClassName: 'py-4 px-5 text-center whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-center whitespace-nowrap',
      render: (p) => {
        const isActive = p.isActive !== undefined ? p.isActive : (p as any).is_active ?? true;
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isActive ? 'Aktif' : 'Arsip'}
          </span>
        );
      },
    },
    {
      header: 'Aksi & Log',
      headerClassName: 'py-4 px-5 text-center w-28 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-5 text-center whitespace-nowrap',
      render: (p) => {
        const isActive = p.isActive !== undefined ? p.isActive : (p as any).is_active ?? true;
        return (
          <div className="flex items-center justify-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(p)}
                title="Edit Data Barang"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
              >
                <Edit3 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onViewAudit(p)}
              title="Lihat Riwayat Audit (Tersimpan di DB)"
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
            >
              <History size={16} />
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => onToggleArchive(p.barcode)}
                title={isActive ? 'Arsipkan Barang' : 'Pulihkan Barang'}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isActive ? <Archive size={16} /> : <RotateCcw size={16} />}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      isLoading={isLoading}
      keyExtractor={(p) => p.barcode}
      emptyMessage="Tidak ada barang yang cocok dengan kriteria pencarian."
      page={page}
      limit={limit}
      totalItems={totalItems}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};
