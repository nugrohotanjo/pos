const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export async function getProductsServerSide(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || '',
    category: params.category || 'ALL',
    status: params.status || 'ACTIVE'
  });

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Gagal mengambil data produk dari server');
  return res.json();
}

export async function getCategoriesFromApi(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) return [];
  const result = await res.json();
  return result.data || [];
}

export async function createProductToApi(product: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menyimpan produk');
  }
  return res.json();
}

export async function updateProductToApi(barcode: string, fields: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mengupdate produk');
  }
  return res.json();
}

export async function toggleArchiveProductToApi(barcode: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}/archive`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mengubah status arsip produk');
  }
  return res.json();
}

export async function getProductAuditLogsFromApi(barcode: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/products/${barcode}/audit-logs`);
  if (!res.ok) throw new Error('Gagal mengambil data riwayat audit produk');
  const result = await res.json();
  return result.data || [];
}

// Fallback compatibility
export async function getProductsFromApi(): Promise<any[]> {
  const res = await getProductsServerSide({ page: 1, limit: 100 });
  return res.data || [];
}
