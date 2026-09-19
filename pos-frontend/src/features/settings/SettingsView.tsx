import React from 'react';
import { Sliders, Banknote, QrCode, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import type { PaymentConfig } from '../../types';

interface SettingsViewProps {
  paymentConfig: PaymentConfig;
  onUpdatePaymentConfig: (key: keyof PaymentConfig, value: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ paymentConfig, onUpdatePaymentConfig }) => {
  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan Toko & Terminal</h2>
        <p className="text-xs text-slate-500 mt-1">Konfigurasi aktivasi metode pembayaran dan proteksi sistem kasir</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 border-b pb-4">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-base text-slate-800">Aktivasi Jalur Pembayaran Kasir</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Jika salah satu layanan sedang mengalami kendala (misalnya jaringan QRIS perbankan down), nonaktifkan opsi di bawah. Tombol pembayaran terkait di terminal kasir akan langsung dikunci.
        </p>

        <div className="space-y-4">
          {/* Opsi Tunai */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Pembayaran Tunai (Cash)</h4>
                <p className="text-xs text-slate-500">Menerima uang fisik dan kalkulasi kembalian laci kasir</p>
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

          {/* Opsi QRIS */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">QRIS Dinamis / Statis</h4>
                  {!paymentConfig.qrisEnabled && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      OFFLINE / GANGGUAN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Standar pembayaran QR Bank Indonesia (MDR 0.7%)</p>
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

          {/* Opsi EDC Kartu */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">Debit / Mesin EDC Kartu</h4>
                  {!paymentConfig.edcEnabled && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      OFFLINE / GANGGUAN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Gesek/Insert kartu debit dan kredit (MDR 1.5%)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConfig.edcEnabled}
                onChange={(e) => onUpdatePaymentConfig('edcEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Perubahan metode pembayaran tersinkronisasi otomatis ke Terminal POS kasir secara langsung tanpa perlu merestart sistem kasir.
          </p>
        </div>
      </div>
    </div>
  );
};