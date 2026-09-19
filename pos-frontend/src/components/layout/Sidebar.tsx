import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  MonitorPlay, 
  ArrowLeftRight,
  Settings,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';
import type { ActiveMenu, Employee, CustomRole, AppPermission } from '../../types';

interface SidebarProps {
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  currentUser: Employee;
  userRole?: CustomRole;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  appName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  setActiveMenu,
  currentUser,
  userRole,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
  appName = 'ADMIN SERBA 35K'
}) => {
  const hasPerm = (perm: AppPermission) => {
    if (!userRole) return false;
    if (userRole.id === 'role-owner') return true;
    return userRole.permissions.includes(perm);
  };

  const handleSelectMenu = (menu: ActiveMenu) => {
    setActiveMenu(menu);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none
        transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Toko & Tombol Tutup Mobile */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-base tracking-wide uppercase truncate">
              {appName}
            </h1>
            <span className="text-xs text-indigo-400 font-mono">Pusat Kendali Toko</span>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profil Akun yang Sedang Login (Hanya Info Teks, Tanpa Dropdown Switcher) */}
        <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-white text-xs block truncate">{currentUser.name}</span>
            <span className="text-[10px] text-indigo-300 font-semibold block truncate">
              {userRole?.name || 'Staf'}
            </span>
          </div>
        </div>

        {/* Navigasi Dinamis Berdasarkan Permission */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {hasPerm('access_dashboard') && (
            <button 
              onClick={() => handleSelectMenu('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard Pusat
            </button>
          )}

          {hasPerm('manage_products') && (
            <button 
              onClick={() => handleSelectMenu('products')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" /> Data Barang & Stok
            </button>
          )}

          {hasPerm('manage_stock') && (
            <button 
              onClick={() => handleSelectMenu('stock-ledger')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'stock-ledger' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 shrink-0" /> Kartu Stok & Audit
            </button>
          )}

          {hasPerm('view_reports') && (
            <button 
              onClick={() => handleSelectMenu('reports')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" /> Laporan Penjualan
            </button>
          )}

          {hasPerm('view_audit_trail') && (
            <button 
              onClick={() => handleSelectMenu('audit-trail')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'audit-trail' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" /> Audit Trail Global
            </button>
          )}

          {hasPerm('manage_employees') && (
            <button 
              onClick={() => handleSelectMenu('users')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Data Karyawan
            </button>
          )}

          {hasPerm('manage_settings') && (
            <button 
              onClick={() => handleSelectMenu('settings')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" /> Pengaturan Toko
            </button>
          )}

          <hr className="border-slate-800 my-3" />

          {hasPerm('access_pos') && (
            <button 
              onClick={() => handleSelectMenu('pos')} 
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform active:scale-95"
            >
              <MonitorPlay className="w-4 h-4 shrink-0" /> BUKA LAYAR KASIR
            </button>
          )}
        </nav>

        {/* Tombol Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};