import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  AlertTriangle, 
  Store, 
  Save, 
  CheckCircle2 
} from 'lucide-react';
import type { PaymentConfig } from '../../types';

interface SettingsViewProps {
  paymentConfig: PaymentConfig;
  onUpdatePaymentConfig: (key: keyof PaymentConfig, value: boolean) => void;
  appName: string;
  onUpdateAppName: (newName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  paymentConfig,
  onUpdatePaymentConfig,
  appName,
  onUpdateAppName
}) => {
  const [tempName, setTempName] = useState(appName);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAppName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onUpdateAppName(tempName.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan Toko & Sistem</h2>
        <p className="text-xs text-slate-500 mt-1">Kelola identitas aplikasi toko dan gerbang pembayaran operasional</p>
      </div>

      {/* Bagian 1: Pengaturan Nama Aplikasi / Identitas Toko */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Identitas & Nama Aplikasi</h3>
            <p className="text-xs text-slate-400">Nama toko yang akan tampil di Sidebar, Layar Login, Terminal Kasir, dan Cetak Struk</p>
          </div>
        </div>

        <form onSubmit={handleSaveAppName} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Nama Aplikasi / Toko
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={tempName}
                onChange={(e) => {
                  setTempName(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Contoh: TOKO SERBA 35K"
                className="flex-1 p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!tempName.trim() || tempName === appName}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nama</span>
              </button>
            </div>
          </div>

          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Nama aplikasi berhasil diperbarui dan diterapkan ke seluruh sistem!</span>
            </div>
          )}
        </form>
      </div>

      {/* Bagian 2: Konfigurasi Sakelar Jalur Pembayaran */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Status Jalur Pembayaran (Payment Gateway)</h3>
            <p className="text-xs text-slate-400">Nonaktifkan jalur bayar sewaktu-waktu jika perangkat EDC atau QRIS mengalami gangguan</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cash */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Pembayaran Tunai (Cash)</h4>
                <p className="text-xs text-slate-400">Penerimaan uang fisik kertas/koin di laci kasir</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConfig.cashEnabled}
                onChange={(e) => onUpdatePaymentConfig('cashEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* QRIS */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">QRIS Dinamis (MDR 0.7%)</h4>
                <p className="text-xs text-slate-400">Scan QR payment (GoPay, OVO, Dana, BCA, Mandiri)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConfig.qrisEnabled}
                onChange={(e) => onUpdatePaymentConfig('qrisEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* EDC */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Mesin EDC Kartu Debit (MDR 1.5%)</h4>
                <p className="text-xs text-slate-400">Gesek/dip kartu debit bank mitra toko</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConfig.edcEnabled}
                onChange={(e) => onUpdatePaymentConfig('edcEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
        </div>

        {(!paymentConfig.cashEnabled && !paymentConfig.qrisEnabled && !paymentConfig.edcEnabled) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Peringatan: Seluruh jalur pembayaran nonaktif! Kasir tidak akan dapat memproses transaksi apapun.</span>
          </div>
        )}
      </div>
    </div>
  );
};