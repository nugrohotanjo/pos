export type Product = {
  barcode: string;
  name: string;
  category: string;
  stock: number;
  price?: number;
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
  paymentMethod: PaymentMethod;
  itemsSummary: string;
};

export type AuditActionType = 
  | 'VOID_ORDER' 
  | 'EXCHANGE_REFUND' 
  | 'STOCK_OVERRIDE' 
  | 'PETTY_CASH_OUT' 
  | 'SHIFT_CLOSE'
  | 'PAYMENT_CONFIG_UPDATE';

export type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditActionType;
  details: string;
  status: 'APPROVED' | 'REJECTED';
};

export type EmployeeRole = 'OWNER' | 'SUPERVISOR' | 'CASHIER';

export type Employee = {
  id: string;
  name: string;
  username: string;
  role: EmployeeRole;
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

export type ActiveMenu = 'dashboard' | 'products' | 'stock-ledger' | 'reports' | 'users' | 'settings' | 'pos';