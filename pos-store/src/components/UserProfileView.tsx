import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  Clock, 
  Package, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  ArrowLeft,
  Store,
  Truck,
  CreditCard
} from 'lucide-react';
import { formatRupiah, createSlug } from '../utils/formatters';

interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  qty: number;
}

interface OrderHistory {
  orderId: string;
  date: string;
  status: 'Menunggu Konfirmasi' | 'Diproses' | 'Siap Diambil' | 'Selesai';
  orderMethod: string;
  totalAmount: number;
  items: OrderItem[];
}

export const UserProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; phone: string; email?: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);

  // Ambil data user dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('serba35k_user');
    if (!stored) {
      navigate('/login');
    } else {
      try {
        setUser(JSON.parse(stored));
      } catch {
        navigate('/login');
      }
    }
  }, [navigate]);

  // Data Mock Riwayat Transaksi Pengguna
  const mockOrders: OrderHistory[] = [
    {
      orderId: 'TRX-849201',
      date: '31 Okt 2026, 14:20 WIB',
      status: 'Siap Diambil',
      orderMethod: 'Ambil di Toko Offline (Pick Up)',
      totalAmount: 70000,
      items: [
        {
          id: 1,
          name: 'Rak Bumbu Gantung Tempel Dapur Tanpa Bor',
          category: 'Dapur & Masak',
          price: 35000,
          qty: 1
        },
        {
          id: 2,
          name: 'Lampu Tidur LED Sensor Gerak Otomatis Charge USB',
          category: 'Perabot & Kamar',
          price: 35000,
          qty: 1
        }
      ]
    },
    {
      orderId: 'TRX-721094',
      date: '28 Okt 2026, 10:15 WIB',
      status: 'Selesai',
      orderMethod: 'Kirim Kurir Sameday',
      totalAmount: 105000,
      items: [
        {
          id: 3,
          name: 'Botol Minum Jumbo 2 Liter Penanda Waktu & Sedotan',
          category: 'Printilan Unik',
          price: 35000,
          qty: 2
        },
        {
          id: 10,
          name: 'Set Obeng Presisi 31-in-1 Multifungsi HP & Jam',
          category: 'Perkakas & Mobil',
          price: 35000,
          qty: 1
        }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('serba35k_user');
    navigate('/');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Tombol Kembali */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Profil Singkat Pengguna */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 text-center">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{user.name}</h2>
          <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Member Toserba 35K
          </span>

          <div className="mt-6 pt-4 border-t border-slate-100 text-left space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{user.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user.email || 'Email belum diisi'}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Akun
          </button>
        </div>

        {/* Kolom Kanan: History Beli (Daftar Riwayat Pesanan) */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Riwayat Pembelian</h3>
                <p className="text-xs text-slate-400">Daftar transaksi online & nota kasir offline Anda.</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {mockOrders.length} Pesanan
              </span>
            </div>

            {/* List Order */}
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div 
                  key={order.orderId}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/20 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-slate-800">
                      {order.orderId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Selesai'
                        ? 'bg-slate-100 text-slate-700'
                        : order.status === 'Siap Diambil'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {order.date}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                    <div className="text-slate-600">
                      Total ({order.items.reduce((s, i) => s + i.qty, 0)} barang):{' '}
                      <strong className="text-red-600 font-black">{formatRupiah(order.totalAmount)}</strong>
                    </div>
                    <span className="text-orange-600 font-bold flex items-center gap-1 text-[11px]">
                      Lihat Rincian <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal / Panel Rincian Detail Produk yang Dibeli */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Nota Pesanan</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedOrder.orderId}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              
              {/* Status & Metode Ambil */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pesanan:</span>
                  <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Order:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Penyerahan:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.orderMethod}</span>
                </div>
              </div>

              {/* Daftar Barang & Link Detail */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Barang yang Dibeli:</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-orange-600 block">
                          {item.category}
                        </span>
                        <Link 
                          to={`/product/${createSlug(item.name)}`}
                          className="font-bold text-slate-800 hover:text-orange-600 transition truncate block"
                          onClick={() => setSelectedOrder(null)}
                        >
                          {item.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {formatRupiah(item.price)} × {item.qty} pcs
                        </span>
                      </div>
                      <div className="text-right font-extrabold text-slate-900 shrink-0">
                        {formatRupiah(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-extrabold text-slate-900">Total Transaksi:</span>
                <span className="text-base font-black text-red-600">
                  {formatRupiah(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Tombol Tutup */}
            <button 
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};