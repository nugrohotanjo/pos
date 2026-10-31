import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, ShoppingBag, User } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  cartCount
}) => {
  const [loggedUser, setLoggedUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('serba35k_user');
    if (stored) {
      try {
        setLoggedUser(JSON.parse(stored));
      } catch {
        setLoggedUser(null);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            35K
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">SERBA<span className="text-orange-600">35RB</span></span>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Toserba</span>
            </div>
            <span className="text-xs text-slate-500 block">Toko Serba Murah & Unik</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari rak bumbu, payung, lampu led, botol, perkakas..." 
              className="w-full bg-slate-100 border border-transparent focus:border-orange-500 focus:bg-white text-slate-800 text-sm rounded-xl pl-11 pr-4 py-2.5 transition-all outline-none"
            />
            <Search className="w-5 h-5 absolute left-3.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Serba35Rb,%20mau%20tanya%20stok%20toko%20offline%20dong" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat Kasir Toko</span>
          </a>

          {/* Tombol Akun / Login / Profil */}
          <Link
            to={loggedUser ? "/profile" : "/login"}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 px-3 py-2.5 rounded-xl transition"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline truncate max-w-[90px]">
              {loggedUser ? loggedUser.name : 'Masuk'}
            </span>
          </Link>

          {/* Tombol Keranjang */}
          <Link 
            to="/cart"
            className="relative flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="bg-white text-orange-600 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari barang serba 35rb..." 
            className="w-full bg-slate-100 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:border-orange-500 focus:bg-white"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};