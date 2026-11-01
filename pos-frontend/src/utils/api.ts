
export function getAuthHeaders(): HeadersInit {
  let userName = "";
  try {
    const raw = localStorage.getItem("pos_auth_user") || localStorage.getItem("current_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      userName = parsed.name || parsed.username || "";
    }
  } catch (e) {}

  return {
    "Content-Type": "application/json",
    ...(userName ? { "X-User-Name": userName } : {}),
  };
}

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
  const res = await fetch(`${API_BASE_URL}/products/${barcode}`, {
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
  const res = await getProductsServerSide({ page: 1, limit: 500 });
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray((res.data as any).items)) return (res.data as any).items;
  if (res.data && Array.isArray((res.data as any).products)) return (res.data as any).products;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).products)) return (res as any).products;
  return [];
}

export interface AuditLogPaginationParams {
  page: number;
  limit: number;
  search?: string;
  module?: string;
  start_date?: string;
  end_date?: string;
}

export async function getAuditLogsServerSide(params: AuditLogPaginationParams): Promise<PaginatedResponse<any>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || "",
    module: params.module || "ALL",
  });
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);

  const res = await fetch(`${API_BASE_URL}/audit-logs?${query.toString()}`);
  if (!res.ok) throw new Error("Gagal memuat log audit dari server");
  return res.json();
}

export interface StoreSettings {
  id: number;
  app_name: string;
  store_address: string;
  store_phone: string;
  receipt_footer: string;
  cash_enabled: boolean;
  qris_enabled: boolean;
  edc_enabled: boolean;
  updated_at?: string;
}

export async function getSettingsFromApi(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`);
  if (!res.ok) throw new Error('Gagal mengambil pengaturan toko');
  const result = await res.json();
  return result.data;
}

export async function updateSettingsToApi(data: Partial<StoreSettings> & { actor?: string }): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menyimpan pengaturan toko');
  }
  const result = await res.json();
  return result.data;
}

export async function getRolesFromApi(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/roles`);
  if (!res.ok) return [];
  const result = await res.json();
  return (result.data || []).map((r: any) => ({
    ...r,
    permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
  }));
}

export async function createRoleToApi(data: { name: string; description: string; permissions: string[]; actor?: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal membuat role');
  }
  const result = await res.json();
  return {
    ...result.data,
    permissions: typeof result.data.permissions === 'string' ? JSON.parse(result.data.permissions) : result.data.permissions,
  };
}

export async function updateRolePermissionsToApi(roleId: string, permissions: string[], actor?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ permissions, actor }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal update permissions');
  }
  return res.json();
}

export async function getEmployeesFromApi(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/employees`);
  if (!res.ok) return [];
  const result = await res.json();
  return (result.data || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    username: e.username,
    pin: e.pin,
    roleId: e.role_id,
    phone: e.phone,
    isActive: e.is_active,
  }));
}

export async function createEmployeeToApi(data: { name: string; username: string; pin: string; role_id: string; phone?: string; actor?: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mendaftarkan karyawan');
  }
  return res.json();
}

export async function toggleEmployeeStatusToApi(empId: string, actor?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/employees/${empId}/toggle-status?actor=${encodeURIComponent(actor || 'Owner')}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Gagal update status karyawan');
  return res.json();
}

export async function loginWithApi(username: string, pin: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, pin }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login gagal');
  }
  return res.json();
}

export async function updateEmployeeToApi(
  empId: string,
  data: {
    name: string;
    username: string;
    pin?: string;
    role_id: string;
    phone?: string;
    actor?: string;
    actor_role?: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/employees/${empId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal memperbarui data staf');
  }
  return res.json();
}

export async function updateRoleToApi(
  roleId: string,
  data: {
    name: string;
    description: string;
    actor?: string;
    actor_role?: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mengubah data role');
  }
  return res.json();
}

export async function getAuditLogsFromApi(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/audit-logs`);
  if (!res.ok) {
    throw new Error('Gagal mengambil data audit logs');
  }
  const json = await res.json();
  return json.data || [];
}
