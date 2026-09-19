import { useState } from 'react';
import type { 
  ActiveMenu, 
  Product, 
  StockMovement, 
  StockMovementType, 
  TransactionRecord, 
  AuditLog, 
  Employee, 
  PettyCashEntry, 
  CartItem, 
  PaymentMethod,
  PaymentConfig 
} from './types';
import { INITIAL_PRODUCTS } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './features/dashboard/DashboardView';
import { ProductsView } from './features/products/ProductsView';
import { PosView } from './features/pos/PosView';
import { StockLedgerView } from './features/products/StockLedgerView';
import { ReportsView } from './features/reports/ReportsView';
import { UsersView } from './features/users/UsersView';
import { SettingsView } from './features/settings/SettingsView';
import type { Language } from './data/translations';

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    receiptNumber: 'TRX-2026-001',
    timestamp: '2026-09-20 10:15',
    cashierName: 'Budi Santoso',
    totalQty: 2,
    grossAmount: 70000,
    mdrRate: 0,
    mdrFee: 0,
    netSettlement: 70000,
    paymentMethod: 'CASH',
    itemsSummary: 'Kaos Polos x1, Set Alat Makan x1',
  },
  {
    id: 'tx-2',
    receiptNumber: 'TRX-2026-002',
    timestamp: '2026-09-20 10:42',
    cashierName: 'Budi Santoso',
    totalQty: 1,
    grossAmount: 35000,
    mdrRate: 0.007,
    mdrFee: 245,
    netSettlement: 34755,
    paymentMethod: 'QRIS',
    itemsSummary: 'Lampu Meja Belajar LED x1',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-20 09:30',
    actor: 'Supervisor (PIN: 1234)',
    action: 'VOID_ORDER',
    details: 'Membatalkan pesanan karena pelanggan salah membawa dompet',
    status: 'APPROVED',
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Fadhil', username: 'fadhil', role: 'OWNER', pin: '9999', isActive: true },
  { id: 'EMP-002', name: 'Agus Supervisor', username: 'agus', role: 'SUPERVISOR', pin: '1234', isActive: true },
  { id: 'EMP-003', name: 'Budi Santoso', username: 'budi', role: 'CASHIER', pin: '1111', isActive: true },
];

const INITIAL_PETTY_CASH: PettyCashEntry[] = [
  {
    id: 'PETTY-001',
    type: 'OUT',
    amount: 15000,
    reason: 'Beli kantong plastik kresek 2 pack',
    timestamp: '2026-09-20 08:30',
    cashierName: 'Budi Santoso'
  }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [lang, setLang] = useState<Language>('id');
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [pettyCashRecords, setPettyCashRecords] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);

  // State Konfigurasi Jalur Pembayaran Aktif
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    cashEnabled: true,
    qrisEnabled: true,
    edcEnabled: true,
  });

  const handleUpdatePaymentConfig = (key: keyof PaymentConfig, value: boolean) => {
    setPaymentConfig(prev => ({ ...prev, [key]: value }));
    
    // Log Audit otomatis saat pemilik toko mematikan/menyalakan jalur bayar
    setAuditLogs([
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        actor: 'Fadhil (Owner)',
        action: 'PAYMENT_CONFIG_UPDATE',
        details: `Mengubah pengaturan ${key} menjadi: ${value ? 'AKTIF' : 'NONAKTIF / GANGGUAN'}`,
        status: 'APPROVED'
      },
      ...auditLogs
    ]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setAuditLogs([
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        actor: 'Fadhil (Owner)',
        action: 'STOCK_OVERRIDE',
        details: `Menambah SKU baru: ${newProduct.name} (${newProduct.barcode}) stok: ${newProduct.stock}`,
        status: 'APPROVED'
      },
      ...auditLogs
    ]);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees([...employees, newEmp]);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));
  };

  const handleAddPettyCash = (entry: PettyCashEntry) => {
    setPettyCashRecords([entry, ...pettyCashRecords]);
  };

  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs([log, ...auditLogs]);
  };

  const handleCompleteTransaction = (cart: CartItem[], total: number, method: PaymentMethod) => {
    let mdrRate = 0;
    if (method === 'QRIS') mdrRate = 0.007;
    if (method === 'EDC') mdrRate = 0.015;

    const grossAmount = Math.max(0, total);
    const mdrFee = Math.round(grossAmount * mdrRate);
    const netSettlement = grossAmount - mdrFee;

    const summary = cart.map(i => `${i.name} (${i.qty > 0 ? '+' : ''}${i.qty})`).join(', ');

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      receiptNumber: `TRX-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      cashierName: 'Budi Santoso',
      totalQty: cart.reduce((sum, i) => sum + i.qty, 0),
      grossAmount,
      mdrRate,
      mdrFee,
      netSettlement,
      paymentMethod: method,
      itemsSummary: summary,
    };

    setTransactions([newTx, ...transactions]);
  };

  const handleAdjustStock = (barcode: string, quantity: number, type: StockMovementType, reason: string) => {
    setProducts(products.map(p => {
      if (p.barcode === barcode) {
        const updatedStock = type === 'IN' ? p.stock + quantity : Math.max(0, p.stock - quantity);
        return { ...p, stock: updatedStock };
      }
      return p;
    }));

    const targetProduct = products.find(p => p.barcode === barcode);
    const newRecord: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      barcode,
      productName: targetProduct?.name || barcode,
      type,
      quantity,
      reason,
      recordedBy: 'Owner (Fadhil)'
    };
    setStockMovements([newRecord, ...stockMovements]);
  };

  if (activeMenu === 'pos') {
    return (
      <PosView 
        products={products} 
        paymentConfig={paymentConfig}
        setActiveMenu={setActiveMenu}
        pettyCashRecords={pettyCashRecords}
        onAddPettyCash={handleAddPettyCash}
        onAddAuditLog={handleAddAuditLog}
        onCompleteTransaction={handleCompleteTransaction}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header activeMenu={activeMenu} lang={lang} setLang={setLang} />
        {activeMenu === 'dashboard' && <DashboardView />}
        {activeMenu === 'products' && (
          <ProductsView products={products} onAddProduct={handleAddProduct} />
        )}
        {activeMenu === 'stock-ledger' && (
          <StockLedgerView 
            products={products} 
            movements={stockMovements} 
            onAdjustStock={handleAdjustStock} 
          />
        )}
        {activeMenu === 'reports' && (
          <ReportsView 
            transactions={transactions} 
            auditLogs={auditLogs}
            pettyCashRecords={pettyCashRecords}
          />
        )}
        {activeMenu === 'users' && (
          <UsersView 
            employees={employees} 
            onAddEmployee={handleAddEmployee} 
            onToggleStatus={handleToggleEmployeeStatus} 
          />
        )}
        {activeMenu === 'settings' && (
          <SettingsView 
            paymentConfig={paymentConfig} 
            onUpdatePaymentConfig={handleUpdatePaymentConfig} 
          />
        )}
      </main>
    </div>
  );
}