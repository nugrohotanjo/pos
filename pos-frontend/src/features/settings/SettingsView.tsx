import React, { useState, useEffect } from 'react';
import type { PaymentConfig } from '../../types';
import { getSettingsFromApi, updateSettingsToApi } from '../../utils/api';
import { 
  Store, 
  CreditCard, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Receipt,
  RotateCw
} from 'lucide-react';

interface SettingsViewProps {
  paymentConfig: PaymentConfig;
  onUpdatePaymentConfig: (key: keyof PaymentConfig, value: boolean) => void;
  appName: string;
  onUpdateAppName: (name: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  paymentConfig,
  onUpdatePaymentConfig,
  appName,
  onUpdateAppName,
}) => {
  const [storeName, setStoreName] = useState(appName);
  const [address, setAddress] = useState('Jl. Raya Utama No. 123, Indonesia');
  const [phone, setPhone] = useState('0812-3456-7890');
  const [footer, setFooter] = useState('Terima kasih telah berbelanja!');
  
  const [cashActive, setCashActive] = useState(paymentConfig.cashEnabled);
  const [qrisActive, setQrisActive] = useState(paymentConfig.qrisEnabled);
  const [edcActive, setEdcActive] = useState(paymentConfig.edcEnabled);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ambil pengaturan yang tersimpan di PostgreSQL
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSettingsFromApi();
      setStoreName(data.app_name);
      setAddress(data.store_address || '');
      setPhone(data.store_phone || '');
      setFooter(data.receipt_footer || '');
      setCashActive(data.cash_enabled);
      setQrisActive(data.qris_enabled);
      setEdcActive(data.edc_enabled);

      // Sinkronkan ke app parent
      onUpdateAppName(data.app_name);
      onUpdatePaymentConfig('cashEnabled', data.cash_enabled);
      onUpdatePaymentConfig('qrisEnabled', data.qris_enabled);
      onUpdatePaymentConfig('edcEnabled', data.edc_enabled);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setFeedback({ type: 'error', message: 'Nama toko tidak boleh kosong.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await updateSettingsToApi({
        app_name: storeName.trim(),
        store_address: address.trim(),
        store_phone: phone.trim(),
        receipt_footer: footer.trim(),
        cash_enabled: cashActive,
        qris_enabled: qrisActive,
        edc_enabled: edcActive,
        actor: 'Pemilik Toko (Owner)',
      });

      onUpdateAppName(updated.app_name);
      onUpdatePaymentConfig('cashEnabled', updated.cash_enabled);
      onUpdatePaymentConfig('qrisEnabled', updated.qris_enabled);
      onUpdatePaymentConfig('edcEnabled', updated.edc_enabled);

      setFeedback({ type: 'success', message: 'Pengaturan toko berhasil diperbarui ke database!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Toko & Sistem</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">
            Kelola profil identitas toko, info kontak pada struk, dan status aktif metode pembayaran.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Card 1: Identitas & Info Toko */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Identitas & Profil Usaha</h3>
              <p className="text-xs text-slate-500">Nama dan rincian yang akan tampil di Sidebar, Layar Kasir, dan Struk Belanja.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Toko / Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: POS Ritel General / Serba 35K"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>Nomor Kontak / WhatsApp</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Receipt size={13} className="text-slate-400" />
                <span>Catatan Kaki Struk (Footer)</span>
              </label>
              <input
                type="text"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Contoh: Barang yang dibeli tidak dapat ditukar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>Alamat Lengkap Toko</span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat fisik toko yang tercantum pada struk pembayaran..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Status Jalur Pembayaran (Payment Gateway) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Metode Pembayaran (Payment Gateway)</h3>
              <p className="text-xs text-slate-500">Nonaktifkan metode bayar sementara jika perangkat EDC atau QRIS sedang mengalami gangguan.</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Tunai */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div>
                <p className="text-sm font-bold text-slate-800">Pembayaran Tunai (Cash)</p>
                <p className="text-xs text-slate-500">Penerimaan uang fisik rupiah kertas/koin di laci kasir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashActive}
                  onChange={(e) => setCashActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* QRIS */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div>
                <p className="text-sm font-bold text-slate-800">QRIS Dinamis (MDR 0.7%)</p>
                <p className="text-xs text-slate-500">Scan QR payment (GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={qrisActive}
                  onChange={(e) => setQrisActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* EDC */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div>
                <p className="text-sm font-bold text-slate-800">Mesin EDC Kartu Debit / Kredit (MDR 1.5%)</p>
                <p className="text-xs text-slate-500">Gesek/dip kartu ATM bank mitra toko.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={edcActive}
                  onChange={(e) => setEdcActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Save size={18} />
            <span>{isSaving ? 'Menyimpan ke Database...' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
