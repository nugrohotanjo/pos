import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';
import type { PaginationParams, PaginatedResponse } from '../../../services/api/types';

export async function getProductsServerSide(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || '',
    category: params.category || 'ALL',
    status: params.status || 'ACTIVE'
  });

  const res = await apiFetch(`${API_BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Gagal mengambil data produk dari server');
  return res.json();
}

export async function getProductsFromApi(): Promise<any[]> {
  const res = await getProductsServerSide({ page: 1, limit: 500 });
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray((res.data as any).items)) return (res.data as any).items;
  if (res.data && Array.isArray((res.data as any).products)) return (res.data as any).products;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).products)) return (res as any).products;
  return [];
}

export async function createProductToApi(product: any): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menyimpan produk');
  }
  return res.json();
}

export async function updateProductToApi(barcode: string, fields: any): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/products/${barcode}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mengupdate produk');
  }
  return res.json();
}

export async function toggleArchiveProductToApi(barcode: string): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/products/${barcode}/archive`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mengubah status arsip produk');
  }
  return res.json();
}

export async function getProductAuditLogsFromApi(barcode: string): Promise<any[]> {
  const res = await apiFetch(`${API_BASE_URL}/products/${barcode}/audit-logs`);
  if (!res.ok) throw new Error('Gagal mengambil data riwayat audit produk');
  const result = await res.json();
  return result.data || [];
}
