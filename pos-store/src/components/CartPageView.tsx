import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Store, 
  ShieldCheck,
  ScanQrCode
} from 'lucide-react';
import type { Product, CartState } from '../types/product';
import { formatRupiah, createCartWhatsAppUrl } from '../utils/formatters';
import { createSlug } from '../utils/formatters';

interface CartPageViewProps {
  cart: CartState;
  products: Product[];
  totalCartCount: number;
  totalCartAmount: number;
  onChangeQty: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
}

export const CartPageView: React.FC<CartPageViewProps> = ({
  cart,
  products,
  totalCartCount,
  totalCartAmount,
  onChangeQty,
  onRemoveFromCart
}) => {
  const navigate = useNavigate();
  const [orderMethod, setOrderMethod] = useState("Ambil di Toko Offline (Pick Up)");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");

  const itemIds = Object.keys(cart).map(Number);

  // Ganti handleCheckout yang lama:
const handleCheckout = () => {
  const generatedId = `TRX-${Date.now().toString().slice(-6)}`;
  
  // Teruskan data pesanan ke halaman /payment via state
  navigate('/payment', {
    state: {
      orderId: generatedId,
      totalAmount: totalCartAmount,
      custName: custName.trim() || 'Pembeli',
      orderMethod: orderMethod,
    }
  });
};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Lanjut Belanja Barang Lain
        </button>
        <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-3 py-1 rounded-full">
          Total {totalCartCount} Barang di Keranjang
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Keranjang Belanja
        </h1>
        <p className="text-sm text-slate-500">
          Periksa pesanan Anda sebelum checkout dan konfirmasi ke WhatsApp kasir toko offline.
        </p>
      </div>

      {itemIds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Keranjang Belanja Masih Kosong</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            Anda belum memilih barang serba murah 35 ribuan. Jelajahi katalog kami sekarang!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Barang ({itemIds.length} Jenis)
                </span>
                <span className="text-xs text-slate-400">Harga Satuan</span>
              </div>

              <div className="divide-y divide-slate-100">
                {itemIds.map((id) => {
                  const prod = products.find((p) => p.id === id);
                  if (!prod) return null;
                  const IconComponent = prod.icon;
                  const qty = cart[id];
                  const lineTotal = prod.price * qty;

                  return (
                    <div key={prod.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <Link 
                          to={`/product/${prod.id}`}
                          className={`w-16 h-16 rounded-2xl ${prod.color} flex items-center justify-center shrink-0 shadow-inner block`}
                        >
                          <IconComponent className="w-8 h-8" />
                        </Link>
                        
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                            {prod.category}
                          </span>
                          <Link 
                            to={`/product/${prod.id}`}
                            className="text-sm font-bold text-slate-800 truncate hover:text-orange-600 transition block"
                          >
                            {prod.name}
                          </Link>
                          <span className="text-xs font-extrabold text-red-600 block mt-0.5">
                            {formatRupiah(prod.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                          <button 
                            onClick={() => onChangeQty(prod.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-slate-900">
                            {qty}
                          </span>
                          <button 
                            onClick={() => onChangeQty(prod.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="text-xs text-slate-400 block">Total:</span>
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatRupiah(lineTotal)}
                          </span>
                        </div>

                        <button 
                          onClick={() => onRemoveFromCart(prod.id)}
                          title="Hapus barang"
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80">
                <Store className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Barang langsung disiapkan dari rak kasir fisik</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bebas cek fisik saat pengambilan pesanan</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6 sticky top-28">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan & Pengambilan
            </h2>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Metode Pengambilan Pesanan:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${orderMethod.includes("Pick Up") ? 'border-orange-500 bg-orange-50/50 font-bold text-orange-950' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <input 
                    type="radio" 
                    name="orderMethod" 
                    value="Ambil di Toko Offline (Pick Up)" 
                    checked={orderMethod.includes("Pick Up")}
                    onChange={(e) => setOrderMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span>Ambil di Toko</span>
                </label>
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${orderMethod.includes("Kurir") ? 'border-orange-500 bg-orange-50/50 font-bold text-orange-950' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <input 
                    type="radio" 
                    name="orderMethod" 
                    value="Kirim Kurir Sameday / Ekspedisi" 
                    checked={orderMethod.includes("Kurir")}
                    onChange={(e) => setOrderMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500" 
                  />
                  <span>Kirim Kurir</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pemesan</label>
                <input 
                  type="text" 
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Contoh: Budi Santoso" 
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition"
                />
              </div>

              {orderMethod.includes("Kurir") && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Alamat Lengkap Pengiriman</label>
                  <textarea 
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    rows={3} 
                    placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan lokasi..." 
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal ({totalCartCount} item)</span>
                <span className="font-semibold text-slate-700">{formatRupiah(totalCartAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Biaya Layanan/Bungkus</span>
                <span className="font-semibold text-emerald-600">GRATIS</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-dashed border-slate-200 pt-3">
                <span>Total Pembayaran:</span>
                <span className="text-xl text-red-600">{formatRupiah(totalCartAmount)}</span>
              </div>
            </div>

            <button 
            onClick={handleCheckout}
            disabled={itemIds.length === 0}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-orange-600/20 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none"
            >
            <ScanQrCode className="w-4 h-4" />
            Lanjut ke Pembayaran QRIS ({formatRupiah(totalCartAmount)})
            </button>
            
            <p className="text-[11px] text-center text-slate-400 leading-normal">
              Kasir toko offline kami akan langsung mengecek ketersediaan fisik dan membungkuskan belanjaan Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};