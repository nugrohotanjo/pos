import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside aria-label="Pengumuman promo" className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-xs sm:text-sm font-semibold py-2 px-4 shadow-sm text-center flex items-center justify-center gap-2">
      <span className="inline-block animate-pulse bg-white text-orange-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Gudang Murah</span>
      <span>🔥 Spesial Serba Rp 35.000 & Flash Sale! Belanja online bisa langsung diambil di toko fisik!</span>
    </aside>
  );
};