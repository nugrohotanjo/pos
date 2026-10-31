import React from 'react';
import { MapPin, Clock, Navigation, ExternalLink } from 'lucide-react';

export const OfflineStoreInfo: React.FC = () => {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Toko Offline Buka Setiap Hari
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            Mampir & Pilih Langsung di Toko Fisik Kami
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Mau pegang barangnya langsung atau gak sabar nunggu paket? Silakan datang langsung ke toko offline kami. Pesan via website ini lalu pilih <strong>Ambil di Toko</strong> agar barang sudah dibungkuskan oleh kasir kami saat Anda datang!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Alamat Toko:</span>
                Jl. Pasar Raya Grosir No. 35, Dekat Tugu Kota (Samping Apotek Sehat)
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Jam Buka Kasir:</span>
                Senin - Minggu: 08.30 - 21.00 WIB (Buka Nonstop)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3 text-amber-400">
            <Navigation className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base mb-1">Cek Rute Google Maps</h4>
          <p className="text-xs text-slate-300 mb-4">Temukan titik toko offline kami dengan mudah di GPS</p>
          <a 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Petunjuk Rute
          </a>
        </div>
      </div>
    </section>
  );
};