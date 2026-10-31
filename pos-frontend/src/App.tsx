import { useState } from 'react';
import type { 
  ActiveMenu, 
  Product, 
  ProductAuditHistory,
  StockMovement, 
  StockMovementType, 
  StockBatch,
  TransactionRecord, 
  AuditLog, 
  Employee, 
  PettyCashEntry, 
  CartItem, 
  PaymentMethod, 
  PaymentConfig, 
  CustomRole, 
  AppPermission 
} from './types';
import { INITIAL_PRODUCTS, FIXED_PRICE } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './features/dashboard/DashboardView';
import { ProductsView } from './features/products/ProductsView';
import { PosView } from './features/pos/PosView';
import { StockLedgerView } from './features/products/StockLedgerView';
import { ReportsView } from './features/reports/ReportsView';
import { UsersView } from './features/users/UsersView';
import { SettingsView } from './features/settings/SettingsView';
import { AuditTrailView } from './features/audit/AuditTrailView';
import { LoginView } from './features/auth/LoginView';
import type { Language } from './data/translations';
import { ShieldAlert, MonitorPlay } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const INITIAL_ROLES: CustomRole[] = [
  {
    id: 'role-owner',
    name: 'Pemilik Toko (Owner)',
    description: 'Akses penuh tanpa batas ke seluruh modul sistem',
    permissions: [
      'access_dashboard', 'manage_products', 'edit_products', 'manage_stock', 'view_reports',
      'view_audit_trail', 'manage_employees', 'manage_settings', 'access_pos',
      'void_transaction', 'exchange_items', 'manage_petty_cash'
    ]
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor Toko',
    description: 'Otorisasi void kasir, edit barang, retur barang, dan mutasi stok',
    permissions: [
      'access_dashboard', 'manage_products', 'edit_products', 'manage_stock', 'view_reports',
      'view_audit_trail', 'access_pos', 'void_transaction', 'exchange_items', 'manage_petty_cash'
    ]
  },
  {
    id: 'role-cashier',
    name: 'Kasir Frontline',
    description: 'Hanya melayani transaksi scan belanja dan kas kecil laci',
    permissions: [
      'access_pos', 'manage_petty_cash'
    ]
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Fadhil', username: 'fadhil', roleId: 'role-owner', pin: '9999', isActive: true },
  { id: 'EMP-002', name: 'Agus Supervisor', username: 'agus', roleId: 'role-supervisor', pin: '1234', isActive: true },
  { id: 'EMP-003', name: 'Budi Santoso', username: 'budi', roleId: 'role-cashier', pin: '1111', isActive: true },
];

const INITIAL_STOCK_BATCHES: StockBatch[] = [
  { id: 'BATCH-01', barcode: '8991001', purchaseCost: 18000, initialQty: 50, remainingQty: 50, receivedAt: '2026-09-01' },
  { id: 'BATCH-02', barcode: '8991002', purchaseCost: 21000, initialQty: 30, remainingQty: 30, receivedAt: '2026-09-02' },
  { id: 'BATCH-03', barcode: '8991003', purchaseCost: 19500, initialQty: 40, remainingQty: 40, receivedAt: '2026-09-03' },
];

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    receiptNumber: 'TRX-2026-001',
    timestamp: '2026-09-20 10:15',
    cashierName: 'Budi Santoso',
    totalQty: 2,
    grossAmount: 70000,
    totalDpp: 63064,
    totalTax: 6936,
    totalCogs: 39000,
    grossProfit: 31000,
    mdrRate: 0,
    mdrFee: 0,
    netSettlement: 70000,
    cashReceived: 100000,
    change: 30000,
    paymentMethod: 'CASH',
    itemsSummary: 'Kaos Polos x1, Set Alat Makan x1',
    items: [
      { barcode: '8991001', name: 'Kaos Polos Katun Combed', price: 35000, costPrice: 18000, qty: 1, subtotal: 35000, dpp: 31532, taxAmount: 3468 },
      { barcode: '8991002', name: 'Set Alat Makan Stainless', price: 35000, costPrice: 21000, qty: 1, subtotal: 35000, dpp: 31532, taxAmount: 3468 },
    ],
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-1001',
    timestamp: '2026-09-20 09:30:12',
    actor: 'Agus (Supervisor)',
    module: 'POS_TERMINAL',
    action: 'VOID_ORDER',
    details: 'Membatalkan seluruh belanja keranjang (3 item) karena dompet pelanggan tertinggal',
    status: 'APPROVED',
  }
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
  const [appName, setAppName] = useState('TOKO SERBA 35K');
  // Sesi Login (null = Belum Login / Tampilkan Layar Login)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.replace(/^\//, '') || 'dashboard';

  const [activeMenu, setActiveMenuState] = useState<ActiveMenu>(() => {
    const validMenus: ActiveMenu[] = [
      'dashboard', 'pos', 'products', 'stock-ledger', 
      'reports', 'audit-trail', 'users', 'settings'
    ];
    return validMenus.includes(currentPath as ActiveMenu) ? (currentPath as ActiveMenu) : 'dashboard';
  });

  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActiveMenuState(path as ActiveMenu);
  }, [location.pathname]);

  const setActiveMenu = (menu: ActiveMenu) => {
    setActiveMenuState(menu);
    navigate(menu === 'dashboard' ? '/' : `/${menu}`);
  };

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>(INITIAL_STOCK_BATCHES);
  const [lang, setLang] = useState<Language>('id');
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [roles, setRoles] = useState<CustomRole[]>(INITIAL_ROLES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [pettyCashRecords, setPettyCashRecords] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    cashEnabled: true,
    qrisEnabled: true,
    edcEnabled: true,
  });

  const currentUserRole = roles.find(r => r.id === currentUser?.roleId);

  const hasPermission = (perm: AppPermission): boolean => {
    if (!currentUserRole) return false;
    if (currentUserRole.id === 'role-owner') return true;
    return currentUserRole.permissions.includes(perm);
  };

  const handleUpdateAppName = (newName: string) => {
    const old = appName;
    setAppName(newName);
    pushAudit(
      'SETTINGS', 
      'UPDATE_STORE_SETTINGS', 
      `Mengubah nama aplikasi/toko dari "${old}" menjadi "${newName}"`
    );
  };

  const pushAudit = (
    module: AuditLog['module'],
    action: AuditLog['action'],
    details: string,
    actor = currentUser ? `${currentUser.name} (${currentUserRole?.name})` : 'Sistem',
    status: AuditLog['status'] = 'AUTO_RECORDED'
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor,
      module,
      action,
      details,
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handler Login & Logout
  const handleLoginSuccess = (emp: Employee) => {
    setCurrentUser(emp);
    const role = roles.find(r => r.id === emp.roleId);
    
    pushAudit('USERS_ROLES', 'TOGGLE_EMPLOYEE', `Petugas "${emp.name}" berhasil login shift.`, emp.name, 'APPROVED');

    // Arahkan otomatis ke layar kasir jika Kasir, atau ke dashboard jika Owner/Supervisor
    if (role && !role.permissions.includes('access_dashboard')) {
      setActiveMenu('pos');
    } else {
      setActiveMenu('dashboard');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      pushAudit('USERS_ROLES', 'TOGGLE_EMPLOYEE', `Petugas "${currentUser.name}" keluar dari sistem (logout).`, currentUser.name, 'APPROVED');
    }
    setCurrentUser(null);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([{ ...newProduct, isActive: true, history: [] }, ...products]);
    const initialBatch: StockBatch = {
      id: `BATCH-${Date.now().toString().slice(-4)}`,
      barcode: newProduct.barcode,
      purchaseCost: newProduct.costPrice || 20000,
      initialQty: newProduct.stock,
      remainingQty: newProduct.stock,
      receivedAt: new Date().toLocaleDateString('id-ID')
    };
    setStockBatches(prev => [...prev, initialBatch]);
    pushAudit('PRODUCTS', 'CREATE_PRODUCT', `Menambahkan SKU baru "${newProduct.name}" (Barcode: ${newProduct.barcode})`);
  };

  const handleUpdateProduct = (
    barcode: string, 
    updatedFields: { name: string; category: string; stock: number; price?: number; costPrice?: number }, 
    reason: string
  ) => {
    const target = products.find(p => p.barcode === barcode);
    if (!target || !currentUser) return;

    const timestamp = new Date().toLocaleString('id-ID');
    const updatedBy = `${currentUser.name} (${currentUserRole?.name})`;

    const historyEntry: ProductAuditHistory = {
      id: `HIST-${Date.now().toString().slice(-4)}`,
      timestamp,
      updatedBy,
      oldValues: {
        name: target.name,
        category: target.category,
        stock: target.stock,
        price: target.price || FIXED_PRICE,
        costPrice: target.costPrice || 20000,
      },
      newValues: {
        ...updatedFields,
      },
      reason,
    };

    setProducts(products.map(p => {
      if (p.barcode === barcode) {
        return {
          ...p,
          ...updatedFields,
          history: [historyEntry, ...(p.history || [])],
        };
      }
      return p;
    }));

    pushAudit(
      'PRODUCTS', 
      'UPDATE_PRODUCT', 
      `Mengubah data SKU "${target.name}" (${barcode}). Nama: "${updatedFields.name}", Stok: ${target.stock} ➔ ${updatedFields.stock}. Alasan: ${reason}`,
      updatedBy,
      'APPROVED'
    );
  };

  const handleToggleArchiveProduct = (barcode: string) => {
    const target = products.find(p => p.barcode === barcode);
    if (!target) return;
    const currentlyActive = target.isActive !== false;
    setProducts(products.map(p => p.barcode === barcode ? { ...p, isActive: !currentlyActive } : p));
    pushAudit('PRODUCTS', currentlyActive ? 'ARCHIVE_PRODUCT' : 'RESTORE_PRODUCT', `${currentlyActive ? 'Mengarsipkan' : 'Memulihkan'} barang: "${target.name}" (${barcode})`);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees([...employees, newEmp]);
    const role = roles.find(r => r.id === newEmp.roleId);
    pushAudit('USERS_ROLES', 'CREATE_EMPLOYEE', `Mendaftarkan staf baru "${newEmp.name}" (@${newEmp.username}) dengan role: ${role?.name}`);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(employees.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));
    pushAudit('USERS_ROLES', 'TOGGLE_EMPLOYEE', `Mengubah status staf "${emp?.name}" menjadi: ${!emp?.isActive ? 'AKTIF' : 'NONAKTIF'}`);
  };

  const handleAddRole = (newRole: CustomRole) => {
    setRoles([...roles, newRole]);
    pushAudit('USERS_ROLES', 'CREATE_ROLE', `Membuat role baru "${newRole.name}" dengan ${newRole.permissions.length} izin fitur`);
  };

  const handleUpdateRolePermissions = (roleId: string, permissions: AppPermission[]) => {
    setRoles(roles.map(r => r.id === roleId ? { ...r, permissions } : r));
    const target = roles.find(r => r.id === roleId);
    pushAudit('USERS_ROLES', 'UPDATE_PERMISSIONS', `Memperbarui hak akses role "${target?.name}": total ${permissions.length} izin aktif`);
  };

  const handleUpdatePaymentConfig = (key: keyof PaymentConfig, value: boolean) => {
    setPaymentConfig(prev => ({ ...prev, [key]: value }));
    pushAudit('SETTINGS', 'UPDATE_PAYMENT_CONFIG', `Mengubah status jalur bayar ${key} menjadi: ${value ? 'AKTIF' : 'NONAKTIF / GANGGUAN'}`);
  };

  const handleAddPettyCash = (entry: PettyCashEntry) => {
    setPettyCashRecords([entry, ...pettyCashRecords]);
    pushAudit('PETTY_CASH', entry.type === 'IN' ? 'PETTY_CASH_IN' : 'PETTY_CASH_OUT', `Mutasi laci kasir Rp ${entry.amount.toLocaleString('id-ID')} untuk: ${entry.reason}`, currentUser?.name || 'Kasir', 'APPROVED');
  };

  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  const deductFifoStock = (barcode: string, qtyToDeduct: number): number => {
    let remainingToDeduct = qtyToDeduct;
    let totalItemCost = 0;
    const updatedBatches = [...stockBatches];

    for (let i = 0; i < updatedBatches.length; i++) {
      const batch = updatedBatches[i];
      if (batch.barcode === barcode && batch.remainingQty > 0) {
        const take = Math.min(batch.remainingQty, remainingToDeduct);
        batch.remainingQty -= take;
        totalItemCost += take * batch.purchaseCost;
        remainingToDeduct -= take;
        if (remainingToDeduct === 0) break;
      }
    }

    if (remainingToDeduct > 0) {
      totalItemCost += remainingToDeduct * 20000;
    }

    setStockBatches(updatedBatches);
    return totalItemCost;
  };

  const handleCompleteTransaction = (
    cart: CartItem[], 
    total: number, 
    method: PaymentMethod,
    cashReceived: number,
    change: number
  ): TransactionRecord => {
    let mdrRate = 0;
    if (method === 'QRIS') mdrRate = 0.007;
    if (method === 'EDC') mdrRate = 0.015;

    const grossAmount = Math.max(0, total);
    const mdrFee = Math.round(grossAmount * mdrRate);
    const netSettlement = grossAmount - mdrFee;

    const TAX_RATE = 0.11;
    let totalCogs = 0;
    let totalDpp = 0;
    let totalTax = 0;

    const itemsSnapshot = cart.map(i => {
      const itemSubtotal = i.qty * FIXED_PRICE;
      const itemCostTotal = i.qty > 0 ? deductFifoStock(i.barcode, i.qty) : 0;
      const avgCostPerUnit = i.qty > 0 ? Math.round(itemCostTotal / i.qty) : 20000;
      totalCogs += itemCostTotal;

      const dpp = Math.round(itemSubtotal / (1 + TAX_RATE));
      const taxAmount = itemSubtotal - dpp;

      totalDpp += dpp;
      totalTax += taxAmount;

      return {
        barcode: i.barcode,
        name: i.name,
        price: FIXED_PRICE,
        costPrice: avgCostPerUnit,
        qty: i.qty,
        subtotal: itemSubtotal,
        dpp,
        taxAmount,
        isReturn: i.isReturn,
      };
    });

    const grossProfit = grossAmount - totalCogs;
    const summary = cart.map(i => `${i.name} (${i.qty > 0 ? '+' : ''}${i.qty})`).join(', ');

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      receiptNumber: `TRX-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      cashierName: currentUser?.name || 'Kasir',
      totalQty: cart.reduce((sum, i) => sum + i.qty, 0),
      grossAmount,
      totalDpp,
      totalTax,
      totalCogs,
      grossProfit,
      mdrRate,
      mdrFee,
      netSettlement,
      cashReceived,
      change,
      paymentMethod: method,
      itemsSummary: summary,
      items: itemsSnapshot,
    };

    setTransactions([newTx, ...transactions]);

    const negativeStockAlerts: string[] = [];
    const updatedProducts = products.map(prod => {
      const cartItem = cart.find(c => c.barcode === prod.barcode);
      if (cartItem) {
        const newStock = prod.stock - cartItem.qty;
        if (newStock < 0) negativeStockAlerts.push(`${prod.name} (Sisa: ${newStock})`);
        return { ...prod, stock: newStock };
      }
      return prod;
    });

    setProducts(updatedProducts);

    pushAudit('POS_TERMINAL', 'SALE_COMPLETED', `Transaksi ${newTx.receiptNumber} selesai (${method}) senilai Rp ${grossAmount.toLocaleString('id-ID')}. Laba FIFO: Rp ${grossProfit.toLocaleString('id-ID')}`, currentUser?.name || 'Kasir');

    if (negativeStockAlerts.length > 0) {
      pushAudit('INVENTORY', 'STOCK_MUTATION', `PERINGATAN GUDANG: Transaksi ${newTx.receiptNumber} menyebabkan stok minus pada: ${negativeStockAlerts.join(', ')}. Jadwalkan Stock Opname segera.`, 'Sistem POS (Auto)', 'APPROVED');
    }

    return newTx;
  };

  const handleAdjustStock = (
    barcode: string, 
    quantity: number, 
    type: StockMovementType, 
    reason: string,
    purchaseCost?: number
  ) => {
    setProducts(products.map(p => {
      if (p.barcode === barcode) {
        const updatedStock = type === 'IN' ? p.stock + quantity : Math.max(0, p.stock - quantity);
        return { ...p, stock: updatedStock };
      }
      return p;
    }));

    if (type === 'IN') {
      const newBatch: StockBatch = {
        id: `BATCH-${Date.now().toString().slice(-4)}`,
        barcode,
        purchaseCost: purchaseCost || 20000,
        initialQty: quantity,
        remainingQty: quantity,
        receivedAt: new Date().toLocaleDateString('id-ID')
      };
      setStockBatches(prev => [...prev, newBatch]);
    }

    const targetProduct = products.find(p => p.barcode === barcode);
    const newRecord: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      barcode,
      productName: targetProduct?.name || barcode,
      type,
      quantity,
      purchaseCost,
      reason,
      recordedBy: currentUser?.name || 'Staf'
    };
    setStockMovements([newRecord, ...stockMovements]);

    pushAudit('INVENTORY', 'STOCK_MUTATION', `Penyesuaian stok ${type === 'IN' ? '+' : '-'}${quantity} pcs untuk "${targetProduct?.name}" (${barcode}). Alasan: ${reason}`);
  };

  // 1. JIKA BELUM LOGIN: TAMPILKAN LAYAR LOGIN
  if (!currentUser) {
    return (
      <LoginView
        employees={employees}
        roles={roles}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 2. JIKA SEDANG DI TERMINAL KASIR (POS)
  const activeProductsForPos = products.filter(p => p.isActive !== false);

  if (!currentUser) {
    return (
      <LoginView
        employees={employees}
        roles={roles}
        onLoginSuccess={handleLoginSuccess}
        appName={appName}
      />
    );
  }

  if (activeMenu === 'pos') {
    return (
      <PosView 
        products={activeProductsForPos} 
        paymentConfig={paymentConfig}
        setActiveMenu={setActiveMenu}
        pettyCashRecords={pettyCashRecords}
        onAddPettyCash={handleAddPettyCash}
        onAddAuditLog={handleAddAuditLog}
        onCompleteTransaction={handleCompleteTransaction}
        appName={appName}
      />
    );
  }

  // Tampilan Selamat Datang Khusus Kasir / Non-Admin
  const renderCashierWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 select-none">
      <div className="max-w-xl w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <MonitorPlay className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-800">
            Selamat Bertugas, {currentUser?.name}!
          </h2>
          <p className="text-xs text-slate-500">
            Shift kasir aktif. Siap melayani transaksi pelanggan di Toko Serba 35.000.
          </p>
        </div>

        {/* Tombol Utama Langsung Mulai Kasir */}
        <div>
          <button
            onClick={() => setActiveMenu('pos')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
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

  // 3. LAYOUT UTAMA ADMIN SISTEM
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        currentUser={currentUser}
        userRole={currentUserRole}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        appName={appName}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          activeMenu={activeMenu} 
          lang={lang} 
          setLang={setLang} 
          currentUser={currentUser}
          userRole={currentUserRole}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeMenu === 'dashboard' && (
            hasPermission('access_dashboard') ? (
              <DashboardView 
                transactions={transactions}
                products={products}
                pettyCashRecords={pettyCashRecords}
                stockMovements={stockMovements}
                setActiveMenu={setActiveMenu}
              />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'products' && (
            hasPermission('manage_products') ? (
              <ProductsView 
                products={products} 
                onAddProduct={handleAddProduct} 
                onToggleArchiveProduct={handleToggleArchiveProduct}
                onUpdateProduct={handleUpdateProduct}
                canEdit={hasPermission('edit_products')}
              />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'stock-ledger' && (
            hasPermission('manage_stock') ? (
              <StockLedgerView 
                products={products} 
                movements={stockMovements} 
                onAdjustStock={handleAdjustStock} 
              />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'reports' && (
            hasPermission('view_reports') ? (
              <ReportsView 
                transactions={transactions} 
                auditLogs={auditLogs}
                pettyCashRecords={pettyCashRecords}
              />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'audit-trail' && (
            hasPermission('view_audit_trail') ? (
              <AuditTrailView logs={auditLogs} />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'users' && (
            hasPermission('manage_employees') ? (
              <UsersView 
                employees={employees} 
                roles={roles}
                onAddEmployee={handleAddEmployee} 
                onToggleStatus={handleToggleEmployeeStatus} 
                onAddRole={handleAddRole}
                onUpdateRolePermissions={handleUpdateRolePermissions}
              />
            ) : renderCashierWelcome()
          )}
          
          {activeMenu === 'settings' && (
            hasPermission('manage_settings') ? (
              <SettingsView 
                paymentConfig={paymentConfig} 
                onUpdatePaymentConfig={handleUpdatePaymentConfig}
                appName={appName}
                onUpdateAppName={handleUpdateAppName}
              />
            ) : renderCashierWelcome()
          )}
        </main>
      </div>
    </div>
  );
}