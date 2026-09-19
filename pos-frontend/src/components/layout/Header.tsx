import React from 'react';
import type { ActiveMenu } from '../../types';

interface HeaderProps {
  activeMenu: ActiveMenu;
}

export const Header: React.FC<HeaderProps> = ({ activeMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <h2 className="text-lg font-bold text-slate-800">
        {activeMenu === 'dashboard' && 'Dashboard Overview'}
        {activeMenu === 'products' && 'Manajemen Inventaris Gudang'}
      </h2>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-700">Fadhil</p>
          <p className="text-xs text-slate-400">Owner</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
          F
        </div>
      </div>
    </header>
  );
};