import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Product } from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface ProductsViewProps {
  products: Product[];
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Master Data Barang</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Barang Baru
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari nama atau barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white" 
            />
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Total: {filtered.length} SKU Aktif
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 sticky top-0 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="py-3 px-6">Barcode</th>
                <th className="py-3 px-6">Nama Barang</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6 text-right">Harga Jual</th>
                <th className="py-3 px-6 text-center">Stok Gudang</th>
                <th className="py-3 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.barcode} className="hover:bg-slate-50">
                  <td className="py-3 px-6 font-mono text-indigo-600">{p.barcode}</td>
                  <td className="py-3 px-6 font-medium text-slate-800">{p.name}</td>
                  <td className="py-3 px-6"><span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{p.category}</span></td>
                  <td className="py-3 px-6 text-right font-semibold text-slate-700">Rp {FIXED_PRICE.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>{p.stock}</span>
                  </td>
                  <td className="py-3 px-6 text-center flex justify-center gap-3">
                    <button className="text-indigo-600 hover:underline text-xs font-medium">Edit</button>
                    <button className="text-red-500 hover:underline text-xs font-medium">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};