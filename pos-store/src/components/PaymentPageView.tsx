import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Send, 
  ShieldCheck,
  Store,
  RefreshCw
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface PaymentState {
  orderId?: string;
  totalAmount?: number;
  custName?: string;
  orderMethod?: string;
  itemsSummary?: string;
}

export const PaymentPageView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as PaymentState) || {};

  // Data transaksi (fallback default jika halaman diakses langsung)
  const orderId = state.orderId || `TRX-${Date.now().toString().slice(-6)}`;
  const totalAmount = state.totalAmount || 35000;
  const custName = state.custName || 'Pelanggan';
  const orderMethod = state.orderMethod || 'Ambil di Toko Offline';

  // Timer kedaluwarsa QRIS (15 Menit = 900 Detik)
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmWhatsApp = () => {
    let message = `*KONFIRMASI PEMBAYARAN QRIS - SERBA 35 RIBU*\n`;
    message += `--------------------------------------\n`;
    message += `*No. Pesanan:* ${orderId}\n`;
    message += `*Nama Pemesan:* ${custName}\n`;
    message += `*Metode:* ${orderMethod}\n`;
    message += `*Total Dibayar:* ${formatRupiah(totalAmount)}\n`;
    message += `*Status:* Sudah scan QRIS dan transfer\n`;
    message += `--------------------------------------\n`;
    message += `Halo kasir, saya sudah selesaikan pembayaran QRIS. Mohon dicek mutasi dan disiapkan pesanannya ya! Bukti transfer terlampir. 🙏`;

    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Keranjang
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Menunggu Pembayaran
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Kartu QRIS Interaktif */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center flex flex-col items-center">
          
          {/* Header Brand QRIS */}
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="text-left">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Merchant Resmi</span>
              <h2 className="text-base font-extrabold text-slate-900">Serba 35K Store</h2>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-wider">
              <span>QRIS</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/80 px-4 py-2 rounded-2xl text-xs font-bold mb-6">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Selesaikan dalam <strong className="text-red-600 font-mono text-sm">{formatTimer(timeLeft)}</strong></span>
          </div>

          {/* Box Tampilan Kode QRIS */}
          <div className="relative p-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl shadow-xs mb-4">
            {timeLeft > 0 ? (
              <div className="flex flex-col items-center">
                {/* Placeholder/Generator QR Code Dinamis */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=SERBA35K-${orderId}-${totalAmount}&color=0f172a`} 
                  alt="QRIS Payment Code" 
                  className="w-56 h-56 rounded-xl object-contain"
                />
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  NMID: ID10202635001 • A.N TOKO SERBA 35RB
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                <span className="text-sm font-bold text-slate-800">QRIS Kedaluwarsa</span>
                <p className="text-xs text-slate-400 mt-1 mb-3">Waktu pembayaran telah habis.</p>
                <button 
                  onClick={() => setTimeLeft(900)}
                  className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Buat Kode Baru
                </button>
              </div>
            )}
          </div>

          {/* Supported E-Wallets & Mobile Banking */}
          <p className="text-xs text-slate-500 mb-4">
            Bisa di-scan menggunakan <strong>BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay, LinkAja</strong> atau m-Banking lainnya.
          </p>

          {/* Tombol Simpan Gambar QRIS */}
          <a
            href={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=SERBA35K-${orderId}-${totalAmount}&color=0f172a`}
            download={`QRIS-${orderId}.png`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Gambar QRIS
          </a>
        </div>

        {/* Kolom Kanan: Detail Pembayaran & Konfirmasi */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Card Rincian Tagihan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Rincian Tagihan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Kode Pesanan:</span>
                <button 
                  onClick={copyOrderId}
                  className="font-mono font-bold text-slate-800 flex items-center gap-1.5 hover:text-orange-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 transition"
                >
                  {orderId}
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-right text-emerald-600 font-semibold">Tersalin ke clipboard!</p>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Nama Pemesan:</span>
                <span className="font-semibold text-slate-800">{custName}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Metode Penyerahan:</span>
                <span className="font-semibold text-slate-800 text-right">{orderMethod}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-slate-900">QRIS Dinamis</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-dashed border-slate-200">
                <span className="text-sm font-extrabold text-slate-900">Total Nominal:</span>
                <span className="text-xl font-black text-red-600 font-mono">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            {/* Tombol Konfirmasi Manual */}
            <div className="pt-2 space-y-2">
              <button 
                onClick={handleConfirmWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition"
              >
                <Send className="w-4 h-4" />
                Sudah Bayar? Konfirmasi via WhatsApp
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Kirim tangkapan layar (screenshot) bukti transaksi ke kasir agar pesanan segera disiapkan.
              </p>
            </div>
          </div>

          {/* Panduan Pembayaran 3 Langkah */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-orange-600" />
              Cara Membayar dengan QRIS
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-0.5 leading-relaxed">
              <li>Buka aplikasi m-Banking atau E-Wallet pilihan Anda.</li>
              <li>Pilih menu <strong>Scan / Bayar QRIS</strong> lalu arahkan kamera ke barcode di samping.</li>
              <li>Pastikan nama merchant adalah <strong>Serba 35K Store</strong> dan nominal tepat <strong>{formatRupiah(totalAmount)}</strong>.</li>
              <li>Masukkan PIN transaksi hingga pembayaran sukses, lalu klik tombol konfirmasi.</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
};