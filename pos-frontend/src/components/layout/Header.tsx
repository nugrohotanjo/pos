import React from 'react';
import type { Employee, CustomRole, ActiveMenu } from '../../types';
import type { Language } from '../../data/translations';
import { Menu, LogOut, Globe } from 'lucide-react';

interface HeaderProps {
  activeMenu: ActiveMenu;
  lang: Language;
  setLang: (l: Language) => void;
  currentUser: Employee | null;
  userRole?: CustomRole;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const menuTitles: Record<ActiveMenu, string> = {
  dashboard: 'Dashboard Pusat',
  pos: 'Layar Kasir (POS)',
  products: 'Master Data Barang & Stok',
  'stock-ledger': 'Kartu Stok & Audit',
  reports: 'Laporan Penjualan',
  'audit-trail': 'Audit Trail Global',
  users: 'Data Karyawan & Role',
  settings: 'Pengaturan Toko',
};

export const Header: React.FC<HeaderProps> = ({
  activeMenu,
  lang,
  setLang,
  currentUser,
  userRole,
  onLogout,
  onToggleSidebar,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Tombol Burger Universal */}
        <button
          onClick={onToggleSidebar}
          title="Buka/Tutup Sidebar"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
          {menuTitles[activeMenu] || 'Sistem POS'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Indikator Profil User */}
        {currentUser && (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">
                {userRole?.name || 'Staf'}
              </p>
            </div>
          </div>
        )}

        {/* Pemilih Bahasa */}
        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          title="Ubah Bahasa"
        >
          <Globe size={14} className="text-slate-500" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Tombol Logout */}
        <button
          onClick={onLogout}
          title="Keluar Akun"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
