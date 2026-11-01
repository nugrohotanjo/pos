import React, { useState, useEffect, useCallback } from 'react';
import type { AuditLog } from '../../types';
import { getAuditLogsServerSide } from '../../utils/api';
import { DataTable, type Column } from '../../components/DataTable';
import { 
  ShieldCheck, 
  Calendar, 
  GitCompare, 
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State & Filter (Default HANYA menampilkan yang berubah)
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLog | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogsServerSide({
        page,
        limit,
        search: searchQuery,
        module: moduleFilter === 'ALL' ? undefined : moduleFilter,
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      } as any);

      setLogs(res.data || []);
      if (res.pagination) {
        setTotalItems(res.pagination.total_items);
        setTotalPages(res.pagination.total_pages || 1);
      }
    } catch (err) {
      console.error('Gagal mengambil audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, moduleFilter, startDate, endDate]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const resetFilters = () => {
    setSearchQuery('');
    setModuleFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const parseJsonSafe = (raw?: string) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const formatDiffValue = (val: any, fieldKey: string) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-slate-300 italic font-normal">kosong (null)</span>;
    }
    if (typeof val === 'boolean') {
      return val ? 'Aktif (true)' : 'Nonaktif (false)';
    }
    if (fieldKey.includes('price') && typeof val === 'number') {
      return `Rp ${val.toLocaleString('id-ID')}`;
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  };

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'USERS_ROLES':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PRODUCTS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POS_TERMINAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SETTINGS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Waktu Kejadian',
      className: 'whitespace-nowrap font-mono text-xs text-slate-500 py-3.5 px-6',
      render: (log) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Calendar size={13} className="text-slate-400" />
          <span>{log.timestamp}</span>
        </div>
      ),
    },
    {
      header: 'Pelaksana (Actor)',
      className: 'whitespace-nowrap font-semibold text-slate-900 py-3.5 px-6',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
            {(log.user || log.actor || 'U').charAt(0).toUpperCase()}
          </div>
          <span>{log.user || log.actor}</span>
        </div>
      ),
    },
    {
      header: 'Modul & Aksi',
      className: 'whitespace-nowrap py-3.5 px-6',
      render: (log) => (
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getModuleBadgeColor(log.module)}`}>
            {log.module}
          </span>
          <span className="font-mono text-xs font-bold text-slate-800">
            {log.action}
          </span>
        </div>
      ),
    },
    {
      header: 'Rincian Perubahan',
      className: 'text-xs text-slate-600 max-w-md py-3.5 px-6',
      render: (log) => <span>{log.details}</span>,
    },
    {
      header: 'Snapshot Forensik',
      headerClassName: 'text-center',
      className: 'text-center whitespace-nowrap py-3.5 px-6',
      render: (log) => {
        const hasDiff = Boolean(log.old_values || log.new_values);
        return hasDiff ? (
          <button
            type="button"
            onClick={() => {
              setSelectedLogForDiff(log);
              setShowUnchanged(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition border border-indigo-200 cursor-pointer shadow-2xs"
          >
            <GitCompare size={14} />
            <span>Bandingkan Diff</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-slate-400 italic">
            Log Standar
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audit Trail & Forensic Diff Engine</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            Riwayat modifikasi data terpusat dengan deteksi perubahan snapshot otomatis.
          </p>
        </div>
      </div>

      {/* Komponen DataTable Utama */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyMessage="Tidak ada rekaman audit yang sesuai dengan filter."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        searchPlaceholder="Cari user, aksi, rincian aktivitas..."
        onRefresh={fetchAuditLogs}
        showResetFilter={Boolean(searchQuery || moduleFilter !== 'ALL' || startDate || endDate)}
        onResetFilter={resetFilters}
        page={page}
        limit={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
        filterSlot={
          <>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Modul</option>
              <option value="USERS_ROLES">Karyawan & Role</option>
              <option value="PRODUCTS">Master Barang</option>
              <option value="SETTINGS">Pengaturan Toko</option>
              <option value="POS_TERMINAL">Terminal Kasir POS</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              title="Dari Tanggal"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              title="Sampai Tanggal"
            />
          </>
        }
      />

      {/* Forensic Diff Modal */}
      {selectedLogForDiff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <GitCompare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Pemeriksa Forensik: Perbandingan Nilai (Before vs After)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pelaksana: <span className="font-semibold text-slate-800">{selectedLogForDiff.user || selectedLogForDiff.actor}</span> | {selectedLogForDiff.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDiff(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-bold text-slate-900">Aktivitas: </span>
                {selectedLogForDiff.details}
              </div>

              {(() => {
                const oldObj = parseJsonSafe(selectedLogForDiff.old_values) || {};
                const newObj = parseJsonSafe(selectedLogForDiff.new_values) || {};
                const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

                const changedKeys = allKeys.filter(
                  (k) => JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k])
                );

                // Default: HANYA tampilkan yang berubah kecuali showUnchanged diaktifkan
                const keysToRender = showUnchanged ? allKeys : changedKeys;

                return (
                  <div className="space-y-3">
                    {/* Toolbar Status Diff Ringkas */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Ditemukan:</span>
                        {changedKeys.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-500 text-white shadow-2xs">
                            <AlertCircle size={14} />
                            {changedKeys.length} atribut diubah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 size={14} />
                            Tidak ada perubahan nilai
                          </span>
                        )}
                        <span className="text-slate-400 font-medium">
                          ({allKeys.length - changedKeys.length} atribut lain tidak berubah)
                        </span>
                      </div>

                      {/* Tombol Toggle lihat yang tidak berubah */}
                      {allKeys.length > changedKeys.length && (
                        <button
                          type="button"
                          onClick={() => setShowUnchanged(!showUnchanged)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-semibold transition cursor-pointer text-xs"
                        >
                          {showUnchanged ? (
                            <>
                              <EyeOff size={13} className="text-slate-400" />
                              <span>Sembunyikan Atribut Tetap</span>
                            </>
                          ) : (
                            <>
                              <Eye size={13} className="text-slate-400" />
                              <span>Lihat Semua ({allKeys.length} Field)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {keysToRender.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                        Tidak ada atribut yang mengalami perubahan pada operasi ini.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4 w-1/4">Atribut / Kolom</th>
                              <th className="py-3 px-4 w-3/8 text-rose-800 bg-rose-50/70 border-r border-slate-200">
                                Sebelum (Before)
                              </th>
                              <th className="py-3 px-4 w-3/8 text-emerald-800 bg-emerald-50/70">
                                Sesudah (After)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {keysToRender.map((k) => {
                              const oldVal = oldObj[k];
                              const newVal = newObj[k];
                              const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                              return (
                                <tr
                                  key={k}
                                  className={isChanged ? 'bg-amber-50/20 font-medium' : 'hover:bg-slate-50/50 opacity-60'}
                                >
                                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span>{k}</span>
                                      {isChanged ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-bold tracking-wider uppercase font-mono shadow-2xs">
                                          DIUBAH
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-400 font-bold uppercase font-mono">
                                          TETAP
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className={`py-3 px-4 border-r border-slate-200 break-all ${
                                    isChanged ? 'bg-rose-50/40 text-rose-700 font-bold' : 'text-slate-500'
                                  }`}>
                                    {formatDiffValue(oldVal, k)}
                                  </td>

                                  <td className={`py-3 px-4 break-all ${
                                    isChanged ? 'bg-emerald-50/40 text-emerald-700 font-bold' : 'text-slate-500'
                                  }`}>
                                    <div className="flex items-center gap-1.5">
                                      {isChanged && <ArrowRight size={13} className="text-emerald-500 shrink-0" />}
                                      <span>{formatDiffValue(newVal, k)}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedLogForDiff(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                Tutup Pemeriksa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
