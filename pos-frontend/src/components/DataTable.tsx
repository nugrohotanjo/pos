import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  FilterX,
  RotateCw,
  RefreshCw,
  ArrowUpDown,
  Inbox,
} from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;

  // Search & Filter
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Fitur Filter Khusus (Slot untuk Dropdown Modul/Kategori, Date Range, dll)
  filterSlot?: React.ReactNode;
  onResetFilter?: () => void;
  showResetFilter?: boolean;

  // Action Bar Kanan (misal: tombol Tambah Barang / Refresh)
  actionSlot?: React.ReactNode;
  onRefresh?: () => void;

  // Pagination
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  emptyMessage = 'Tidak ada data yang tersedia.',
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filterSlot,
  onResetFilter,
  showResetFilter = false,
  actionSlot,
  onRefresh,
  page = 1,
  limit = 15,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 15, 25, 50, 100],
}: DataTableProps<T>) {
  const startIndex = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalItems);

    const hasTopBar = Boolean(
    onSearchChange || 
    filterSlot || 
    (showResetFilter && onResetFilter) || 
    actionSlot || 
    onRefresh
  );

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      {hasTopBar && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Kolom Kiri: Search & Filter Slot */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {onSearchChange && (
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                />
              </div>
            )}

            {/* Custom Filter (Dropdown / Daterange / dll) */}
            {filterSlot}

            {/* Tombol Reset Filter */}
            {showResetFilter && onResetFilter && (
              <button
                type="button"
                onClick={onResetFilter}
                title="Reset Semua Filter"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition cursor-pointer flex items-center justify-center shrink-0"
              >
                <FilterX size={16} />
              </button>
            )}
          </div>

          {/* Kolom Kanan: Actions & Refresh */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {actionSlot}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Segarkan Data"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 min-w-[750px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`py-3.5 px-6 ${col.headerClassName || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-slate-400 text-xs">
                    <RotateCw size={22} className="animate-spin mx-auto mb-2.5 text-indigo-600" />
                    <span>Memuat data ke tabel...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-slate-400 text-xs">
                    <Inbox size={32} className="mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p>{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    className="hover:bg-indigo-50/80 transition-colors duration-150 transition"
                  >
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`py-3.5 px-6 ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row)
                          : col.accessor
                          ? String(row[col.accessor] ?? '')
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* DataTables Pagination & Entry Controls */}
        {onPageChange && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            {/* Bagian Kiri: Total Data & Dropdown Limit */}
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Menampilkan <span className="font-bold text-slate-900">{startIndex}</span> -{' '}
                <span className="font-bold text-slate-900">{endIndex}</span> dari{' '}
                <span className="font-bold text-indigo-600">{totalItems}</span> baris
              </span>

              {onLimitChange && (
                <div className="flex items-center gap-1.5">
                  <span>Baris per halaman:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      onLimitChange(Number(e.target.value));
                      onPageChange(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                  >
                    {limitOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Bagian Kanan: Navigasi Halaman Lengkap */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Tombol Halaman Pertama */}
              <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || isLoading}
                className="p-1.5 border border-slate-200 bg-white hover:bg-indigo-50/80 transition-colors duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="Halaman Pertama"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Tombol Halaman Sebelumnya */}
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="p-1.5 border border-slate-200 bg-white hover:bg-indigo-50/80 transition-colors duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Input Loncat ke Halaman (Jump Page) */}
              <div className="flex items-center gap-1.5 px-3 py-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs text-xs">
                <span>Hal.</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, totalPages)}
                  value={page}
                  onChange={(e) => {
                    const target = parseInt(e.target.value, 10);
                    if (!isNaN(target) && target >= 1 && target <= totalPages) {
                      onPageChange(target);
                    }
                  }}
                  className="w-12 text-center py-0.5 border border-slate-200 rounded bg-slate-50 font-bold text-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Ketik nomor halaman untuk loncat langsung"
                />
                <span className="text-slate-400">/</span>
                <span>{totalPages || 1}</span>
              </div>

              {/* Tombol Halaman Berikutnya */}
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 border border-slate-200 bg-white hover:bg-indigo-50/80 transition-colors duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="Halaman Berikutnya"
              >
                <ChevronRight size={16} />
              </button>

              {/* Tombol Halaman Terakhir */}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 border border-slate-200 bg-white hover:bg-indigo-50/80 transition-colors duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="Halaman Terakhir"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
