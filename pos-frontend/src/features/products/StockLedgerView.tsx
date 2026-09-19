import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, AlertOctagon, History, Plus } from 'lucide-react';
import type { Product, StockMovement, StockMovementType } from '../../types';

interface StockLedgerViewProps {
  products: Product[];
  onAdjustStock: (barcode: string, quantity: number, type: StockMovementType, reason: string) => void;
  movements: StockMovement[];
}

export const StockLedgerView: React.FC<StockLedgerViewProps> = ({ products, onAdjustStock, movements }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(products[0]?.barcode || '');
  const [type, setType] = useState<StockMovementType>('IN');
  const [qty, setQty] = useState<number>(10);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarcode || qty <= 0) return;

    onAdjustStock(selectedBarcode, qty, type, reason || (type === 'IN' ? 'Restok Supplier' : 'Barang Rusak/Penyusutan'));
    setIsModalOpen(false);
    setReason('');
    setQty(10);
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kartu Stok & Audit Mutasi</h2>
          <p className="text-xs text-slate-500 mt-1">Pencatatan barang masuk (restok), barang cacat, dan penyusutan inventaris</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Catat Mutasi / Restok
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <History className="w-4 h-4" /> Log Riwayat Mutasi Barang
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Waktu</th>
                <th className="py-3 px-6">Barcode & Barang</th>
                <th className="py-3 px-6">Tipe Mutasi</th>
                <th className="py-3 px-6 text-center">Qty</th>
                <th className="py-3 px-6">Keterangan / Alasan</th>
                <th className="py-3 px-6">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-6 text-xs text-slate-400 font-mono">{m.timestamp}</td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-slate-800 block">{m.productName}</span>
                    <span className="font-mono text-xs text-slate-400">{m.barcode}</span>
                  </td>
                  <td className="py-3 px-6">
                    {m.type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs font-semibold border border-emerald-200">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Stok Masuk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold border border-rose-200">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Rusak / Susut
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-slate-800">
                    {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                  </td>
                  <td className="py-3 px-6 text-xs text-slate-600">{m.reason}</td>
                  <td className="py-3 px-6 text-xs font-medium text-slate-700">{m.recordedBy}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Belum ada riwayat mutasi stok tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT PENYESUAIAN STOK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-800 border-b pb-3">Pencatatan Mutasi Stok</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Pilih Produk</label>
                <select
                  value={selectedBarcode}
                  onChange={(e) => setSelectedBarcode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.barcode} value={p.barcode}>
                      {p.name} (Sisa: {p.stock} pcs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Jenis Mutasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('IN')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 ${
                      type === 'IN' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Masuk / Restok
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('OUT_DAMAGED')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 ${
                      type !== 'IN' ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4" /> Barang Rusak
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Jumlah (Pcs)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Alasan / Catatan Audit</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengiriman batch supplier baru #401"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Konfirmasi Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};