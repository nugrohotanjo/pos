import type { 
  CustomRole, 
  Employee, 
  StockBatch, 
  TransactionRecord, 
  AuditLog, 
  PettyCashEntry 
} from '../types';

export const INITIAL_ROLES: CustomRole[] = [
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

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Fadhil', username: 'fadhil', roleId: 'role-owner', pin: '9999', isActive: true },
  { id: 'EMP-002', name: 'Agus Supervisor', username: 'agus', roleId: 'role-supervisor', pin: '1234', isActive: true },
  { id: 'EMP-003', name: 'Budi Santoso', username: 'budi', roleId: 'role-cashier', pin: '1111', isActive: true },
];

export const INITIAL_STOCK_BATCHES: StockBatch[] = [
  { id: 'BATCH-01', barcode: '8991001', purchaseCost: 18000, initialQty: 50, remainingQty: 50, receivedAt: '2026-09-01' },
  { id: 'BATCH-02', barcode: '8991002', purchaseCost: 21000, initialQty: 30, remainingQty: 30, receivedAt: '2026-09-02' },
  { id: 'BATCH-03', barcode: '8991003', purchaseCost: 19500, initialQty: 40, remainingQty: 40, receivedAt: '2026-09-03' },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
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

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-1001',
    timestamp: '2026-09-20 09:30:12',
    actor: 'Agus (Supervisor)',
    user: 'Agus (Supervisor)',
    module: 'POS_TERMINAL',
    action: 'VOID_ORDER',
    details: 'Membatalkan seluruh belanja keranjang (3 item) karena dompet pelanggan tertinggal',
    status: 'APPROVED',
  }
];

export const INITIAL_PETTY_CASH: PettyCashEntry[] = [
  {
    id: 'PETTY-001',
    type: 'OUT',
    amount: 15000,
    reason: 'Beli kantong plastik kresek 2 pack',
    timestamp: '2026-09-20 08:30',
    cashierName: 'Budi Santoso'
  }
];
