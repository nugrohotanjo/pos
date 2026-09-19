import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  MonitorPlay, 
  ArrowLeftRight,
  Settings
} from 'lucide-react';
import type { ActiveMenu } from '../../types';

interface SidebarProps {
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="font-bold text-white text-base tracking-wide">ADMIN SERBA 35K</h1>
        <span className="text-xs text-indigo-400 font-mono">Pusat Kendali Toko</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveMenu('dashboard')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard Pusat
        </button>

        <button 
          onClick={() => setActiveMenu('products')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <Package className="w-5 h-5" /> Data Barang & Stok
        </button>

        <button 
          onClick={() => setActiveMenu('stock-ledger')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'stock-ledger' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" /> Kartu Stok & Audit
        </button>

        <button 
          onClick={() => setActiveMenu('reports')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-5 h-5" /> Laporan Penjualan
        </button>

        <button 
          onClick={() => setActiveMenu('users')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <Users className="w-5 h-5" /> Data Karyawan
        </button>

        <button 
          onClick={() => setActiveMenu('settings')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeMenu === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" /> Pengaturan Toko
        </button>

        <hr className="border-slate-800 my-4" />

        <button 
          onClick={() => setActiveMenu('pos')} 
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform active:scale-95"
        >
          <MonitorPlay className="w-5 h-5" /> BUKA LAYAR KASIR
        </button>
      </nav>
    </aside>
  );
};