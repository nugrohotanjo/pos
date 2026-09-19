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
  UserCheck,
  LogOut
} from 'lucide-react';
import type { ActiveMenu, Employee, CustomRole, AppPermission } from '../../types';

interface SidebarProps {
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  currentUser: Employee;
  userRole?: CustomRole;
  allEmployees: Employee[];
  onChangeUser: (user: Employee) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  setActiveMenu,
  currentUser,
  userRole,
  allEmployees,
  onChangeUser,
  onLogout
}) => {
  const hasPerm = (perm: AppPermission) => {
    if (!userRole) return false;
    if (userRole.id === 'role-owner') return true;
    return userRole.permissions.includes(perm);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      <div className="p-6 border-b border-slate-800">
        <h1 className="font-bold text-white text-base tracking-wide">ADMIN SERBA 35K</h1>
        <span className="text-xs text-indigo-400 font-mono">Pusat Kendali Toko</span>
      </div>

      {/* Switcher Akun Staf */}
      <div className="p-3 mx-3 my-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Login Sebagai:</span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => {
            const found = allEmployees.find(emp => emp.id === e.target.value);
            if (found) onChangeUser(found);
          }}
          className="w-full bg-slate-900 text-white text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
        >
          {allEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.roleId === 'role-owner' ? 'Owner' : emp.roleId === 'role-supervisor' ? 'Supervisor' : 'Kasir'})
            </option>
          ))}
        </select>
        <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Role: <b className="text-indigo-300">{userRole?.name || 'Tanpa Role'}</b></span>
        </div>
      </div>

      {/* Navigasi Dinamis */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {hasPerm('access_dashboard') && (
          <button 
            onClick={() => setActiveMenu('dashboard')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard Pusat
          </button>
        )}

        {hasPerm('manage_products') && (
          <button 
            onClick={() => setActiveMenu('products')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Data Barang & Stok
          </button>
        )}

        {hasPerm('manage_stock') && (
          <button 
            onClick={() => setActiveMenu('stock-ledger')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'stock-ledger' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" /> Kartu Stok & Audit
          </button>
        )}

        {hasPerm('view_reports') && (
          <button 
            onClick={() => setActiveMenu('reports')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" /> Laporan Penjualan
          </button>
        )}

        {hasPerm('view_audit_trail') && (
          <button 
            onClick={() => setActiveMenu('audit-trail')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'audit-trail' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Audit Trail Global
          </button>
        )}

        {hasPerm('manage_employees') && (
          <button 
            onClick={() => setActiveMenu('users')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Data Karyawan
          </button>
        )}

        {hasPerm('manage_settings') && (
          <button 
            onClick={() => setActiveMenu('settings')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" /> Pengaturan Toko
          </button>
        )}

        <hr className="border-slate-800 my-3" />

        {hasPerm('access_pos') && (
          <button 
            onClick={() => setActiveMenu('pos')} 
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform active:scale-95"
          >
            <MonitorPlay className="w-4 h-4" /> BUKA LAYAR KASIR
          </button>
        )}
      </nav>

      {/* Tombol Logout Bawah */}
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
  );
};