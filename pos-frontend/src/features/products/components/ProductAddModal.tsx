import React, { useState } from 'react';
import type { Product } from '../../../types';
import { CategoryCombobox } from '../CategoryCombobox';
import { Plus, X, DollarSign } from 'lucide-react';

interface ProductAddModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export const ProductAddModal: React.FC<ProductAddModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSave,
}) => {
  const [newBarcode, setNewBarcode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('35000');
  const [newCostPrice, setNewCostPrice] = useState('20000');
  const [newStock, setNewStock] = useState('10');
  const [newUnit, setNewUnit] = useState('Pcs');
  const [newMinStock, setNewMinStock] = useState('5');
  const [newShelfLocation, setNewShelfLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim() || !newName.trim() || !newCategory.trim()) {
      alert('Barcode, Nama Barang, dan Kategori wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        barcode: newBarcode.trim(),
        name: newName.trim(),
        category: newCategory.trim(),
        price: Number(newPrice) || 0,
        costPrice: Number(newCostPrice) || 0,
        stock: Number(newStock) || 0,
        unit: newUnit,
        minStock: Number(newMinStock) || 5,
        shelfLocation: newShelfLocation.trim(),
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menambah barang: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Tambah Barang Baru
          </h3>
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Barcode / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 89912345001"
                value={newBarcode}
                onChange={(e) => setNewBarcode(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <CategoryCombobox
                categories={categories}
                value={newCategory}
                onChange={setNewCategory}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kemeja Flanel / Semen 50kg"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Harga Jual (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  required
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Harga Pokok / HPP (Rp)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stok Awal</label>
              <input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Satuan</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
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
                value={newMinStock}
                onChange={(e) => setNewMinStock(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Lokasi Rak / Gudang (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Rak A-03, Gudang Barat"
              value={newShelfLocation}
              onChange={(e) => setNewShelfLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
