import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanBarcode, 
  ArrowLeft, 
  Banknote, 
  CreditCard, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  KeyRound, 
  CheckCircle2, 
  X,
  DoorClosed,
  Keyboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Repeat,
  AlertTriangle
} from 'lucide-react';
import type { 
  Product, 
  CartItem, 
  HeldOrder, 
  ActiveMenu, 
  PettyCashEntry, 
  AuditLog, 
  PaymentConfig, 
  PaymentMethod 
} from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface PosViewProps {
  products: Product[];
  paymentConfig: PaymentConfig;
  setActiveMenu: (menu: ActiveMenu) => void;
  pettyCashRecords: PettyCashEntry[];
  onAddPettyCash: (entry: PettyCashEntry) => void;
  onAddAuditLog: (log: AuditLog) => void;
  onCompleteTransaction: (cart: CartItem[], total: number, method: PaymentMethod) => void;
}

export const PosView: React.FC<PosViewProps> = ({ 
  products, 
  paymentConfig,
  setActiveMenu,
  pettyCashRecords,
  onAddPettyCash,
  onAddAuditLog,
  onCompleteTransaction
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  
  // State Mode Retur / Tukar Barang
  const [isReturnMode, setIsReturnMode] = useState(false);

  // State Modal Pembayaran
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // State Void Modal & PIN Supervisor
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [voidError, setVoidError] = useState('');

  // State Petty Cash
  const [isPettyCashOpen, setIsPettyCashOpen] = useState(false);
  const [pettyCashType, setPettyCashType] = useState<'IN' | 'OUT'>('OUT');
  const [pettyAmount, setPettyAmount] = useState<number>(0);
  const [pettyReason, setPettyReason] = useState('');

  // State Closing Shift
  const [isShiftCloseOpen, setIsShiftCloseOpen] = useState(false);
  const [showShiftResult, setShowShiftResult] = useState(false);
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });

  const searchRef = useRef<HTMLInputElement>(null);

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + (item.qty * FIXED_PRICE), 0);
  const change = Math.max(0, cashReceived - total);

  const totalCashIn = pettyCashRecords
    .filter(r => r.type === 'IN')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCashOut = pettyCashRecords
    .filter(r => r.type === 'OUT')
    .reduce((sum, r) => sum + r.amount, 0);

  const startingCash = 200000;
  const simulatedSalesCash = 1050000;
  const expectedCashTotal = startingCash + simulatedSalesCash + totalCashIn - totalCashOut;
  const physicalCashTotal = Object.entries(denominations).reduce(
    (sum, [denom, count]) => sum + Number(denom) * count,
    0
  );
  const variance = physicalCashTotal - expectedCashTotal;

  const refocusSearch = () => {
    setTimeout(() => {
      searchRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    if (!isPaymentOpen && !isVoidModalOpen && !isShiftCloseOpen && !isPettyCashOpen) {
      refocusSearch();
    }
  }, [isPaymentOpen, isVoidModalOpen, isShiftCloseOpen, isPettyCashOpen]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleBarcode = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && barcodeInput.trim() !== '') {
      const found = products.find(
        p => p.barcode === barcodeInput || p.name.toLowerCase().includes(barcodeInput.toLowerCase())
      );
      if (found) {
        if (isReturnMode) {
          setCart([...cart, { ...found, qty: -1, isReturn: true }]);
          setIsReturnMode(false);
        } else {
          const existIndex = cart.findIndex(i => i.barcode === found.barcode && !i.isReturn);
          if (existIndex > -1) {
            const updated = [...cart];
            updated[existIndex].qty += 1;
            setCart(updated);
          } else {
            setCart([{ ...found, qty: 1, isReturn: false }, ...cart]);
          }
        }
      } else {
        alert('Barang tidak ditemukan di katalog master!');
      }
      setBarcodeInput('');
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const newHold: HeldOrder = {
      id: `PARK-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      totalAmount: total
    };
    setHeldOrders([newHold, ...heldOrders]);
    setCart([]);
    refocusSearch();
  };

  const handleResumeOrder = (heldOrder: HeldOrder) => {
    if (cart.length > 0) {
      alert('Selesaikan atau hold pesanan yang ada di keranjang terlebih dahulu!');
      return;
    }
    setCart(heldOrder.items);
    setHeldOrders(heldOrders.filter(h => h.id !== heldOrder.id));
    refocusSearch();
  };

  const handleVerifyVoid = () => {
    if (supervisorPin === '1234') {
      onAddAuditLog({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        actor: 'Supervisor (PIN: 1234)',
        action: 'VOID_ORDER',
        details: `Membatalkan seluruh pesanan keranjang (${cart.length} item, total Rp ${total.toLocaleString('id-ID')})`,
        status: 'APPROVED'
      });

      setCart([]);
      setIsVoidModalOpen(false);
      setSupervisorPin('');
      setVoidError('');
      refocusSearch();
    } else {
      setVoidError('PIN Supervisor salah! (Gunakan demo: 1234)');
    }
  };

  const handlePettyCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pettyAmount <= 0 || !pettyReason) return;

    const newRecord: PettyCashEntry = {
      id: `PETTY-${Date.now().toString().slice(-4)}`,
      type: pettyCashType,
      amount: pettyAmount,
      reason: pettyReason,
      timestamp: new Date().toLocaleString('id-ID'),
      cashierName: 'Budi Santoso',
    };

    onAddPettyCash(newRecord);

    if (pettyCashType === 'OUT') {
      onAddAuditLog({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        actor: 'Budi Santoso (Kasir)',
        action: 'PETTY_CASH_OUT',
        details: `Pengeluaran uang laci sebesar Rp ${pettyAmount.toLocaleString('id-ID')} untuk: ${pettyReason}`,
        status: 'APPROVED'
      });
    }

    setPettyAmount(0);
    setPettyReason('');
    setIsPettyCashOpen(false);
    refocusSearch();
  };

  // Keyboard Shortcuts dengan Validasi Status Jalur Pembayaran
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaymentOpen(false);
        setIsVoidModalOpen(false);
        setIsShiftCloseOpen(false);
        setIsPettyCashOpen(false);
        setIsReturnMode(false);
        refocusSearch();
        return;
      }

      // F1: Pembayaran Tunai
      if (e.key === 'F1') {
        e.preventDefault();
        if (!paymentConfig.cashEnabled) {
          alert('Metode Tunai sedang dinonaktifkan oleh Admin!');
          return;
        }
        if (cart.length > 0) {
          setPaymentType('CASH');
          setCashReceived(Math.max(0, total));
          setIsPaymentOpen(true);
        }
        return;
      }

      // F2: QRIS / Digital
      if (e.key === 'F2') {
        e.preventDefault();
        if (!paymentConfig.qrisEnabled && !paymentConfig.edcEnabled) {
          alert('Semua metode pembayaran digital (QRIS/EDC) sedang dimatikan/gangguan!');
          return;
        }
        if (cart.length > 0) {
          setPaymentType(paymentConfig.qrisEnabled ? 'QRIS' : 'EDC');
          setCashReceived(Math.max(0, total));
          setIsPaymentOpen(true);
        }
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        handleHoldOrder();
        return;
      }

      if (e.key === 'F6') {
        e.preventDefault();
        setIsPettyCashOpen(true);
        return;
      }

      if (e.key === 'F7') {
        e.preventDefault();
        setIsReturnMode(prev => !prev);
        refocusSearch();
        return;
      }

      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsVoidModalOpen(true);
        return;
      }

      if (e.key === 'F9') {
        e.preventDefault();
        setIsShiftCloseOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, total, paymentConfig]);

  const handleFinishPayment = () => {
    const hasReturnItems = cart.some(i => i.isReturn);
    if (hasReturnItems) {
      onAddAuditLog({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        actor: 'Budi Santoso (Kasir)',
        action: 'EXCHANGE_REFUND',
        details: `Transaksi tukar barang diproses. Net Bayar: Rp ${total.toLocaleString('id-ID')}`,
        status: 'APPROVED'
      });
    }

    onCompleteTransaction(cart, total, paymentType);

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setIsPaymentOpen(false);
      setCart([]);
      setCashReceived(0);
      refocusSearch();
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-slate-50 absolute inset-0 z-50 select-none">
      
      {/* Kolom Kiri: Barcode & Keranjang */}
      <div className="w-[60%] flex flex-col border-r border-slate-200 bg-white">
        
        {/* Header POS */}
        <div className="h-16 bg-slate-900 flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveMenu('dashboard')} 
              className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Keluar
            </button>
            <h1 className="font-bold text-lg text-white tracking-wider">POS SERBA 35.000</h1>
          </div>

          <div className="flex items-center gap-2">
            {heldOrders.length > 0 && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-amber-400 font-medium">{heldOrders.length} Diparkir:</span>
                {heldOrders.map(h => (
                  <button
                    key={h.id}
                    onClick={() => handleResumeOrder(h)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {h.id}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setIsReturnMode(!isReturnMode);
                refocusSearch();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isReturnMode 
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Repeat className="w-4 h-4" /> [F7] {isReturnMode ? 'Mode Tukar Aktif!' : 'Tukar Barang'}
            </button>

            <button
              onClick={() => setIsPettyCashOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" /> [F6] Kas Laci
            </button>

            <button
              onClick={() => setIsShiftCloseOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <DoorClosed className="w-4 h-4" /> [F9] Tutup Shift
            </button>
          </div>
        </div>

        {/* Banner Peringatan Mode Retur */}
        {isReturnMode && (
          <div className="bg-amber-500 text-slate-900 px-6 py-2 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Repeat className="w-4 h-4" /> MODE RETUR AKTIF: Scan barang lama yang ingin dikembalikan pelanggan (minus Rp 35.000)
            </span>
            <button onClick={() => setIsReturnMode(false)} className="text-xs underline font-black">
              Batalkan Mode Retur (Esc)
            </button>
          </div>
        )}

        {/* Input Barcode */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <ScanBarcode className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 ${isReturnMode ? 'text-amber-500' : 'text-slate-400'}`} />
            <input 
              ref={searchRef} 
              type="text" 
              placeholder={isReturnMode ? "SCAN BARANG YANG DIKEMBALIKAN (RETUR)..." : "Scan Barcode / Ketik Nama Barang + Enter..."}
              value={barcodeInput} 
              onChange={e => setBarcodeInput(e.target.value)} 
              onKeyDown={handleBarcode}
              className={`w-full pl-16 pr-4 py-4 text-xl border-2 rounded-xl focus:ring-4 shadow-sm font-mono transition-all ${
                isReturnMode 
                  ? 'border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-200' 
                  : 'border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
          </div>
        </div>

        {/* Tabel Keranjang Belanja */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-500 border-b text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Barcode / Item</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Qty</th>
                <th className="py-3 px-6 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, index) => (
                <tr key={`${item.barcode}-${index}`} className={item.isReturn ? 'bg-amber-50/40' : ''}>
                  <td className="py-4 px-6">
                    <div className="font-bold text-base text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{item.barcode} • {item.category}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.isReturn ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        RETUR / TUKAR
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                        BELI BARU
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center text-xl font-bold text-slate-700">
                    <span className={item.qty < 0 ? 'text-amber-600' : 'text-slate-800'}>{item.qty}</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-base">
                    <span className={item.qty < 0 ? 'text-amber-600' : 'text-slate-800'}>
                      {item.qty < 0 ? '-' : ''}Rp {Math.abs(item.qty * FIXED_PRICE).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400">
                    Belum ada barang di keranjang. Silakan scan barcode barang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bar Shortcut Helper */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 font-mono ${!paymentConfig.cashEnabled ? 'line-through text-slate-400' : ''}`}>
              <Keyboard className="w-4 h-4 text-slate-400" /> <b>F1</b> Tunai
            </span>
            <span className={`font-mono ${!paymentConfig.qrisEnabled && !paymentConfig.edcEnabled ? 'line-through text-slate-400' : ''}`}>
              <b>F2</b> Digital
            </span>
            <span className="font-mono"><b>F4</b> Hold</span>
            <span className="font-mono"><b>F6</b> Kas</span>
            <span className="font-mono text-amber-700 font-bold"><b>F7</b> Tukar</span>
            <span className="font-mono"><b>F8</b> Void</span>
            <span className="font-mono"><b>Esc</b> Batal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoidModalOpen(true)}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> [F8] Void
            </button>

            <button
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" /> [F4] Parkir
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Ringkasan Tagihan & Tender (Dipengaruhi Config Pembayaran) */}
      <div className="w-[40%] bg-slate-50 flex flex-col shadow-2xl z-10">
        <div className="h-64 bg-indigo-600 flex flex-col items-center justify-center text-white p-6 text-center">
          <p className="text-indigo-200 font-medium text-lg uppercase tracking-wider mb-2">
            {total < 0 ? 'Kembalikan Uang ke Pelanggan' : 'Total Tagihan Pelanggan'}
          </p>
          <h2 className="text-6xl font-bold tracking-tight">
            {total < 0 ? `-Rp ${Math.abs(total).toLocaleString('id-ID')}` : `Rp ${total.toLocaleString('id-ID')}`}
          </h2>
          <p className="mt-3 text-indigo-200 font-semibold">
            {totalQty >= 0 ? `${totalQty} Net Barang` : `${Math.abs(totalQty)} Barang Diretur`}
          </p>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-end gap-3">
          {/* Tombol Tunai */}
          <button 
            disabled={cart.length === 0 || !paymentConfig.cashEnabled}
            onClick={() => {
              setPaymentType('CASH');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-lg rounded-xl shadow flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
          >
            <Banknote className="w-6 h-6" /> [F1] SELESAIKAN TUNAI
            {!paymentConfig.cashEnabled && <span className="text-xs bg-slate-500 px-2 py-0.5 rounded font-normal">OFF</span>}
          </button>

          {/* Tombol QRIS */}
          <button 
            disabled={cart.length === 0 || total < 0 || !paymentConfig.qrisEnabled}
            onClick={() => {
              setPaymentType('QRIS');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-lg rounded-xl shadow flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
          >
            <CreditCard className="w-6 h-6" /> BAYAR QRIS (0.7%)
            {!paymentConfig.qrisEnabled && <span className="text-xs bg-slate-500 px-2 py-0.5 rounded font-normal">GANGGUAN</span>}
          </button>

          {/* Tombol EDC Kartu */}
          <button 
            disabled={cart.length === 0 || total < 0 || !paymentConfig.edcEnabled}
            onClick={() => {
              setPaymentType('EDC');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-lg rounded-xl shadow flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
          >
            <CreditCard className="w-6 h-6" /> MESIN EDC DEBIT
            {!paymentConfig.edcEnabled && <span className="text-xs bg-slate-500 px-2 py-0.5 rounded font-normal">OFF</span>}
          </button>
        </div>
      </div>

      {/* MODAL 1: PEMBAYARAN */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {total < 0 
                  ? 'Pengembalian Refund Uang' 
                  : paymentType === 'CASH' 
                  ? 'Pembayaran Tunai' 
                  : `Pembayaran ${paymentType}`}
              </h3>
              <button onClick={() => { setIsPaymentOpen(false); refocusSearch(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                <h4 className="text-2xl font-bold text-slate-800">Transaksi Selesai & Tercatat!</h4>
                <p className="text-sm text-slate-500">Struk dan riwayat keuangan diperbarui.</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{total < 0 ? 'Total Refund ke Pelanggan:' : 'Total Tagihan:'}</span>
                    <span className="font-bold text-slate-800">
                      {total < 0 ? `-Rp ${Math.abs(total).toLocaleString('id-ID')}` : `Rp ${total.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  {total > 0 && paymentType === 'CASH' && (
                    <>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Uang Diterima:</span>
                        <span className="font-bold text-indigo-600">Rp {cashReceived.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2 text-slate-800">
                        <span>Kembalian:</span>
                        <span className={change > 0 ? 'text-emerald-600' : 'text-slate-800'}>
                          Rp {change.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleFinishPayment}
                  disabled={total > 0 && paymentType === 'CASH' && cashReceived < total}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg shadow-md transition-all"
                >
                  KONFIRMASI & SELESAIKAN STRUK
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: VOID WITH PIN */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-lg font-bold">Otorisasi Supervisor</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Membatalkan seluruh transaksi keranjang. Masukkan PIN Supervisor (Demo: 1234):
            </p>

            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="PIN Supervisor..."
              value={supervisorPin}
              onChange={e => setSupervisorPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerifyVoid()}
              className="w-full p-3 text-center text-2xl tracking-widest font-mono border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
            />

            {voidError && <p className="text-xs text-rose-600 font-semibold text-center">{voidError}</p>}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setIsVoidModalOpen(false);
                  setSupervisorPin('');
                  setVoidError('');
                  refocusSearch();
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold"
              >
                Batal (Esc)
              </button>
              <button
                onClick={handleVerifyVoid}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm"
              >
                Setujui Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PETTY CASH */}
      {isPettyCashOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-800">Kas Operasional Laci</h3>
              </div>
              <button onClick={() => { setIsPettyCashOpen(false); refocusSearch(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handlePettyCashSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPettyCashType('OUT')}
                  className={`py-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    pettyCashType === 'OUT' 
                      ? 'bg-rose-600 text-white border-rose-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" /> Uang Keluar (Cash Out)
                </button>
                <button
                  type="button"
                  onClick={() => setPettyCashType('IN')}
                  className={`py-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    pettyCashType === 'IN' 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" /> Uang Masuk (Cash In)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  placeholder="Contoh: 25000"
                  value={pettyAmount || ''}
                  onChange={(e) => setPettyAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-base font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Keperluan / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli lakban & kantong plastik"
                  value={pettyReason}
                  onChange={(e) => setPettyReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Catat Mutasi Kas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLOSING SHIFT */}
      {isShiftCloseOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tutup Shift Kasir (Blind Count)</h3>
                <p className="text-xs text-slate-400">Hitung fisik seluruh lembar uang yang ada di dalam laci kasir</p>
              </div>
              <button onClick={() => { setIsShiftCloseOpen(false); setShowShiftResult(false); refocusSearch(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {!showShiftResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                  {[100000, 50000, 20000, 10000, 5000, 2000, 1000].map((nominal) => (
                    <div key={nominal} className="flex items-center justify-between p-2 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-bold text-slate-700">Rp {nominal.toLocaleString('id-ID')}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={denominations[nominal] || ''}
                        onChange={(e) => setDenominations({ ...denominations, [nominal]: Number(e.target.value) })}
                        className="w-16 p-1 text-center font-mono text-sm border rounded bg-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-sm font-semibold">
                  <span>Total Fisik Terhitung:</span>
                  <span className="text-indigo-600 font-bold font-mono">Rp {physicalCashTotal.toLocaleString('id-ID')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowShiftResult(true)}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  Verifikasi & Finalkan Shift
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl border space-y-2 bg-slate-50">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Target Fisik Seharusnya:</span>
                    <span className="font-mono">Rp {expectedCashTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800">
                    <span>Fisik Dihitung Kasir:</span>
                    <span className="font-mono text-indigo-600">Rp {physicalCashTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Selisih Fisik:</span>
                    <span className={`font-mono ${variance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {variance >= 0 ? `+Rp ${variance.toLocaleString('id-ID')}` : `-Rp ${Math.abs(variance).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsShiftCloseOpen(false);
                    setShowShiftResult(false);
                    setActiveMenu('dashboard');
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Selesai & Keluar ke Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};