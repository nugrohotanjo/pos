import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Package, 
  ShoppingCart, 
  Coins, 
  Users, 
  Sliders, 
  ArrowLeftRight 
} from 'lucide-react';
import type { AuditLog, AuditModule } from '../../types';

interface AuditTrailViewProps {
  logs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [selectedModule, setSelectedModule] = useState<'ALL' | AuditModule>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'APPROVED' | 'AUTO_RECORDED' | 'REJECTED'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      log.actor.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.id.toLowerCase().includes(query);

    return matchModule && matchStatus && matchSearch;
  });

  const getModuleBadge = (module: AuditModule) => {
    switch (module) {
      case 'PRODUCTS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3" /> Master Produk
          </span>
        );
      case 'INVENTORY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowLeftRight className="w-3 h-3" /> Mutasi Stok
          </span>
        );
      case 'POS_TERMINAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShoppingCart className="w-3 h-3" /> Kasir POS
          </span>
        );
      case 'PETTY_CASH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Coins className="w-3 h-3" /> Kas Laci
          </span>
        );
      case 'USERS_ROLES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Users className="w-3 h-3" /> Staf & Role
          </span>
        );
      case 'SETTINGS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Sliders className="w-3 h-3" /> Pengaturan
          </span>
        );
    }
  };

  const getStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">DISETUJUI</span>;
      case 'AUTO_RECORDED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">SISTEM</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">DITOLAK</span>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistem Audit Trail Global</h2>
          <p className="text-xs text-slate-500 mt-1">Rekaman jejak aktivitas seluruh aksi, perubahan stok, manipulasi laci, dan konfigurasi toko</p>
        </div>
        <button
          onClick={() => alert('Data log siap diekspor ke backend audit')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Ekspor Log Audit
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Input Pencarian */}
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aktor, id, atau rincian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Sumber Modul */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Sumber Modul</option>
                <option value="PRODUCTS">Master Produk</option>
                <option value="INVENTORY">Mutasi Stok</option>
                <option value="POS_TERMINAL">Terminal Kasir (POS)</option>
                <option value="PETTY_CASH">Kas Laci Kasir</option>
                <option value="USERS_ROLES">Karyawan & Hak Akses</option>
                <option value="SETTINGS">Pengaturan Toko</option>
              </select>
            </div>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="APPROVED">Disetujui</option>
              <option value="AUTO_RECORDED">Sistem Otomatis</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Menampilkan {filteredLogs.length} dari {logs.length} Log
          </div>
        </div>

        {/* Tabel Log */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">ID & Waktu</th>
                <th className="py-3 px-6">Pelaku / Aktor</th>
                <th className="py-3 px-6">Sumber Modul</th>
                <th className="py-3 px-6">Aksi Dilakukan</th>
                <th className="py-3 px-6">Rincian Perubahan</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6">
                    <span className="font-mono text-xs font-bold text-indigo-600 block">{log.id}</span>
                    <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{log.actor}</td>
                  <td className="py-3.5 px-6">{getModuleBadge(log.module)}</td>
                  <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-700">{log.action}</td>
                  <td className="py-3.5 px-6 text-xs text-slate-600 leading-relaxed max-w-md">{log.details}</td>
                  <td className="py-3.5 px-6 text-center">{getStatusBadge(log.status)}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Tidak ada catatan riwayat audit sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};