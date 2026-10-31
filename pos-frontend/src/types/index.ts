// Product Audit History
export type ProductAuditHistory = {
  id: string;
  timestamp: string;
  updatedBy: string;
  oldValues: {
    name: string;
    category: string;
    stock: number;
    price?: number;
    costPrice?: number;
    unit?: string;
    minStock?: number;
    shelfLocation?: string;
  };
  newValues: {
    name?: string;
    category?: string;
    stock?: number;
    price?: number;
    costPrice?: number;
    unit?: string;
    minStock?: number;
    shelfLocation?: string;
  };
  reason: string;
};

// General Product Model
export type Product = {
  barcode: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  costPrice: number;
  minStock?: number;
  unit?: string;
  shelfLocation?: string;
  isActive?: boolean;
  history?: ProductAuditHistory[];
};

// Cart Item di POS Terminal
export type CartItem = Product & {
  qty: number;
  isReturn?: boolean;
  subtotal?: number;
  dpp?: number;
  taxAmount?: number;
};

// Park / Hold Order
export type HeldOrder = {
  id: string;
  time: string;
  cashierName?: string;
  items: CartItem[];
  totalQty?: number;
  totalAmount: number;
};

// FIFO Stock Batch
export type StockBatch = {
  id: string;
  barcode: string;
  purchaseCost: number;
  initialQty: number;
  remainingQty: number;
  receivedAt: string;
};

// Transaction Item & Record
export type TransactionItem = {
  barcode: string;
  name: string;
  qty: number;
  price: number;
  cost?: number;
  costPrice?: number;
  subtotal?: number;
  dpp?: number;
  taxAmount?: number;
  isReturn?: boolean;
};

export type TransactionRecord = {
  id: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  timestamp: string;
  cashierName: string;
  items: TransactionItem[];
  itemsSummary?: string;
  totalItems?: number;
  totalQty: number;
  subtotal?: number;
  taxPPN?: number;
  totalTax: number;
  totalDpp: number;
  grandTotal?: number;
  grossAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'EDC';
  amountPaid?: number;
  cashReceived?: number;
  change?: number;
  mdrRate?: number;
  mdrFee: number;
  netSettlement: number;
  totalCOGS?: number;
  totalCogs?: number;
  grossProfit: number;
};

// Stock Movement & Ledger
export type StockMovementType = 'IN' | 'OUT_SHRINKAGE' | 'OUT_DAMAGED' | 'OUT_LOST' | 'ADJUSTMENT';

export type StockMovement = {
  id: string;
  timestamp: string;
  barcode: string;
  productName: string;
  type: StockMovementType;
  qty?: number;
  quantity: number;
  purchaseCost?: number;
  costPerUnit?: number;
  totalCost?: number;
  reason?: string;
  note?: string;
  recordedBy?: string;
  createdBy?: string;
};

// Petty Cash Entry
export type PettyCashEntry = {
  id: string;
  timestamp: string;
  cashierName?: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
};
export type PettyCashRecord = PettyCashEntry;

// Shift Close
export type ShiftCloseRecord = {
  id: string;
  closedAt: string;
  cashierName: string;
  openingCash: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  status: 'EXACT' | 'OVER' | 'SHORT';
  notes: string;
};

// Audit Trail Action & Modules
export type AuditActionType =
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'ARCHIVE_PRODUCT'
  | 'RESTORE_PRODUCT'
  | 'STOCK_MUTATION'
  | 'SALE_COMPLETED'
  | 'VOID_ORDER'
  | 'EXCHANGE_REFUND'
  | 'PETTY_CASH_IN'
  | 'PETTY_CASH_OUT'
  | 'SHIFT_CLOSE'
  | 'CREATE_EMPLOYEE'
  | 'TOGGLE_EMPLOYEE'
  | 'CREATE_ROLE'
  | 'UPDATE_PERMISSIONS'
  | 'UPDATE_PAYMENT_CONFIG'
  | 'UPDATE_STORE_SETTINGS';

export type AuditModule =
  | 'AUTH'
  | 'POS'
  | 'POS_TERMINAL'
  | 'PRODUCTS'
  | 'STOCK'
  | 'INVENTORY'
  | 'FINANCE'
  | 'PETTY_CASH'
  | 'USERS_ROLES'
  | 'SETTINGS';

export type AuditLog = {
  id: string;
  timestamp: string;
  user?: string;
  actor?: string;
  role?: string;
  module: AuditModule;
  action: AuditActionType;
  details: string;
  status: 'APPROVED' | 'AUTO_RECORDED' | 'REJECTED';
};

// Permissions & RBAC
export type AppPermission =
  | 'access_dashboard'
  | 'manage_products'
  | 'edit_products'
  | 'manage_stock'
  | 'view_reports'
  | 'view_audit_trail'
  | 'manage_employees'
  | 'manage_settings'
  | 'access_pos'
  | 'void_transaction'
  | 'exchange_items'
  | 'manage_petty_cash';

export type CustomRole = {
  id: string;
  name: string;
  description: string;
  permissions: AppPermission[];
  isSystem?: boolean;
};

export type Employee = {
  id: string;
  username: string;
  name: string;
  pin: string;
  roleId: string;
  isActive: boolean;
};

export type PaymentMethod = 'CASH' | 'QRIS' | 'EDC';

// Payment Gateway Configuration
export type PaymentConfig = {
  cashEnabled: boolean;
  qrisEnabled: boolean;
  edcEnabled: boolean;
  isActiveQris?: boolean;
  isActiveEdc?: boolean;
  qrisMdrPercent?: number;
  edcMdrPercent?: number;
};

export type ActiveMenu =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'stock-ledger'
  | 'reports'
  | 'audit-trail'
  | 'users'
  | 'settings';

export type Language = 'id' | 'en';
