import type { Product } from '../types';

export const FIXED_PRICE = 35000;

export const INITIAL_PRODUCTS: Product[] = [
  { barcode: '89912345', name: 'Kaos Polos Cotton Combed 30s', category: 'Pakaian', stock: 150, price: 35000, costPrice: 20000, minStock: 10, unit: 'Pcs' },
  { barcode: '89954321', name: 'Set Alat Makan Stainless', category: 'Perabotan', stock: 42, price: 35000, costPrice: 20000, minStock: 5, unit: 'Set' },
  { barcode: '89998765', name: 'Mainan Mobil Diecast 1:64', category: 'Mainan', stock: 8, price: 35000, costPrice: 20000, minStock: 5, unit: 'Pcs' },
  { barcode: '89911223', name: 'Lampu Meja Belajar LED', category: 'Perabotan', stock: 25, price: 35000, costPrice: 20000, minStock: 5, unit: 'Pcs' },
];

export const INITIAL_STOCK_BATCHES = [
  { id: 'BATCH-001', barcode: '89912345', purchaseCost: 20000, initialQty: 150, remainingQty: 150, receivedAt: '01/10/2026' },
  { id: 'BATCH-002', barcode: '89954321', purchaseCost: 20000, initialQty: 42, remainingQty: 42, receivedAt: '02/10/2026' },
  { id: 'BATCH-003', barcode: '89998765', purchaseCost: 20000, initialQty: 8, remainingQty: 8, receivedAt: '03/10/2026' },
  { id: 'BATCH-004', barcode: '89911223', purchaseCost: 20000, initialQty: 25, remainingQty: 25, receivedAt: '04/10/2026' },
];

export const INITIAL_TRANSACTIONS: any[] = [];
export const INITIAL_AUDIT_LOGS: any[] = [];
