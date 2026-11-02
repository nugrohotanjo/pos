export type ActiveMenu = | 'dashboard' 
  | 'pos' 
  | 'products' 
  | 'stock-ledger' 
  | 'reports' 
  | 'audit-trail' 
  | 'users' 
  | 'settings' | "categories";

export type AppPermission = 
  | 'access_dashboard'
  | 'manage_products'
  | 'edit_products'
  | 'manage_stock'
  | 'view_reports'
  | 'view_audit_trail'
  | 'manage_employees'
  | 'manage_settings'
  | 'pos_access'
  | 'access_pos'
  | 'void_transaction'
  | 'exchange_items'
  | 'manage_petty_cash';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: AppPermission[];
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  pin: string;
  roleId: string;
  phone?: string;
  isActive: boolean;
}

export interface Product {
  barcode: string;
  name: string;
  category: string;
  category_id?: number;
  brand?: string;
  brand_id?: number;
  brandId?: number;
  dimension?: string;
  origin?: string;
  warranty_period?: string;
  warrantyPeriod?: string;
  warranty_type?: string;
  warrantyType?: string;
  is_custom?: boolean;
  isCustom?: boolean;
  cert_number?: string;
  certNumber?: string;

  categoryId?: number;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  minStock: number;
  shelfLocation?: string;
  isActive?: boolean;
}

export type StockMovementType = 
  | 'IN' 
  | 'OUT' 
  | 'ADJUSTMENT' 
  | 'RETURN' 
  | 'OUT_DAMAGED' 
  | 'OUT_LOST';

export interface StockMovement {
  id: string;
  timestamp: string;
  barcode: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  purchaseCost?: number;
  reason: string;
  recordedBy: string;
}

export interface StockBatch {
  id: string;
  barcode: string;
  purchaseCost: number;
  initialQty: number;
  remainingQty: number;
  receivedAt: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'EDC';

export interface CartItem extends Product {
  qty: number;
  isReturn?: boolean;
}

export interface TransactionItem {
  barcode: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
  subtotal?: number;
  dpp: number;
  taxAmount: number;
  isReturn?: boolean;
}

export interface TransactionRecord {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  totalQty: number;
  grossAmount: number;
  totalDpp: number;
  totalTax: number;
  totalCogs: number;
  grossProfit: number;
  mdrRate: number;
  mdrFee: number;
  netSettlement: number;
  cashReceived: number;
  change: number;
  paymentMethod: PaymentMethod;
  itemsSummary: string;
  items: TransactionItem[];
}

export interface AuditLog {
  old_values?: string;
  new_values?: string;
  id: string;
  timestamp: string;
  actor: string;
  user?: string;
  module: 'PRODUCTS' | 'INVENTORY' | 'POS_TERMINAL' | 'SETTINGS' | 'USERS_ROLES' | 'PETTY_CASH';
  action: string;
  details: string;
  status: 'AUTO_RECORDED' | 'APPROVED' | 'REJECTED';
}

export interface PettyCashEntry {
  id: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  recordedBy?: string;
  cashierName?: string;
}

export interface PaymentConfig {
  cashEnabled: boolean;
  qrisEnabled: boolean;
  edcEnabled: boolean;
}

export interface HeldOrder {
  totalAmount?: number;
  id: string;
  timestamp?: string;
  time?: string;
  label?: string;
  items: CartItem[];
  total?: number;
}


export interface Brand {
  id: number;
  name: string;
}
