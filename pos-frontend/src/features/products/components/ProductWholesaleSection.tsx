import React from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

export interface WholesalePriceState {
  min_qty: number;
  max_qty: number | null;
  unit_price: number;
}

interface ProductWholesaleSectionProps {
  wholesalePrices: WholesalePriceState[];
  setWholesalePrices: React.Dispatch<React.SetStateAction<WholesalePriceState[]>>;
  regularPrice: number;
}

export const ProductWholesaleSection: React.FC<ProductWholesaleSectionProps> = ({
  wholesalePrices,
  setWholesalePrices,
  regularPrice,
}) => {
  const addTier = () => {
    const lastTier = wholesalePrices[wholesalePrices.length - 1];
    const newMin = lastTier && lastTier.max_qty ? lastTier.max_qty + 1 : (lastTier ? lastTier.min_qty + 5 : 2);
    setWholesalePrices([
      ...wholesalePrices,
      {
        min_qty: newMin,
        max_qty: null,
        unit_price: Math.max(0, regularPrice - 1000),
      },
    ]);
  };

  const removeTier = (index: number) => {
    setWholesalePrices(wholesalePrices.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof WholesalePriceState, value: any) => {
    setWholesalePrices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Harga Grosir (Tiered Wholesale)</h3>
            <p className="text-xs text-slate-500">Berikan harga satuan lebih hemat saat pelanggan membeli dalam jumlah banyak</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <th className="p-3 w-16 text-center">Tingkat</th>
              <th className="p-3"><span className="text-rose-500">*</span> Jumlah Min.</th>
              <th className="p-3">Jumlah Maks.</th>
              <th className="p-3"><span className="text-rose-500">*</span> Harga Satuan (Rp)</th>
              <th className="p-3 w-14 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wholesalePrices.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                  Belum ada tingkatan harga grosir. Klik tombol di bawah untuk menambahkan.
                </td>
              </tr>
            ) : (
              wholesalePrices.map((wp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-500 text-center">Tier {idx + 1}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Min"
                      value={wp.min_qty}
                      onChange={(e) => updateTier(idx, 'min_qty', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Tanpa Batas"
                      value={wp.max_qty ?? ''}
                      onChange={(e) =>
                        updateTier(idx, 'max_qty', e.target.value === '' ? null : Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-medium">Rp</span>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="Harga Satuan"
                        value={wp.unit_price}
                        onChange={(e) => updateTier(idx, 'unit_price', Number(e.target.value))}
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeTier(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addTier}
        className="w-full py-2.5 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
      >
        <Plus size={15} /> Tambah Harga Grosir
      </button>
      <p className="text-[11px] text-slate-400">
        * Kasir akan otomatis mendeteksi dan menerapkan harga grosir ini saat kuantitas item di keranjang memenuhi syarat jumlah minimum.
      </p>
    </div>
  );
};
