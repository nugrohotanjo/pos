import React, { useState, useEffect } from 'react';
import { getAuditLogsServerSide } from '../../utils/api';
import { 
  ShieldCheck, 
  Search, 
  User, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Tag,
  Activity
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce input pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load data dari backend PostgreSQL
  const loadAuditLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAuditLogsServerSide({
        page,
        limit,
        search,
        module: moduleFilter,
      });

      setLogs(res.data || []);
      setTotalItems(res.pagination.total_items);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke database audit log.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, limit, moduleFilter, search]);

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'PRODUCTS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POS_TERMINAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INVENTORY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'USERS_ROLES':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SETTINGS':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Sub Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audit Trail & Riwayat Sistem</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">
            Merekam seluruh aktivitas pengguna di database secara transparan (Create, Update, Delete, Stock Mutation, Kasir). Total {totalItems.toLocaleString('id-ID')} aktivitas.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs items-center">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari aktor, nomor barcode, atau keterangan aktivitas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700 font-medium"
          >
            <option value="ALL">Semua Modul</option>
            <option value="PRODUCTS">Master Barang (PRODUCTS)</option>
            <option value="POS_TERMINAL">Transaksi Kasir (POS_TERMINAL)</option>
            <option value="INVENTORY">Kartu Stok (INVENTORY)</option>
            <option value="USERS_ROLES">Karyawan & Hak Akses (USERS_ROLES)</option>
            <option value="SETTINGS">Pengaturan Toko (SETTINGS)</option>
          </select>
        </div>

        <div className="lg:col-span-3 flex items-center justify-end gap-2 text-xs text-slate-500">
          <span className="shrink-0 font-medium">Tampil:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
          >
            <option value={10}>10 Baris</option>
            <option value={15}>15 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
            <option value={100}>100 Baris</option>
          </select>
        </div>
      </div>

      {/* Tabel Server-Side Audit Logs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[950px] text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs tracking-wider uppercase">
              <tr>
                <th className="py-4 px-5 w-44">Waktu Eksekusi</th>
                <th className="py-4 px-5 w-48">Petugas / Aktor</th>
                <th className="py-4 px-5 w-36">Modul</th>
                <th className="py-4 px-5 w-44">Jenis Aksi</th>
                <th className="py-4 px-5">Rincian Perubahan / Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="font-medium">Tidak ada rekaman audit log yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{log.timestamp || log.created_at || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <User size={13} />
                        </div>
                        <span className="truncate max-w-[150px] font-semibold">
                          {log.user || log.user_name || 'Sistem'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getModuleBadge(log.module)}`}>
                        <Tag size={11} />
                        {log.module}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs font-mono font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Activity size={13} className="text-indigo-500 shrink-0" />
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-700 leading-relaxed font-normal">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Server-Side */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {totalItems === 0 ? 0 : (page - 1) * limit + 1}
            </span>{' '}
            -{' '}
            <span className="font-bold text-slate-800">
              {Math.min(page * limit, totalItems)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{totalItems.toLocaleString('id-ID')}</span> rekaman audit
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  if (totalPages <= 7) return true;
                  return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1;
                })
                .map((pageNum, index, array) => {
                  const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setPage(pageNum)}
                        className={`min-w-8 h-8 px-2 rounded-xl font-bold transition text-xs cursor-pointer ${
                          page === pageNum
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
