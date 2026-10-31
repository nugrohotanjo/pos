import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { 
  ActiveMenu, 
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

import { 
  INITIAL_ROLES, 
  INITIAL_EMPLOYEES, 
  INITIAL_STOCK_BATCHES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_PETTY_CASH 
} from './data/initialData';

import { useProductStore } from './stores/useProductStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CashierWelcome } from './components/layout/CashierWelcome';

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

export default function App() {
  const [appName, setAppName] = useState('POS Ritel General');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
  const [lang, setLang] = useState<Language>('id');

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

  // Ambil state dan dispatcher dari Zustand Store
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const adjustStockLocal = useProductStore((state) => state.adjustStockLocal);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // State Operasional Toko
  const [stockBatches, setStockBatches] = useState<StockBatch[]>(INITIAL_STOCK_BATCHES);
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

  const currentUserRole = roles.find((r) => r.id === currentUser?.roleId);

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
      user: actor,
      module,
      action,
      details,
      status
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth Handlers
  const handleLoginSuccess = (emp: Employee) => {
    setCurrentUser(emp);
    const role = roles.find((r) => r.id === emp.roleId);
    pushAudit('USERS_ROLES', 'TOGGLE_EMPLOYEE', `Petugas "${emp.name}" login shift.`, emp.name, 'APPROVED');

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

  // User & Settings Handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees([...employees, newEmp]);
    const role = roles.find((r) => r.id === newEmp.roleId);
    pushAudit('USERS_ROLES', 'CREATE_EMPLOYEE', `Mendaftarkan staf baru "${newEmp.name}" (@${newEmp.username}) dengan role: ${role?.name}`);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees(employees.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)));
    pushAudit('USERS_ROLES', 'TOGGLE_EMPLOYEE', `Ubah status staf "${emp?.name}" -> ${!emp?.isActive ? 'AKTIF' : 'NONAKTIF'}`);
  };

  const handleAddRole = (newRole: CustomRole) => {
    setRoles([...roles, newRole]);
    pushAudit('USERS_ROLES', 'CREATE_ROLE', `Membuat role "${newRole.name}" dengan ${newRole.permissions.length} izin`);
  };

  const handleUpdateRolePermissions = (roleId: string, permissions: AppPermission[]) => {
    setRoles(roles.map((r) => (r.id === roleId ? { ...r, permissions } : r)));
    const target = roles.find((r) => r.id === roleId);
    pushAudit('USERS_ROLES', 'UPDATE_PERMISSIONS', `Update hak akses role "${target?.name}": total ${permissions.length} izin`);
  };

  const handleUpdatePaymentConfig = (key: keyof PaymentConfig, value: boolean) => {
    setPaymentConfig((prev) => ({ ...prev, [key]: value }));
    pushAudit('SETTINGS', 'UPDATE_PAYMENT_CONFIG', `Ubah status payment ${key} -> ${value ? 'AKTIF' : 'NONAKTIF'}`);
  };

  const handleAddPettyCash = (entry: PettyCashEntry) => {
    setPettyCashRecords([entry, ...pettyCashRecords]);
    pushAudit('PETTY_CASH', entry.type === 'IN' ? 'PETTY_CASH_IN' : 'PETTY_CASH_OUT', `Kas laci Rp ${entry.amount.toLocaleString('id-ID')}: ${entry.reason}`, currentUser?.name || 'Kasir', 'APPROVED');
  };

  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs((prev) => [log, ...prev]);
  };

  // FIFO Deduct & Sales Execution
  const deductFifoStock = (barcode: string, qtyToDeduct: number, fallbackCost: number): number => {
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
      totalItemCost += remainingToDeduct * fallbackCost;
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

    const itemsSnapshot = cart.map((i) => {
      const itemPrice = i.price || 0;
      const itemCost = i.costPrice || 0;
      const itemSubtotal = i.qty * itemPrice;
      const itemCostTotal = i.qty > 0 ? deductFifoStock(i.barcode, i.qty, itemCost) : 0;
      const avgCostPerUnit = i.qty > 0 ? Math.round(itemCostTotal / i.qty) : itemCost;
      totalCogs += itemCostTotal;

      const dpp = Math.round(itemSubtotal / (1 + TAX_RATE));
      const taxAmount = itemSubtotal - dpp;

      totalDpp += dpp;
      totalTax += taxAmount;

      return {
        barcode: i.barcode,
        name: i.name,
        price: itemPrice,
        costPrice: avgCostPerUnit,
        qty: i.qty,
        subtotal: itemSubtotal,
        dpp,
        taxAmount,
        isReturn: i.isReturn,
      };
    });

    const grossProfit = grossAmount - totalCogs;
    const summary = cart.map((i) => `${i.name} (${i.qty > 0 ? '+' : ''}${i.qty})`).join(', ');

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

    // Update stok produk di Zustand Store
    cart.forEach((c) => {
      const p = products.find((prod) => prod.barcode === c.barcode);
      if (p) {
        adjustStockLocal(p.barcode, p.stock - c.qty);
      }
    });

    pushAudit('POS_TERMINAL', 'SALE_COMPLETED', `Transaksi ${newTx.receiptNumber} selesai (${method}) Rp ${grossAmount.toLocaleString('id-ID')}`, currentUser?.name || 'Kasir');

    return newTx;
  };

  const handleAdjustStock = (
    barcode: string, 
    quantity: number, 
    type: StockMovementType, 
    reason: string,
    purchaseCost?: number
  ) => {
    const targetProduct = products.find((p) => p.barcode === barcode);
    if (!targetProduct) return;

    const updatedStock = type === 'IN' ? targetProduct.stock + quantity : Math.max(0, targetProduct.stock - quantity);
    adjustStockLocal(barcode, updatedStock);

    if (type === 'IN') {
      const newBatch: StockBatch = {
        id: `BATCH-${Date.now().toString().slice(-4)}`,
        barcode,
        purchaseCost: purchaseCost || 0,
        initialQty: quantity,
        remainingQty: quantity,
        receivedAt: new Date().toLocaleDateString('id-ID')
      };
      setStockBatches((prev) => [...prev, newBatch]);
    }

    const newRecord: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      barcode,
      productName: targetProduct.name,
      type,
      quantity,
      purchaseCost,
      reason,
      recordedBy: currentUser?.name || 'Staf'
    };
    setStockMovements([newRecord, ...stockMovements]);

    pushAudit('INVENTORY', 'STOCK_MUTATION', `Penyesuaian stok ${type === 'IN' ? '+' : '-'}${quantity} untuk "${targetProduct.name}" (${barcode}). Alasan: ${reason}`);
  };

  // 1. Tampilan Login jika belum autentikasi
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

  // 2. Tampilan Layar Kasir (POS)
  const activeProductsForPos = products.filter((p) => p.isActive !== false);

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

  // 3. Layout Utama Dashboard
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
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          {activeMenu === 'products' && (
            hasPermission('manage_products') ? (
              <ProductsView
                canEdit={hasPermission('edit_products')}
                currentUser={currentUser}
                currentUserRole={currentUserRole}
                onAuditLog={pushAudit}
              />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          {activeMenu === 'stock-ledger' && (
            hasPermission('manage_stock') ? (
              <StockLedgerView 
                products={products} 
                movements={stockMovements} 
                onAdjustStock={handleAdjustStock} 
              />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          {activeMenu === 'reports' && (
            hasPermission('view_reports') ? (
              <ReportsView 
                transactions={transactions} 
                auditLogs={auditLogs}
                pettyCashRecords={pettyCashRecords}
              />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          {activeMenu === 'audit-trail' && (
            hasPermission('view_audit_trail') ? (
              <AuditTrailView logs={auditLogs} />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
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
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          {activeMenu === 'settings' && (
            hasPermission('manage_settings') ? (
              <SettingsView 
                paymentConfig={paymentConfig} 
                onUpdatePaymentConfig={handleUpdatePaymentConfig}
                appName={appName}
                onUpdateAppName={handleUpdateAppName}
              />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
        </main>
      </div>
    </div>
  );
}
