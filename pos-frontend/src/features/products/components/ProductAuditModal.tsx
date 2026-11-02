import React from 'react';
import type { Product } from '../../../types';
import { History, X, User, Calendar, ArrowRight } from 'lucide-react';

interface ProductAuditModalProps {
  product: Product | null;
  logs: any[];
  isLoading: boolean;
  onClose: () => void;
}

export const ProductAuditModal: React.FC<ProductAuditModalProps> = ({
  product,
  logs,
  isLoading,
  onClose,
}) => {
  if (!product) return null;

  const renderValue = (val: any) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-300 italic">kosong</span>;
    if (typeof val === 'number') return val.toLocaleString('id-ID');
    return String(val);
  };

  const getChangedFields = (oldRaw: any, newRaw: any) => {
    if (!oldRaw && !newRaw) return [];
    try {
      const b = typeof oldRaw === 'string' ? JSON.parse(oldRaw) : oldRaw || {};
      const a = typeof newRaw === 'string' ? JSON.parse(newRaw) : newRaw || {};
      const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));

      const labels: Record<string, string> = {
        name: 'Nama Barang',
        category: 'Kategori',
        price: 'Harga Jual',
        cost_price: 'Harga Modal (HPP)',
        costPrice: 'Harga Modal (HPP)',
        stock: 'Stok',
        unit: 'Satuan',
        min_stock: 'Min. Stok',
        minStock: 'Min. Stok',
        shelf_location: 'Lokasi Rak',
        shelfLocation: 'Lokasi Rak',
        is_active: 'Status Aktif',
      };

      return keys
        .filter((k) => labels[k] && JSON.stringify(b[k]) !== JSON.stringify(a[k]))
        .map((k) => ({
          key: k,
          label: labels[k],
          from: b[k],
          to: a[k],
        }));
    } catch {
      return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Riwayat Perubahan Barang</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {product.name} ({product.barcode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Memuat riwayat perubahan...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-center">
              <History size={36} className="text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-medium text-slate-600">Belum Ada Riwayat Perubahan di Database</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Setiap mutasi harga jual, modal, atau stok pada barang ini akan tercatat otomatis di sini.
              </p>
            </div>
          ) : (
            logs.map((log: any) => {
              const diffs = getChangedFields(log.old_values, log.new_values);
              const dateStr = log.created_at
                ? new Date(log.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : log.timestamp || '-';

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <User size={13} className="text-slate-400" />
                      <span>{log.user || 'Sistem'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {log.details && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                      {log.details}
                    </div>
                  )}

                  {diffs.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {diffs.map((d) => (
                        <div
                          key={d.key}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-amber-50/60 border border-amber-100"
                        >
                          <span className="font-semibold text-slate-700">{d.label}:</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-rose-600 line-through">
                              {renderValue(d.from)}
                            </span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="text-emerald-600 font-bold">
                              {renderValue(d.to)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
