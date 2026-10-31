import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  ShoppingBag, 
  Plus, 
  Minus,
  CheckCircle2 
} from 'lucide-react';
import { PRODUCTS } from '../data/mockProducts';
import { formatRupiah, createSlug } from '../utils/formatters';

interface ProductDetailViewProps {
  onAddToCart: (id: number, quantity?: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ onAddToCart }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  // Cari produk berdasarkan kecocokan slug nama
  const product = PRODUCTS.find((p) => {
    return createSlug(p.name).toLowerCase() === (slug || '').toLowerCase();
  });

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">Barang dengan tautan tersebut tidak tersedia di katalog kami.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-orange-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const IconComponent = product.icon;

  const handleBuyNowWA = () => {
    const text = `Halo Admin Toko Serba 35Ribu! Saya mau beli langsung produk ini:\n\n` +
                 `• *${product.name}*\n` +
                 `• Jumlah: ${qty} pcs\n` +
                 `• Total Harga: ${formatRupiah(product.price * qty)}\n\n` +
                 `Apakah stok di rak kasir ready? Mohon info cara ambil/kirim. Terima kasih!`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </button>
        <div className="text-xs text-slate-400">
          Katalog &gt; {product.category} &gt; <span className="text-slate-700 font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="space-y-4">
            <div className="h-80 sm:h-96 w-full bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center relative p-8">
              <span className={`absolute top-4 left-4 text-xs font-black px-3 py-1 rounded-full ${
                product.price === 35000 
                  ? 'bg-red-500 text-white' 
                  : product.price < 35000 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-white'
              }`}>
                {product.tag}
              </span>

              <div className={`w-36 h-36 rounded-3xl ${product.color} flex items-center justify-center shadow-inner`}>
                <IconComponent className="w-20 h-20" />
              </div>

              <span className="text-xs font-medium text-slate-500 mt-4 flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200">
                <Store className="w-3.5 h-3.5 text-orange-600" />
                {product.stockNote}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span>Kondisi Baru</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Store className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                <span>Bisa Ambil di Toko</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span>Kirim Kurir Instan</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-3 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                <span className="text-3xl font-black text-red-600">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatRupiah(product.originalPrice)}
                </span>
                <span className="ml-auto text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">
                  Harga Gudang Grosir
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Deskripsi Produk:</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Barang pilihan serba murah meriah dengan fungsionalitas terbaik. Cocok untuk kebutuhan rumah tangga harian, praktis dipasang, dan memiliki daya tahan yang baik untuk pemakaian jangka panjang.
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                    Barang fisik siap dicek langsung di rak kasir
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                    Garansi cek fisik 1x24 jam setelah serah terima
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Jumlah Beli:</span>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                  <button 
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {qty}
                  </span>
                  <button 
                    onClick={() => setQty((prev) => prev + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Subtotal: <strong className="text-slate-800">{formatRupiah(product.price * qty)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onAddToCart(product.id, qty)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  + Masukkan Keranjang
                </button>

                <button
                  onClick={handleBuyNowWA}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  Beli via WhatsApp Kasir
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};