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
import type { Language } from './data/translations';

const INITIAL_ROLES: CustomRole[] = [
  {
    id: 'role-owner',
    name: 'Pemilik Toko (Owner)',
    description: 'Akses penuh tanpa batas ke seluruh modul sistem',
    permissions: [
      'access_pos', 'void_transaction', 'exchange_items', 'manage_petty_cash',
      'manage_products', 'manage_stock', 'view_reports', 'view_audit_trail', 'manage_employees', 'manage_settings'
    ]
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor Toko',
    description: 'Otorisasi void kasir, retur barang, dan mutasi stok',
    permissions: [
      'access_pos', 'void_transaction', 'exchange_items', 'manage_petty_cash',
      'manage_stock', 'view_reports', 'view_audit_trail'
    ]
  },
  {
    id: 'role-cashier',
    name: 'Kasir Frontline',
    description: 'Operasional harian scan belanja dan terima uang laci',
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
    cashReceived: 100000,
    change: 30000,
    paymentMethod: 'CASH',
    itemsSummary: 'Kaos Polos x1, Set Alat Makan x1',
    items: [
      {
        barcode: '8991001',
        name: 'Kaos Polos Katun Combed',
        price: 35000,
        qty: 1,
        subtotal: 35000,
      },
      {
        barcode: '8991002',
        name: 'Set Alat Makan Stainless',
        price: 35000,
        qty: 1,
        subtotal: 35000,
      },
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
  },
  {
    id: 'AUD-1002',
    timestamp: '2026-09-20 08:30:00',
    actor: 'Budi Santoso (Kasir)',
    module: 'PETTY_CASH',
    action: 'PETTY_CASH_OUT',
    details: 'Pengeluaran kas laci sebesar Rp 15.000 untuk kantong kresek 2 pack',
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
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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

  const pushAudit = (
    module: AuditLog['module'],
    action: AuditLog['action'],
    details: string,
    actor = 'Fadhil (Owner)',
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

  const handleAddProduct = (newProduct: Product) => {
    setProducts([{ ...newProduct, isActive: true }, ...products]);
    pushAudit('PRODUCTS', 'CREATE_PRODUCT', `Menambahkan SKU baru "${newProduct.name}" (Barcode: ${newProduct.barcode}) stok awal: ${newProduct.stock} pcs`);
  };

  const handleToggleArchiveProduct = (barcode: string) => {
    const target = products.find(p => p.barcode === barcode);
    if (!target) return;

    const currentlyActive = target.isActive !== false;
    setProducts(products.map(p => p.barcode === barcode ? { ...p, isActive: !currentlyActive } : p));

    if (currentlyActive) {
      pushAudit('PRODUCTS', 'ARCHIVE_PRODUCT', `Mengarsipkan barang (soft delete): "${target.name}" (${barcode})`);
    } else {
      pushAudit('PRODUCTS', 'RESTORE_PRODUCT', `Memulihkan barang dari arsip: "${target.name}" (${barcode})`);
    }
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
    pushAudit('PETTY_CASH', entry.type === 'IN' ? 'PETTY_CASH_IN' : 'PETTY_CASH_OUT', `Mutasi laci kasir Rp ${entry.amount.toLocaleString('id-ID')} untuk: ${entry.reason}`, entry.cashierName, 'APPROVED');
  };

  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs(prev => [log, ...prev]);
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

    const summary = cart.map(i => `${i.name} (${i.qty > 0 ? '+' : ''}${i.qty})`).join(', ');

    const itemsSnapshot = cart.map(i => ({
      barcode: i.barcode,
      name: i.name,
      price: FIXED_PRICE,
      qty: i.qty,
      subtotal: i.qty * FIXED_PRICE,
      isReturn: i.isReturn,
    }));

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
        if (newStock < 0) {
          negativeStockAlerts.push(`${prod.name} (Sisa: ${newStock})`);
        }
        return { ...prod, stock: newStock };
      }
      return prod;
    });

    setProducts(updatedProducts);

    pushAudit('POS_TERMINAL', 'SALE_COMPLETED', `Transaksi ${newTx.receiptNumber} selesai (${method}) senilai Rp ${grossAmount.toLocaleString('id-ID')} (${newTx.totalQty} item)`, 'Budi Santoso (Kasir)');

    if (negativeStockAlerts.length > 0) {
      pushAudit('INVENTORY', 'STOCK_MUTATION', `PERINGATAN GUDANG: Transaksi ${newTx.receiptNumber} menyebabkan stok minus pada: ${negativeStockAlerts.join(', ')}. Jadwalkan Stock Opname segera.`, 'Sistem POS (Auto)', 'APPROVED');
    }

    return newTx;
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

    pushAudit('INVENTORY', 'STOCK_MUTATION', `Penyesuaian stok manual ${type === 'IN' ? '+' : '-'}${quantity} pcs untuk "${targetProduct?.name}" (${barcode}). Alasan: ${reason}`);
  };

  // Filter agar terminal kasir hanya bisa mengakses barang aktif
  const activeProductsForPos = products.filter(p => p.isActive !== false);

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
          <ProductsView 
            products={products} 
            onAddProduct={handleAddProduct} 
            onToggleArchiveProduct={handleToggleArchiveProduct}
          />
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
        {activeMenu === 'audit-trail' && (
          <AuditTrailView logs={auditLogs} />
        )}
        {activeMenu === 'users' && (
          <UsersView 
            employees={employees} 
            roles={roles}
            onAddEmployee={handleAddEmployee} 
            onToggleStatus={handleToggleEmployeeStatus} 
            onAddRole={handleAddRole}
            onUpdateRolePermissions={handleUpdateRolePermissions}
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