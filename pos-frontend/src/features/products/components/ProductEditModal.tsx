import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types';
import { CategoryCombobox } from '../CategoryCombobox';
import { Edit3, X } from 'lucide-react';

interface ProductEditModalProps {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (
    barcode: string,
    updatedFields: {
      name: string;
      category: string;
      price: number;
      costPrice: number;
      stock: number;
      unit: string;
      minStock: number;
      shelfLocation: string;
    },
    reason: string
  ) => Promise<void>;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  categories,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [minStock, setMinStock] = useState('5');
  const [shelfLocation, setShelfLocation] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setPrice((product.price ?? 0).toString());
      const rawCost = product.costPrice ?? (product as any).cost_price ?? 0;
      setCostPrice(rawCost.toString());
      setStock((product.stock ?? 0).toString());
      setUnit(product.unit || 'Pcs');
      setMinStock((product.minStock ?? (product as any).min_stock ?? 5).toString());
      setShelfLocation(product.shelfLocation ?? (product as any).shelf_location ?? '');
      setReason('');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Alasan perubahan wajib diisi untuk rekam jejak audit!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        product.barcode,
        {
          name: name.trim(),
          category: category.trim(),
          price: Number(price) || 0,
          costPrice: Number(costPrice) || 0,
          stock: Number(stock) || 0,
          unit,
          minStock: Number(minStock) || 5,
          shelfLocation: shelfLocation.trim(),
        },
        reason.trim()
      );
      onClose();
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Edit3 size={18} className="text-indigo-600" />
              Koreksi Data Barang
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.barcode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Barang</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <CategoryCombobox
                categories={categories}
                value={category}
                onChange={setCategory}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Harga Pokok / HPP (Rp)</label>
              <input
                type="number"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stok Fisik</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Satuan</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
              >
                <option value="Pcs">Pcs</option>
                <option value="Lusin">Lusin</option>
                <option value="Box">Box / Dus</option>
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Meter">Meter</option>
                <option value="Sak">Sak</option>
                <option value="Kaleng">Kaleng</option>
                <option value="Liter">Liter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Min. Stok</label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lokasi Rak</label>
            <input
              type="text"
              placeholder="Contoh: Rak B-01"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Alasan Perubahan (Audit Trail) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Koreksi dari distributor / Hasil opname"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-amber-200 bg-amber-50/40 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
