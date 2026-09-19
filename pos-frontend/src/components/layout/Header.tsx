import React from 'react';
import { Globe } from 'lucide-react';
import type { ActiveMenu } from '../../types';
import { translations, type Language } from '../../data/translations';

interface HeaderProps {
  activeMenu: ActiveMenu;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMenu, lang, setLang }) => {
  const t = translations[lang];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <h2 className="text-lg font-bold text-slate-800">
        {activeMenu === 'dashboard' && t.dashboardTitle}
        {activeMenu === 'products' && t.inventoryTitle}
      </h2>

      <div className="flex items-center gap-5">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
          <button
            type="button"
            onClick={() => setLang('id')}
            className={`px-2 py-1 rounded transition-colors ${
              lang === 'id' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded transition-colors ${
              lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Fadhil</p>
            <p className="text-xs text-slate-400">Owner</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
            F
          </div>
        </div>
      </div>
    </header>
  );
};