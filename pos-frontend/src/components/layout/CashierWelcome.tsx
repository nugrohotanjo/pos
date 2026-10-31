import React from 'react';
import { MonitorPlay } from 'lucide-react';
import type { Employee, ActiveMenu } from '../../types';

interface CashierWelcomeProps {
  currentUser: Employee | null;
  appName: string;
  onStartPos: (menu: ActiveMenu) => void;
}

export const CashierWelcome: React.FC<CashierWelcomeProps> = ({
  currentUser,
  appName,
  onStartPos
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 select-none min-h-[80vh]">
      <div className="max-w-xl w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <MonitorPlay className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-800">
            Selamat Bertugas, {currentUser?.name}!
          </h2>
          <p className="text-xs text-slate-500">
            Shift kasir aktif. Siap melayani transaksi pelanggan di {appName}.
          </p>
        </div>

        {/* Tombol Mulai Kasir */}
        <div>
          <button
            onClick={() => onStartPos('pos')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
          >
            <MonitorPlay className="w-5 h-5" />
            <span>MULAI TRANSAKSI KASIR</span>
          </button>
        </div>

        {/* Panduan Pintas Keyboard */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pengingat Shortcut Kasir Cepat:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono">
            <div><b>[F1]</b> Bayar Tunai</div>
            <div><b>[F2]</b> Bayar Non-Tunai</div>
            <div><b>[F4]</b> Parkir Pesanan</div>
            <div><b>[F6]</b> Input Kas Laci</div>
            <div><b>[F7]</b> Mode Retur / Tukar</div>
            <div><b>[F8]</b> Void (PIN Supervisor)</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Jika shift Anda telah selesai, gunakan tombol <b>[F9] Tutup Shift</b> di layar kasir untuk hitung fisik laci.
        </p>
      </div>
    </div>
  );
};
