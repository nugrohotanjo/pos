import React, { useState } from 'react';
import type { Product } from '../../types';
import { CategoryCascadeSelector } from '../../components/CategoryCascadeSelector';
import { ArrowLeft, Save, Package, DollarSign, Barcode, Layers, AlertCircle } from 'lucide-react';

interface ProductFormPageProps {
  initialProduct?: Product | null;
  onSave: (productData: any) => Promise<void>;
  onBack: () => void;
}

export const ProductFormPage: React.FC<ProductFormPageProps> = ({
  initialProduct,
  onSave,
  onBack,
}) => {
  const isEdit = Boolean(initialProduct);

  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '35000');
  const getInitialCost = (p: any) => String(p?.costPrice ?? p?.cost_price ?? "20000");
  const [costPrice, setCostPrice] = useState(initialProduct ? getInitialCost(initialProduct) : "20000");
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '10');
  const [unit, setUnit] = useState(initialProduct?.unit || 'Pcs');
  const [minStock, setMinStock] = useState(initialProduct ? String(initialProduct.minStock || 5) : '5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialProduct) {
      setBarcode(initialProduct.barcode || "");
      setName(initialProduct.name || "");
      setCategory(initialProduct.category || "");
      setPrice(String(initialProduct.price ?? "35000"));
      const rawCost = (initialProduct as any).costPrice ?? (initialProduct as any).cost_price ?? 0;
      setCostPrice(String(rawCost));
      setStock(String(initialProduct.stock ?? "10"));
      setUnit(initialProduct.unit || "Pcs");
      setMinStock(String((initialProduct as any).minStock ?? (initialProduct as any).min_stock ?? 5));
    }
  }, [initialProduct]);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!barcode.trim()) {
      setErrorMsg('Barcode produk wajib diisi!');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama barang wajib diisi!');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('Silakan pilih kategori produk hingga tingkat akhir!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        barcode: barcode.trim(),
        name: name.trim(),
        category: category.trim(),
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        unit: unit.trim() || 'Pcs',
        minStock: Number(minStock) || 5,
      });
      onBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200"
            title="Kembali ke Daftar Produk"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="text-indigo-600" size={22} />
              <span>{isEdit ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola detail inventaris, penetapan harga, dan klasifikasi kategori multi-level.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Hierarki Kategori Multi-Level */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>Kategori & Klasifikasi (Shopee Style)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Pilih hingga level terdalam</span>
            </div>

            <CategoryCascadeSelector
              value={category}
              onChange={(selectedName) => setCategory(selectedName)}
            />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Package size={16} className="text-indigo-600" />
              <span>Identitas Barang</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Barang / Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kaos Polos Katun Combed 30s Hitam L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Barcode / SKU <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      disabled={isEdit}
                      placeholder="899..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none ${
                        isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Satuan Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Pack">Pack</option>
                    <option value="Dus">Dus / Box</option>
                    <option value="Lusin">Lusin</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Finansial & Inventaris Stok */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-indigo-600" />
              <span>Harga & Margin</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Harga Jual (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Harga Modal / Pokok (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {Number(price) > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Estimasi Margin:</span>
                  <span className="font-bold text-emerald-700">
                    Rp {(Number(price) - Number(costPrice)).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Manajemen Stok
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Jumlah Stok Saat Ini
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Batas Peringatan Stok Minimum (Alert)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
