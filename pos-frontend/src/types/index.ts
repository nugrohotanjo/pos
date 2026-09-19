export type Product = {
  barcode: string;
  name: string;
  category: string;
  stock: number;
  price?: number;
  isActive?: boolean; // Soft delete flag
};

export type CartItem = Product & {
  qty: number;
  isReturn?: boolean;
};

export type HeldOrder = {
  id: string;
  time: string;
  items: CartItem[];
  totalAmount: number;
};

export type StockMovementType = 'IN' | 'OUT_DAMAGED' | 'OUT_LOST' | 'AUDIT_ADJUSTMENT' | 'CUSTOMER_RETURN';

export type StockMovement = {
  id: string;
  timestamp: string;
  barcode: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  recordedBy: string;
};

export type PaymentMethod = 'CASH' | 'QRIS' | 'EDC';

export type PaymentConfig = {
  cashEnabled: boolean;
  qrisEnabled: boolean;
  edcEnabled: boolean;
};

export type TransactionItemSnapshot = {
  barcode: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  isReturn?: boolean;
};

export type TransactionRecord = {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  totalQty: number;
  grossAmount: number;
  mdrRate: number;
  mdrFee: number;
  netSettlement: number;
  cashReceived?: number;
  change?: number;
  paymentMethod: PaymentMethod;
  itemsSummary: string;
  items: TransactionItemSnapshot[];
};

export type AuditModule = 
  | 'PRODUCTS' 
  | 'INVENTORY' 
  | 'POS_TERMINAL' 
  | 'PETTY_CASH' 
  | 'USERS_ROLES' 
  | 'SETTINGS';

export type AuditActionType = 
  | 'CREATE_PRODUCT'
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
  | 'UPDATE_PAYMENT_CONFIG';

export type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  module: AuditModule;
  action: AuditActionType;
  details: string;
  status: 'APPROVED' | 'AUTO_RECORDED' | 'REJECTED';
};

export type AppPermission = 
  | 'access_pos'
  | 'void_transaction'
  | 'exchange_items'
  | 'manage_petty_cash'
  | 'view_reports'
  | 'view_audit_trail'
  | 'manage_stock'
  | 'manage_products'
  | 'manage_employees'
  | 'manage_settings';

export type CustomRole = {
  id: string;
  name: string;
  description: string;
  permissions: AppPermission[];
};

export type Employee = {
  id: string;
  name: string;
  username: string;
  roleId: string;
  pin: string;
  isActive: boolean;
};

export type PettyCashEntry = {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  timestamp: string;
  cashierName: string;
};

export type ActiveMenu = 
  | 'dashboard' 
  | 'products' 
  | 'stock-ledger' 
  | 'reports' 
  | 'audit-trail' 
  | 'users' 
  | 'settings' 
  | 'pos';