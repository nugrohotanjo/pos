import React from 'react';
import type { Product } from '../../../types';
import { History, X, User, Calendar, Tag, ArrowRight } from 'lucide-react';

interface ProductAuditModalProps {
  product: Product | null;
  logs: any[];
  isLoading?: boolean;
  onClose: () => void;
}

// Format nama field agar lebih nyaman dibaca (opsional/otomatis)
const formatFieldName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Format representasi nilai untuk boolean, null, atau string kosong
const formatValueDisplay = (val: any): string => {
  if (val === null || val === undefined || val === '') {
    return '(Kosong)';
  }
  if (typeof val === 'boolean') {
    return val ? 'Ya / Aktif' : 'Tidak / Non-Aktif';
  }
  return String(val);
};

export const ProductAuditModal: React.FC<ProductAuditModalProps> = ({
  product,
  logs,
  isLoading = false,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Riwayat Perubahan Barang</h2>
              <p className="text-xs text-slate-400 font-medium">
                {product.name} ({product.barcode})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List Riwayat */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Memuat riwayat perubahan...</span>
            </div>
          ) : logs && logs.length > 0 ? (
            logs.map((log: any, idx: number) => {
              // Parse Old dan New Values secara dinamis
              let oldObj: Record<string, any> = {};
              let newObj: Record<string, any> = {};

              try {
                const oldRaw = log.old_values || log.oldValues;
                if (typeof oldRaw === 'string' && oldRaw.trim()) {
                  oldObj = JSON.parse(oldRaw);
                } else if (typeof oldRaw === 'object' && oldRaw !== null) {
                  oldObj = oldRaw;
                }
              } catch (_) {}

              try {
                const newRaw = log.new_values || log.newValues;
                if (typeof newRaw === 'string' && newRaw.trim()) {
                  newObj = JSON.parse(newRaw);
                } else if (typeof newRaw === 'object' && newRaw !== null) {
                  newObj = newRaw;
                }
              } catch (_) {}

              // Identifikasi seluruh field yang berbeda secara dinamis
              const ignoredKeys = new Set(['updated_at', 'updatedAt', 'created_at', 'createdAt', 'id', 'ID', 'deleted_at', 'deletedAt']);
              const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
              
              const diffs: Array<{ key: string; oldVal: any; newVal: any }> = [];
              for (const k of allKeys) {
                if (ignoredKeys.has(k)) continue;
                const ov = oldObj[k];
                const nv = newObj[k];
                if (String(ov ?? '') !== String(nv ?? '')) {
                  diffs.push({ key: k, oldVal: ov, newVal: nv });
                }
              }

              return (
                <div key={log.id || idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2.5`}>
                  {/* Info Aktor, Action & Timestamp */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User size={14} className="text-slate-400" />
                        <span>{log.user || log.actor || 'Sistem'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {log.action || 'UPDATE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Calendar size={13} />
                      <span>{log.timestamp || log.created_at || '-'}</span>
                    </div>
                  </div>

                  {/* Keterangan Details */}
                  <p className="text-xs text-slate-600 font-medium">
                    {log.details || 'Pembaruan data produk'}
                  </p>

                  {/* Visual Diff Dinamis: Before -> After */}
                  {diffs.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rincian Perubahan (Before & After)
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {diffs.map((diff) => (
                          <div
                            key={diff.key}
                            className="flex flex-wrap items-center gap-2 text-xs py-1 px-2 rounded-lg bg-white border border-slate-100"
                          >
                            <span className="font-semibold text-slate-700 min-w-[120px] flex items-center gap-1">
                              <Tag size={12} className="text-slate-400" />
                              {formatFieldName(diff.key)}:
                            </span>

                            {/* Nilai Sebelum */}
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 line-through">
                              {formatValueDisplay(diff.oldVal)}
                            </span>

                            <ArrowRight size={13} className="text-slate-400 mx-0.5" />

                            {/* Nilai Sesudah */}
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {formatValueDisplay(diff.newVal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada catatan riwayat perubahan untuk barang ini.
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
