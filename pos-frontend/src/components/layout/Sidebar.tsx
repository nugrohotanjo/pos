import React from 'react';
import type { ActiveMenu, Employee, CustomRole } from '../../types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  FileBarChart,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  currentUser: Employee | null;
  userRole?: CustomRole;
  onLogout: () => void;
  isCollapsed: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  appName: string;
}

interface MenuItem {
  id: ActiveMenu;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permission?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  currentUser,
  userRole,
  onLogout,
  isCollapsed,
  isOpenMobile,
  onCloseMobile,
  appName,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Pusat', icon: LayoutDashboard, permission: 'access_dashboard' },
    { id: 'products', label: 'Data Barang & Stok', icon: Package, permission: 'manage_products' },
    { id: 'stock-ledger', label: 'Kartu Stok & Audit', icon: Boxes, permission: 'manage_stock' },
    { id: 'reports', label: 'Laporan Penjualan', icon: FileBarChart, permission: 'view_reports' },
    { id: 'audit-trail', label: 'Audit Trail Global', icon: ShieldCheck, permission: 'view_audit_trail' },
    { id: 'users', label: 'Data Karyawan', icon: Users, permission: 'manage_employees' },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings, permission: 'manage_settings' },
  ];

  const hasAccess = (perm?: string) => {
    if (!perm || !userRole) return true;
    if (userRole.id === 'role-owner') return true;
    return userRole.permissions.includes(perm as any);
  };

  const filteredMenus = menuItems.filter((item) => hasAccess(item.permission));

  const handleMenuClick = (menu: ActiveMenu) => {
    setActiveMenu(menu);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop Gelap untuk Tampilan Mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 border-r border-slate-800 shrink-0`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              POS
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-white text-sm tracking-tight truncate">{appName}</h2>
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Pusat Kendali</p>
              </div>
            )}
          </div>

          {/* Tombol Tutup Khusus Layar Mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profil Mini */}
        {currentUser && (
          <div className={`p-3 border-b border-slate-800/80 ${isCollapsed ? 'text-center' : ''}`}>
            <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userRole?.name || 'Staf'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigasi Menu Utama */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Navigasi Bawah: Shortcut Kasir & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => handleMenuClick('pos')}
            title={isCollapsed ? 'Buka Layar Kasir' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ShoppingCart size={18} className="shrink-0" />
            {!isCollapsed && <span>BUKA LAYAR KASIR</span>}
          </button>

          <button
            onClick={onLogout}
            title={isCollapsed ? 'Keluar Akun' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Keluar Akun</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
