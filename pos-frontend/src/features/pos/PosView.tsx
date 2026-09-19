import React, { useState, useEffect, useRef } from 'react';
import { ScanBarcode, ArrowLeft, Banknote, ArrowRight } from 'lucide-react';
import type { Product, CartItem, ActiveMenu } from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface PosViewProps {
  products: Product[];
  setActiveMenu: (menu: ActiveMenu) => void;
}

export const PosView: React.FC<PosViewProps> = ({ products, setActiveMenu }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleBarcode = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && barcodeInput.trim() !== '') {
      const found = products.find(
        p => p.barcode === barcodeInput || p.name.toLowerCase().includes(barcodeInput.toLowerCase())
      );
      if (found) {
        const exist = cart.find(i => i.barcode === found.barcode);
        if (exist) {
          setCart(cart.map(i => i.barcode === found.barcode ? { ...i, qty: i.qty + 1 } : i));
        } else {
          setCart([{ ...found, qty: 1 }, ...cart]);
        }
      } else {
        alert('Barang tidak terdaftar di Master Data!');
      }
      setBarcodeInput('');
    }
  };

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = totalQty * FIXED_PRICE;

  return (
    <div className="flex h-screen bg-slate-50 absolute inset-0 z-50">
      {/* Kolom Kiri: Input Barcode & List Belanja */}
      <div className="w-[60%] flex flex-col border-r border-slate-200 bg-white">
        <div className="h-16 bg-slate-900 flex items-center px-6 gap-4">
          <button 
            onClick={() => setActiveMenu('dashboard')} 
            className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex gap-2 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali ke Admin
          </button>
          <h1 className="font-bold text-lg text-white ml-auto tracking-wider">MESIN KASIR SERBA 35.000</h1>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-8 h-8" />
            <input 
              ref={searchRef} 
              type="text" 
              placeholder="Scan Barcode / Ketik Nama Barang + Enter..." 
              value={barcodeInput} 
              onChange={e => setBarcodeInput(e.target.value)} 
              onKeyDown={handleBarcode}
              className="w-full pl-16 pr-4 py-4 text-xl border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-500 border-b">
              <tr>
                <th className="py-3 px-6">Barcode / Item</th>
                <th className="py-3 px-6 text-center">Qty</th>
                <th className="py-3 px-6 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.barcode} className="border-b border-slate-100">
                  <td className="py-4 px-6">
                    <div className="font-bold text-lg text-slate-800">{item.name}</div>
                    <div className="text-sm text-slate-400 font-mono">{item.barcode}</div>
                  </td>
                  <td className="py-4 px-6 text-center text-xl font-bold">{item.qty}</td>
                  <td className="py-4 px-6 text-right font-bold text-lg text-slate-700">
                    Rp {(item.qty * FIXED_PRICE).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-400">
                    Belum ada barang di keranjang. Silakan scan barcode barang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kolom Kanan: Tagihan & Tender Cepat */}
      <div className="w-[40%] bg-slate-50 flex flex-col shadow-2xl z-10">
        <div className="h-64 bg-indigo-600 flex flex-col items-center justify-center text-white">
          <p className="text-indigo-200 font-medium text-xl mb-2">Total Tagihan</p>
          <h2 className="text-6xl font-bold tracking-tight">Rp {total.toLocaleString('id-ID')}</h2>
          <p className="mt-4 text-indigo-300 font-medium">{totalQty} Barang</p>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-end gap-4">
          <button 
            disabled={total === 0}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Banknote className="w-7 h-7" /> BAYAR UANG PAS
          </button>
          <button 
            disabled={total === 0}
            className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            BAYAR DENGAN KEMBALIAN <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};