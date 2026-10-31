import type { Product } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function getProductsFromApi(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error('Gagal mengambil data produk dari server');
  const result = await res.json();
  
  return (result.data || []).map((item: any) => ({
    barcode: item.barcode,
    name: item.name,
    category: item.category,
    stock: item.stock || 0,
    price: item.price || 0,
    costPrice: item.cost_price || 0,
    minStock: item.min_stock || 5,
    unit: item.unit || 'Pcs',
    shelfLocation: item.shelf_location || '',
    isActive: item.is_active !== undefined ? item.is_active : true,
    history: []
  }));
}

export async function createProductToApi(product: Product): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barcode: product.barcode,
      name: product.name,
      category: product.category,
      price: Number(product.price || 35000),
      cost_price: Number(product.costPrice || 20000),
      stock: Number(product.stock || 0),
      min_stock: Number(product.minStock || 5),
      unit: product.unit || 'Pcs',
      shelf_location: product.shelfLocation || '',
      original_price: Number(product.price || 35000),
      tag: 'General Retail',
      stock_note: product.shelfLocation ? `Lokasi: ${product.shelfLocation}` : 'Tersedia di rak'
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal menyimpan produk ke database');
  }
}

export async function updateProductToApi(
  barcode: string,
  data: { 
    name: string; 
    category: string; 
    stock: number; 
    price?: number; 
    costPrice?: number;
    unit?: string;
    minStock?: number;
    shelfLocation?: string;
  }
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barcode,
      name: data.name,
      category: data.category,
      stock: Number(data.stock),
      price: Number(data.price || 35000),
      cost_price: Number(data.costPrice || 20000),
      min_stock: Number(data.minStock || 5),
      unit: data.unit || 'Pcs',
      shelf_location: data.shelfLocation || ''
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal memperbarui produk di database');
  }
}

export async function toggleArchiveProductToApi(barcode: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}/toggle-archive`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal mengubah status arsip produk');
  }
}

export async function getProductAuditLogsFromApi(barcode: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}/audit-logs`);
  if (!res.ok) throw new Error('Gagal mengambil data riwayat audit produk');
  const result = await res.json();
  return result.data || [];
}
