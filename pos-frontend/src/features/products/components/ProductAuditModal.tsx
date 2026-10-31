import React from 'react';
import type { Product } from '../../../types';
import { History, X, User, Calendar, FileText } from 'lucide-react';

interface ProductAuditModalProps {
  product: Product | null;
  logs: any[];
  isLoading: boolean;
  onClose: () => void;
}

function parseAuditDetails(details: string) {
  const comparisons: { label: string; from: string; to: string }[] = [];
  let reason = '';

  const reasonMatch = details.match(/Alasan[:\s\-]+(.+?)(?:;|$)/i);
  if (reasonMatch) {
    reason = reasonMatch[1].trim();
  }

  const priceMatch = details.match(/Harga\s*\(([^)]+)\)/i);
  if (priceMatch) {
    const parts = priceMatch[1].split('->');
    if (parts.length === 2) {
      comparisons.push({ label: 'Harga Jual', from: parts[0].trim(), to: parts[1].trim() });
    }
  }

  const stockMatch = details.match(/Stok\s*\(([^)]+)\)/i);
  if (stockMatch) {
    const parts = stockMatch[1].split('->');
    if (parts.length === 2) {
      comparisons.push({ label: 'Stok Fisik', from: parts[0].trim(), to: parts[1].trim() });
    }
  }

  return { comparisons, reason: reason || details };
}

export const ProductAuditModal: React.FC<ProductAuditModalProps> = ({
  product,
  logs,
  isLoading,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Riwayat Audit Perubahan Barang</h3>
              <p className="text-xs text-slate-500">
                {product.name} <span className="font-mono text-indigo-600 font-semibold">({product.barcode})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs">Mengambil catatan audit dari database...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <History size={24} />
              </div>
              <p className="font-semibold text-slate-700">Belum Ada Riwayat Perubahan di Database</p>
            </div>
          ) : (
            logs.map((log) => {
              const { comparisons, reason } = parseAuditDetails(log.details || '');
              return (
                <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <User size={14} className="text-indigo-600" />
                      <span>{log.user || 'Sistem'} ({log.role || 'Admin'})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <Calendar size={13} />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
                    <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        Aksi: {log.action}
                      </span>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">{reason}</p>
                    </div>
                  </div>

                  {comparisons.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Komparasi Nilai (Before → After)
                      </span>
                      {comparisons.map((c, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 text-xs items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="col-span-3 font-semibold text-slate-600">{c.label}</span>
                          <span className="col-span-4 font-medium text-rose-700 line-through bg-rose-50 px-2.5 py-1 rounded">
                            {c.from}
                          </span>
                          <span className="col-span-1 text-center text-slate-400 font-bold">→</span>
                          <span className="col-span-4 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                            {c.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
