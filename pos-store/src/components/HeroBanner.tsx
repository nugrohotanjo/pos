import React from 'react';
import { Tags, MapPin, CheckCircle2, Store, Truck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="mb-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute right-10 top-6 hidden lg:block opacity-20">
        <Tags className="w-64 h-64" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-3">
          <MapPin className="w-3.5 h-3.5" /> Gudang Offline Cabang Utama
        </span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug sm:leading-tight mb-2">
          Gudang Murah Serba 35 Ribu!<br />
          <span className="text-amber-200">Perabot, Dapur, & Barang Unik Serba Ada.</span>
        </h1>
        <p className="text-white/90 text-sm sm:text-base mb-6 font-normal">
          Belanja printilan murah tanpa mikir harga mahal! Stok ready di toko fisik, pesan lewat web langsung ambil di kasir atau dikirim kurir instan.
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-white/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Harga Grosir Rata 35Rb
          </div>
          <div className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-white/20">
            <Store className="w-4 h-4 text-amber-300" />
            Bisa Ambil di Toko Langsung
          </div>
          <div className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-white/20">
            <Truck className="w-4 h-4 text-sky-300" />
            Bisa Kirim Kurir Sameday
          </div>
        </div>
      </div>
    </section>
  );
};