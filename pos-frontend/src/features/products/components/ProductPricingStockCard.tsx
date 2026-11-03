import React from 'react';
import { DollarSign } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

interface ProductPricingStockCardProps {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  price: string;
  setPrice: (v: string) => void;
  costPrice: string;
  setCostPrice: (v: string) => void;
  marginEstimation: number;
  stock: string;
  setStock: (v: string) => void;
  hasVariant: boolean;
  minStock: string;
  setMinStock: (v: string) => void;
}

export const ProductPricingStockCard: React.FC<ProductPricingStockCardProps> = ({
  isActive,
  setIsActive,
  price,
  setPrice,
  costPrice,
  setCostPrice,
  marginEstimation,
  stock,
  setStock,
  hasVariant,
  minStock,
  setMinStock,
}) => {
  return (
    <div className="space-y-6">
      {/* Card Status Produk */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Status Produk</h3>
          <span className="text-[11px] text-slate-400">Visibilitas Kasir</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Status Publikasi
            <FieldTooltip content="Tentukan apakah produk langsung siap dijual di kasir atau diarsipkan sebagai draft." />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isActive
                  ? 'bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Draft
            </button>
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Aktif (Jual)
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
            {isActive
              ? 'Produk aktif dan langsung dapat dicari saat transaksi kasir.'
              : 'Produk dinonaktifkan sementara dan disembunyikan dari kasir.'}
          </p>
        </div>
      </div>

      {/* Card Harga & Margin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <DollarSign size={16} className="text-indigo-600" />
          <span>Harga & Margin</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Jual (Rp) <span className="text-rose-500">*</span>
              <FieldTooltip content="Harga jual final ke konsumen saat checkout di kasir ritel." />
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Modal / Pokok (Rp)
              <FieldTooltip content="Harga kulakan/HPP dari supplier. Digunakan sistem untuk menghitung estimasi keuntungan bersih secara otomatis." />
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Estimasi Margin:</span>
            <span className="text-xs font-bold text-emerald-700">
              Rp {marginEstimation.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Card Manajemen Stok */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Manajemen Stok
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Stok Saat Ini <span className="text-rose-500">*</span>
              <FieldTooltip content="Jumlah fisik produk riil yang ada di toko/gudang. Otomatis berkurang saat kasir menyelesaikan transaksi." />
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              disabled={hasVariant}
              title={hasVariant ? 'Stok dikalkulasi otomatis dari variasi' : ''}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Batas Peringatan Stok Minimum (Alert)
              <FieldTooltip content="Batas ambang aman. Jika stok produk tersisa sama atau di bawah angka ini, sistem otomatis memunculkan peringatan waspada restock." />
            </label>
            <input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
