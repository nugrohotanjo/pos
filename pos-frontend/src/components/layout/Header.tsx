import React from 'react';
import { LogOut, Globe, Menu } from 'lucide-react';
import type { ActiveMenu, Employee, CustomRole } from '../../types';
import type { Language } from '../../data/translations';

interface HeaderProps {
  activeMenu: ActiveMenu;
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser: Employee;
  userRole?: CustomRole;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMenu,
  lang,
  setLang,
  currentUser,
  userRole,
  onLogout,
  onOpenMobileMenu,
}) => {
  const getMenuTitle = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Dashboard Pusat';
      case 'products': return 'Master Data Barang & Stok';
      case 'stock-ledger': return 'Kartu Stok & Audit Mutasi';
      case 'reports': return 'Laporan Keuangan';
      case 'audit-trail': return 'Audit Trail Global';
      case 'users': return 'Data Karyawan';
      case 'settings': return 'Pengaturan Jalur Bayar';
      default: return 'Terminal Kasir';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between select-none shrink-0">
      <div className="flex items-center gap-3">
        {/* Tombol Hamburger di Layar HP & Tablet */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            title="Buka Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{getMenuTitle()}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Info Tag */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-bold text-slate-800 block leading-tight truncate max-w-[100px]">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 font-mono block leading-tight">
              {userRole?.name || 'Staf'}
            </span>
          </div>
        </div>

        {/* Switch Bahasa */}
        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{lang}</span>
        </button>

        {/* Tombol Logout */}
        <button
          onClick={onLogout}
          title="Keluar Akun"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};