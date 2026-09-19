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
  X,
  DoorClosed,
  Keyboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Repeat,
  Printer
} from 'lucide-react';
import type { 
  Product, 
  CartItem, 
  HeldOrder, 
  ActiveMenu, 
  PettyCashEntry, 
  AuditLog, 
  PaymentConfig, 
  PaymentMethod,
  TransactionRecord
} from '../../types';
import { FIXED_PRICE } from '../../data/mockData';

interface PosViewProps {
  products: Product[];
  paymentConfig: PaymentConfig;
  setActiveMenu: (menu: ActiveMenu) => void;
  pettyCashRecords: PettyCashEntry[];
  onAddPettyCash: (entry: PettyCashEntry) => void;
  onAddAuditLog: (log: AuditLog) => void;
  onCompleteTransaction: (
    cart: CartItem[], 
    total: number, 
    method: PaymentMethod, 
    cashReceived: number, 
    change: number
  ) => TransactionRecord;
    appName?: string;
}

export const PosView: React.FC<PosViewProps> = ({ 
  products, 
  paymentConfig,
  setActiveMenu,
  pettyCashRecords,
  onAddPettyCash,
  onAddAuditLog,
  onCompleteTransaction,
  appName // <-- Tambahkan ini di sini
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  
  const [isReturnMode, setIsReturnMode] = useState(false);

  // State Modal Pembayaran & Struk Thermal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [completedReceipt, setCompletedReceipt] = useState<TransactionRecord | null>(null);

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
    if (!isPaymentOpen && !isVoidModalOpen && !isShiftCloseOpen && !isPettyCashOpen && !completedReceipt) {
      refocusSearch();
    }
  }, [isPaymentOpen, isVoidModalOpen, isShiftCloseOpen, isPettyCashOpen, completedReceipt]);

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
        module: 'POS_TERMINAL',
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
      setVoidError('PIN Supervisor salah! (Gunakan PIN demo: 1234)');
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
      cashierName: 'Kasir',
    };

    onAddPettyCash(newRecord);
    setPettyAmount(0);
    setPettyReason('');
    setIsPettyCashOpen(false);
    refocusSearch();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaymentOpen(false);
        setIsVoidModalOpen(false);
        setIsShiftCloseOpen(false);
        setIsPettyCashOpen(false);
        setIsReturnMode(false);
        setCompletedReceipt(null);
        refocusSearch();
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        if (!paymentConfig.cashEnabled) {
          alert('Metode Tunai dinonaktifkan Admin!');
          return;
        }
        if (cart.length > 0) {
          setPaymentType('CASH');
          setCashReceived(Math.max(0, total));
          setIsPaymentOpen(true);
        }
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        if (!paymentConfig.qrisEnabled && !paymentConfig.edcEnabled) {
          alert('Jalur pembayaran digital sedang nonaktif/gangguan!');
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
        actor: 'Kasir',
        module: 'POS_TERMINAL',
        action: 'EXCHANGE_REFUND',
        details: `Transaksi retur/tukar diproses. Net Bayar: Rp ${total.toLocaleString('id-ID')}`,
        status: 'APPROVED'
      });
    }

    const receipt = onCompleteTransaction(cart, total, paymentType, cashReceived, change);

    setIsPaymentOpen(false);
    setCart([]);
    setCashReceived(0);
    setCompletedReceipt(receipt);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 select-none overflow-y-auto lg:overflow-hidden">
      
      {/* Kolom Kiri: Keranjang & Input Barcode */}
      <div className="w-full lg:w-[60%] flex flex-col border-r border-slate-200 bg-white min-h-[500px] lg:h-screen">
        
        {/* Header POS */}
        <div className="min-h-16 py-3 px-4 sm:px-6 bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setActiveMenu('dashboard')} 
              className="p-1.5 sm:p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Keluar
            </button>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-wider uppercase truncate max-w-[180px] sm:max-w-xs">
              {appName || 'POS SERBA 35K'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {heldOrders.length > 0 && (
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10px] sm:text-xs text-amber-400 font-medium">{heldOrders.length} Parkir:</span>
                {heldOrders.map(h => (
                  <button
                    key={h.id}
                    onClick={() => handleResumeOrder(h)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <PlayCircle className="w-3 h-3" />
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
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 border transition-colors ${
                isReturnMode 
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" /> [F7] {isReturnMode ? 'Mode Retur' : 'Tukar'}
            </button>

            <button
              onClick={() => setIsPettyCashOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" /> [F6] Kas
            </button>

            <button
              onClick={() => setIsShiftCloseOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <DoorClosed className="w-3.5 h-3.5" /> [F9] Shift
            </button>
          </div>
        </div>

        {/* Mode Retur Banner */}
        {isReturnMode && (
          <div className="bg-amber-500 text-slate-900 px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Repeat className="w-4 h-4" /> MODE RETUR: Scan barang yang dikembalikan (-Rp 35.000)
            </span>
            <button onClick={() => setIsReturnMode(false)} className="text-xs underline font-black">
              Batal (Esc)
            </button>
          </div>
        )}

        {/* Input Barcode */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <ScanBarcode className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 ${isReturnMode ? 'text-amber-500' : 'text-slate-400'}`} />
            <input 
              ref={searchRef} 
              type="text" 
              placeholder={isReturnMode ? "SCAN BARANG RETUR..." : "Scan Barcode / Ketik Nama + Enter..."}
              value={barcodeInput} 
              onChange={e => setBarcodeInput(e.target.value)} 
              onKeyDown={handleBarcode}
              className={`w-full pl-12 sm:pl-14 pr-3 py-3 sm:py-3.5 text-base sm:text-lg border-2 rounded-xl focus:ring-4 shadow-sm font-mono transition-all ${
                isReturnMode 
                  ? 'border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-200' 
                  : 'border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
          </div>
        </div>

        {/* Tabel Keranjang Belanja */}
        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[220px]">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-500 border-b text-[10px] sm:text-xs uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4 sm:px-6">Barcode / Item</th>
                <th className="py-2.5 px-2 sm:px-4 text-center">Status</th>
                <th className="py-2.5 px-2 sm:px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 sm:px-6 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {cart.map((item, index) => (
                <tr key={`${item.barcode}-${index}`} className={item.isReturn ? 'bg-amber-50/40' : ''}>
                  <td className="py-3 px-4 sm:px-6">
                    <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.barcode}</div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center">
                    {item.isReturn ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        RETUR
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        BELI
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center font-bold text-base sm:text-lg text-slate-700">
                    <span className={item.qty < 0 ? 'text-amber-600' : 'text-slate-800'}>{item.qty}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right font-bold">
                    <span className={item.qty < 0 ? 'text-amber-600' : 'text-slate-800'}>
                      {item.qty < 0 ? '-' : ''}Rp {Math.abs(item.qty * FIXED_PRICE).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 text-xs sm:text-sm">
                    Keranjang kosong. Scan barcode barang untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bar Shortcut */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span><b>F1</b> Tunai</span>
            <span><b>F2</b> Digital</span>
            <span><b>F4</b> Hold</span>
            <span><b>F7</b> Tukar</span>
            <span><b>F8</b> Void</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsVoidModalOpen(true)}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Void
            </button>

            <button
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" /> Parkir
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Panel Total Tagihan & Tender Checkout */}
      <div className="w-full lg:w-[40%] bg-slate-50 flex flex-col justify-between shadow-lg lg:h-screen shrink-0">
        <div className="py-8 sm:py-12 lg:py-16 bg-indigo-600 flex flex-col items-center justify-center text-white px-4 text-center">
          <p className="text-indigo-200 font-medium text-sm sm:text-base uppercase tracking-wider mb-1">
            {total < 0 ? 'Kembalikan Uang ke Pelanggan' : 'Total Tagihan (Termasuk PPN)'}
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            {total < 0 ? `-Rp ${Math.abs(total).toLocaleString('id-ID')}` : `Rp ${total.toLocaleString('id-ID')}`}
          </h2>
          <p className="mt-2 text-indigo-200 font-semibold text-xs sm:text-sm">
            {totalQty >= 0 ? `${totalQty} Net Barang` : `${Math.abs(totalQty)} Barang Diretur`}
          </p>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-3">
          <button 
            disabled={cart.length === 0 || !paymentConfig.cashEnabled}
            onClick={() => {
              setPaymentType('CASH');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-base sm:text-lg rounded-xl shadow flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99]"
          >
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6" /> [F1] SELESAIKAN TUNAI
          </button>

          <button 
            disabled={cart.length === 0 || total < 0 || !paymentConfig.qrisEnabled}
            onClick={() => {
              setPaymentType('QRIS');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm sm:text-base rounded-xl shadow flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99]"
          >
            <CreditCard className="w-5 h-5" /> BAYAR QRIS (0.7%)
          </button>

          <button 
            disabled={cart.length === 0 || total < 0 || !paymentConfig.edcEnabled}
            onClick={() => {
              setPaymentType('EDC');
              setCashReceived(Math.max(0, total));
              setIsPaymentOpen(true);
            }}
            className="w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-sm sm:text-base rounded-xl shadow flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99]"
          >
            <CreditCard className="w-5 h-5" /> MESIN EDC DEBIT
          </button>
        </div>
      </div>

      {/* MODAL PEMBAYARAN */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {total < 0 ? 'Pengembalian Refund Uang' : `Pembayaran ${paymentType}`}
              </h3>
              <button onClick={() => { setIsPaymentOpen(false); refocusSearch(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>{total < 0 ? 'Total Refund ke Pelanggan:' : 'Total Tagihan:'}</span>
                <span className="font-bold text-slate-800">
                  {total < 0 ? `-Rp ${Math.abs(total).toLocaleString('id-ID')}` : `Rp ${total.toLocaleString('id-ID')}`}
                </span>
              </div>
              {total > 0 && paymentType === 'CASH' && (
                <>
                  <div className="flex justify-between text-slate-500">
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
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-base sm:text-lg shadow-md transition-all"
            >
              KONFIRMASI & SELESAIKAN STRUK
            </button>
          </div>
        </div>
      )}

      {/* MODAL STRUK THERMAL */}
      {completedReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-3 font-mono text-slate-800">
            <div className="text-center border-b pb-3 space-y-1">
              <h3 className="font-black text-lg tracking-wider uppercase">{appName || 'TOKO SERBA 35.000'}</h3>
              <p className="text-[11px] text-slate-500">NPWP: 01.234.567.8-012.000</p>
              <p className="text-[10px] text-slate-400">{completedReceipt.timestamp}</p>
            </div>

            <div className="text-xs space-y-1 border-b pb-2 text-slate-600">
              <div className="flex justify-between">
                <span>No. Resi:</span>
                <span className="font-bold text-slate-800">{completedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{completedReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-bold">{completedReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-2 text-xs py-1 border-b">
              {completedReceipt.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-start font-bold">
                    <span>{item.name}</span>
                    <span className={item.subtotal < 0 ? 'text-amber-600' : ''}>
                      {item.subtotal < 0 ? '-' : ''}Rp {Math.abs(item.subtotal).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                    <span>DPP: Rp {item.dpp.toLocaleString('id-ID')} | PPN: Rp {item.taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs border-b pb-2">
              <div className="flex justify-between text-slate-500">
                <span>DPP:</span>
                <span>Rp {completedReceipt.totalDpp.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>PPN 11%:</span>
                <span>Rp {completedReceipt.totalTax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1 text-slate-900">
                <span>Total Belanja:</span>
                <span>Rp {completedReceipt.grossAmount.toLocaleString('id-ID')}</span>
              </div>
              {completedReceipt.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Bayar Tunai:</span>
                    <span>Rp {(completedReceipt.cashReceived || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Kembalian:</span>
                    <span>Rp {(completedReceipt.change || 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak
              </button>
              <button
                onClick={() => {
                  setCompletedReceipt(null);
                  refocusSearch();
                }}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Selesai (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOID PIN */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-lg font-bold">Otorisasi Supervisor</h3>
            </div>
            <p className="text-xs text-slate-500">
              Membatalkan seluruh pesanan keranjang. Masukkan PIN Supervisor (Demo: 1234):
            </p>

            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="PIN..."
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
                Batal
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

      {/* MODAL PETTY CASH */}
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
                  className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    pettyCashType === 'OUT' 
                      ? 'bg-rose-600 text-white border-rose-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" /> Kas Keluar (Out)
                </button>
                <button
                  type="button"
                  onClick={() => setPettyCashType('IN')}
                  className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    pettyCashType === 'IN' 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" /> Kas Masuk (In)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  placeholder="25000"
                  value={pettyAmount || ''}
                  onChange={(e) => setPettyAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-base font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Keperluan</label>
                <input
                  type="text"
                  required
                  placeholder="Beli kantong plastik kresek"
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

      {/* MODAL CLOSING SHIFT */}
      {isShiftCloseOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tutup Shift Kasir (Blind Count)</h3>
                <p className="text-xs text-slate-400">Hitung fisik seluruh lembar uang di dalam laci kasir</p>
              </div>
              <button onClick={() => { setIsShiftCloseOpen(false); setShowShiftResult(false); refocusSearch(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {!showShiftResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
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
                  Verifikasi Fisik Laci
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl border space-y-2 bg-slate-50">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Target Seharusnya:</span>
                    <span className="font-mono">Rp {expectedCashTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800">
                    <span>Fisik Kasir:</span>
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