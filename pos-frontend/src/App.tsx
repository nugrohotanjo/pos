import { CategoriesView } from "./features/categories/CategoriesView";
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
  INITIAL_STOCK_BATCHES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_PETTY_CASH 
} from './data/initialData';

import { useProductStore } from './stores/useProductStore';
import { getSettingsFromApi, getRolesFromApi } from './utils/api';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('pos_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<CustomRole | undefined>(() => {
    const saved = localStorage.getItem('pos_current_role');
    return saved ? JSON.parse(saved) : undefined;
  });

  const [lang, setLang] = useState<Language>('id');

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace(/^\//, '') || 'dashboard';

  const [activeMenu, setActiveMenuState] = useState<ActiveMenu>(() => {
    const validMenus: ActiveMenu[] = ['dashboard', 'pos', 'products', 'stock-ledger', 
      'reports', 'audit-trail', 'users', 'settings',
      "categories"
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

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const adjustStockLocal = useProductStore((state) => state.adjustStockLocal);

  const [stockBatches, setStockBatches] = useState<StockBatch[]>(INITIAL_STOCK_BATCHES);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [pettyCashRecords, setPettyCashRecords] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    cashEnabled: true,
    qrisEnabled: true,
    edcEnabled: true,
  });

  // Sinkronisasi Roles & Settings dari PostgreSQL
  const syncRolesAndSettings = async () => {
    try {
      const [fetchedRoles, fetchedSettings] = await Promise.all([
        getRolesFromApi(),
        getSettingsFromApi()
      ]);

      setRoles(fetchedRoles);
      if (fetchedSettings) {
        setAppName(fetchedSettings.app_name);
        setPaymentConfig({
          cashEnabled: fetchedSettings.cash_enabled,
          qrisEnabled: fetchedSettings.qris_enabled,
          edcEnabled: fetchedSettings.edc_enabled,
        });
      }

      // Perbarui role user aktif
      if (currentUser) {
        const foundRole = fetchedRoles.find((r: CustomRole) => r.id === currentUser.roleId);
        if (foundRole) {
          setCurrentUserRole(foundRole);
          localStorage.setItem('pos_current_role', JSON.stringify(foundRole));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    syncRolesAndSettings();
  }, [fetchProducts]);

  const hasPermission = (perm: AppPermission): boolean => {
    if (!currentUserRole) return false;
    if (currentUserRole.id === 'role-owner') return true;
    return currentUserRole.permissions?.includes(perm);
  };

  const handleLoginSuccess = (emp: Employee, role: any) => {
    setCurrentUser(emp);
    setCurrentUserRole(role);
    localStorage.setItem('pos_current_user', JSON.stringify(emp));
    localStorage.setItem('pos_current_role', JSON.stringify(role));

    // Kasir yang tidak punya izin dashboard langsung dialihkan ke layar POS
    const canAccessDashboard = role?.id === 'role-owner' || role?.permissions?.includes('access_dashboard');
    if (!canAccessDashboard) {
      setActiveMenu('pos');
    } else {
      setActiveMenu('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserRole(undefined);
    localStorage.removeItem('pos_current_user');
    localStorage.removeItem('pos_current_role');
  };

  const handleUpdateAppName = (newName: string) => {
    setAppName(newName);
  };

  const handleUpdatePaymentConfig = (key: keyof PaymentConfig, value: boolean) => {
    setPaymentConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPettyCash = (entry: PettyCashEntry) => {
    setPettyCashRecords([entry, ...pettyCashRecords]);
  };

  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs((prev) => [log, ...prev]);
  };

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

    cart.forEach((c) => {
      const p = products.find((prod) => prod.barcode === c.barcode);
      if (p) {
        adjustStockLocal(p.barcode, p.stock - c.qty);
      }
    });

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
  };

  if (!currentUser) {
    return (
      <LoginView
        appName={appName}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const activeProductsForPos = (Array.isArray(products) ? products : []).filter((p) => p.isActive !== false);

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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        currentUser={currentUser}
        userRole={currentUserRole}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
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
          onToggleSidebar={handleToggleSidebar}
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
                onAuditLog={() => {}}
              />
            ) : (
              <CashierWelcome 
                currentUser={currentUser} 
                appName={appName} 
                onStartPos={setActiveMenu} 
              />
            )
          )}
          
          

          {activeMenu === "categories" && (
            <CategoriesView
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              canEdit={true}
              onAuditLog={() => {}}
            />
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
              <AuditTrailView />
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
              <UsersView currentUserRole={currentUserRole} currentUser={currentUser} />
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
