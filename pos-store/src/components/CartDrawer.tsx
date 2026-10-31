import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, Send } from 'lucide-react';
import type { Product, CartState } from '../types/product';
import { formatRupiah, createCartWhatsAppUrl } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
  products: Product[];
  totalCartCount: number;
  totalCartAmount: number;
  onChangeQty: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  totalCartCount,
  totalCartAmount,
  onChangeQty,
  onRemoveFromCart
}) => {
  const [orderMethod, setOrderMethod] = useState("Ambil di Toko Offline (Pick Up)");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");

  if (!isOpen) return null;

  const handleCheckout = () => {
    const url = createCartWhatsAppUrl(
      cart,
      products,
      custName,
      orderMethod,
      custAddress,
      totalCartAmount
    );
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Keranjang Belanja</h2>
                <p className="text-xs text-slate-500">{totalCartCount} barang dipilih</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {Object.keys(cart).length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Keranjang masih kosong</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Pilih barang serba murah 35 ribuan di etalase untuk mulai belanja!</p>
              </div>
            ) : (
              Object.entries(cart).map(([idStr, qty]) => {
                const prod = products.find((p) => p.id === Number(idStr));
                if (!prod) return null;
                const IconComponent = prod.icon;
                const lineTotal = prod.price * qty;

                return (
                  <div key={prod.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className={`w-12 h-12 rounded-xl ${prod.color} flex items-center justify-center shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="text-orange-600 font-bold">{formatRupiah(prod.price)}</span>
                        <span>× {qty}</span>
                        <span className="font-bold text-slate-700">= {formatRupiah(lineTotal)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                      <button onClick={() => onChangeQty(prod.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-black">-</button>
                      <span className="text-xs font-extrabold w-5 text-center text-slate-800">{qty}</span>
                      <button onClick={() => onChangeQty(prod.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-black">+</button>
                    </div>

                    <button onClick={() => onRemoveFromCart(prod.id)} className="text-slate-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Form */}
          <div className="border-t border-slate-200 p-4 sm:p-5 bg-white space-y-4 shadow-inner">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Metode Pengambilan Pesanan:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${orderMethod.includes("Pick Up") ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="orderMethod" 
                    value="Ambil di Toko Offline (Pick Up)" 
                    checked={orderMethod.includes("Pick Up")}
                    onChange={(e) => setOrderMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span className="font-medium text-slate-800">Ambil di Toko</span>
                </label>
                <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${orderMethod.includes("Kurir") ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="orderMethod" 
                    value="Kirim Kurir Sameday / Ekspedisi" 
                    checked={orderMethod.includes("Kurir")}
                    onChange={(e) => setOrderMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span className="font-medium text-slate-800">Kirim Kurir</span>
                </label>
              </div>

              <div className="pt-2 space-y-2">
                <input 
                  type="text" 
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Nama Pembeli (Cth: Budi)" 
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                />
                {orderMethod.includes("Kurir") && (
                  <textarea 
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    rows={2} 
                    placeholder="Alamat Pengiriman Lengkap (Patokan / RT RW)" 
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-slate-700">{formatRupiah(totalCartAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-dashed border-slate-200 pt-2">
                <span>Total Pembayaran:</span>
                <span className="text-orange-600 text-lg">{formatRupiah(totalCartAmount)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={Object.keys(cart).length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
              Kirim Format Pesanan ke WhatsApp Kasir
            </button>
            
            <p className="text-[11px] text-center text-slate-400">
              Kasir toko offline kami akan langsung menyiapkan barang dan membalas total ongkir/waktu ambil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};