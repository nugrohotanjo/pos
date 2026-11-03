
const AUTH_PAYLOAD_SECRET = "POS_AUTH_SECRET_NONCE_HANDSHAKE_2026";

function encryptLoginPayload(username: string, pin: string): string {
  const payloadObj = {
    username: username.trim(),
    pin: pin.trim(),
    ts: Math.floor(Date.now() / 1000),
    nonce: Math.random().toString(36).substring(2, 10),
  };

  const jsonStr = JSON.stringify(payloadObj);
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(jsonStr);
  const keyBytes = encoder.encode(AUTH_PAYLOAD_SECRET);

  const xored = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    xored[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  let binary = "";
  for (let i = 0; i < xored.length; i++) {
    binary += String.fromCharCode(xored[i]);
  }
  return btoa(binary);
}

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

// Centralized Best-Practice Fetch Client (OWASP Compliant)
// 1. Otomatis menyertakan HttpOnly Cookie via credentials: 'include'
// 2. Interceptor terpusat untuk menangani 401 (Session Expired/Revoked)
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (init.body && !(init.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...init,
    credentials: 'include', // Kunci keamanan: Cookie HttpOnly selalu dikirim
    headers: {
      ...defaultHeaders,
      ...init.headers,
    },
  };

  const response = await window.fetch(input, config);

  // Auto-handling session expiry / token invalidation
  if (response.status === 401) {
    const isLoginEndpoint = typeof input === 'string' && input.includes('/auth/login');
    if (!isLoginEndpoint) {
      // Bersihkan state login jika ada di storage
      localStorage.removeItem('current_employee');
      localStorage.removeItem('current_role');
      // Trigger event atau redirect jika sesi mati
      window.dispatchEvent(new CustomEvent('pos:session-expired'));
    }
  }

  return response;
}


export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;

  order?: string;
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

  const res = await apiFetch(`${API_BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Gagal mengambil data produk dari server');
  return res.json();
}

export async function getCategoriesFromApi(): Promise<any[]> {
  const res = await apiFetch(`${API_BASE_URL}/categories?all=true`);
  if (!res.ok) return [];
  const result = await res.json();
  const list = result.data || [];
  return list.map((item: any) => (typeof item === "object" ? item.name : item));
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

  const res = await apiFetch(`${API_BASE_URL}/audit-logs?${query.toString()}`);
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

export async function getSettingsFromApi(forceRefresh = false): Promise<StoreSettings> {
  const CACHE_KEY = 'pos_settings_cache';
  if (!forceRefresh) {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
  }

  const res = await apiFetch(`${API_BASE_URL}/settings`);
  if (!res.ok) throw new Error('Gagal mengambil pengaturan');
  const json = await res.json();
  const data = json.data || json;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {}
  return data;
}

export async function updateSettingsToApi(data: Partial<StoreSettings> & { actor?: string }): Promise<StoreSettings> {
  const res = await apiFetch(`${API_BASE_URL}/settings`, {
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
  try {
    const res = await apiFetch(`${API_BASE_URL}/roles`);
    if (!res.ok) {
      console.error('getRolesFromApi failed with status:', res.status);
      return [];
    }
    const json = await res.json();
    const rawData = json?.roles !== undefined ? json.roles : (json?.data !== undefined ? json.data : json);
    const rawList = Array.isArray(rawData) ? rawData : [];

    return rawList.map((r: any) => {
      let perms: string[] = [];
      if (Array.isArray(r.permissions)) {
        perms = r.permissions;
      } else if (typeof r.permissions === 'string') {
        try {
          perms = JSON.parse(r.permissions);
        } catch {
          perms = r.permissions.replace(/[{}]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return {
        id: r.id,
        name: r.name,
        description: r.description || '',
        permissions: perms,
        isCustom: r.is_custom !== undefined ? r.is_custom : (r.isCustom || false),
      };
    });
  } catch (err) {
    console.error('Error in getRolesFromApi:', err);
    return [];
  }
}

export async function createRoleToApi(data: { name: string; description: string; permissions: string[]; actor?: string }): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/roles`, {
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
  const res = await apiFetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
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
  try {
    const res = await apiFetch(`${API_BASE_URL}/employees`);
    if (!res.ok) {
      console.error('getEmployeesFromApi failed with status:', res.status);
      return [];
    }
    const json = await res.json();
    const rawData = json?.employees !== undefined ? json.employees : (json?.data !== undefined ? json.data : json);
    const rawList = Array.isArray(rawData) ? rawData : [];

    return rawList.map((e: any) => ({
      id: e.id,
      name: e.name,
      username: e.username,
      pin: e.pin,
      roleId: e.role_id || e.roleId,
      phone: e.phone || '',
      isActive: e.is_active !== undefined ? e.is_active : (e.isActive !== undefined ? e.isActive : true),
    }));
  } catch (err) {
    console.error('Error in getEmployeesFromApi:', err);
    return [];
  }
}

export async function createEmployeeToApi(data: { name: string; username: string; pin: string; role_id: string; phone?: string; actor?: string }): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/employees`, {
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
  const res = await apiFetch(`${API_BASE_URL}/employees/${empId}/toggle-status?actor=${encodeURIComponent(actor || 'Owner')}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Gagal update status karyawan');
  return res.json();
}

export async function loginWithApi(username: string, pin: string): Promise<any> {
  const encryptedPayload = encryptLoginPayload(username, pin);

  const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      encrypted_payload: encryptedPayload,
    }),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login gagal');
  }

  return await res.json();
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
  const res = await apiFetch(`${API_BASE_URL}/employees/${empId}`, {
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
  const res = await apiFetch(`${API_BASE_URL}/roles/${roleId}`, {
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
  const res = await apiFetch(`${API_BASE_URL}/audit-logs`);
  if (!res.ok) {
    throw new Error('Gagal mengambil data audit logs');
  }
  const json = await res.json();
  return json.data || [];
}


// --- Master Categories API Client ---
export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_id?: number | null;
  parent?: CategoryItem | null;
  children?: CategoryItem[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getCategoriesServerSide(params: { page?: number;
  limit?: number;
  search?: string;
  status?: string;
  all?: boolean; order?: string }) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.all) query.set("all", "true");

  const res = await apiFetch(`${API_BASE_URL}/categories?${query.toString()}`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memuat kategori (${res.status}): ${errText}`);
  }
  if (params.order) query.append("order", params.order);
  return res.json();
}

export async function createCategoryToApi(data: { name: string; description?: string; actor?: string }) {
  const headers: Record<string, string> = {
    ...(getAuthHeaders() as Record<string, string>),
    "Content-Type": "application/json",
  };
  if (data.actor) {
    headers["X-User-Name"] = data.actor;
  }

  const res = await apiFetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const resText = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(resText);
  } catch (e) {
    if (!res.ok) throw new Error(`Server error (${res.status}): ${resText.slice(0, 100)}`);
    return { success: true };
  }

  if (!res.ok) {
    throw new Error(json.error || json.message || `Server error (${res.status})`);
  }
  return json;
}

export async function updateCategoryToApi(
  id: number,
  data: { name: string; description?: string; is_active?: boolean; actor?: string }
) {
  const headers: Record<string, string> = {
    ...(getAuthHeaders() as Record<string, string>),
    "Content-Type": "application/json",
  };
  if (data.actor) {
    headers["X-User-Name"] = data.actor;
  }

  const res = await apiFetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  const resText = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(resText);
  } catch (e) {
    if (!res.ok) throw new Error(`Server error (${res.status}): ${resText.slice(0, 100)}`);
    return { success: true };
  }

  if (!res.ok) {
    throw new Error(json.error || json.message || `Server error (${res.status})`);
  }
  return json;
}

export async function deleteCategoryToApi(id: number, actor?: string) {
  const headers: Record<string, string> = {
    ...(getAuthHeaders() as Record<string, string>),
  };
  if (actor) {
    headers["X-User-Name"] = actor;
  }

  const query = actor ? `?actor=${encodeURIComponent(actor)}` : "";
  const res = await apiFetch(`${API_BASE_URL}/categories/${id}${query}`, {
    method: "DELETE",
    headers,
  });

  const resText = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(resText);
  } catch (e) {
    if (!res.ok) throw new Error(`Server error (${res.status}): ${resText.slice(0, 100)}`);
    return { success: true };
  }

  if (!res.ok) {
    throw new Error(json.error || json.message || `Server error (${res.status})`);
  }
  return json;
}

export const getBrandsFromApi = async () => {
  const res = await apiFetch(`${API_BASE_URL}/brands`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil daftar brand");
  const json = await res.json();
  return json.data || [];
};

export const createBrandToApi = async (name: string) => {
  const res = await apiFetch(`${API_BASE_URL}/brands`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Gagal membuat brand baru");
  const json = await res.json();
  return json.data;
};



// Memeriksa validitas sesi aktif via HttpOnly Cookie (JWT)
export async function checkSessionFromApi(): Promise<{ employee: any; role: any }> {
  const res = await apiFetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Sesi kedaluwarsa atau tidak valid');
  }
  const json = await res.json();
  return {
    employee: json.employee,
    role: json.role,
  };
}

// Menghapus HttpOnly Cookie di server
export async function logoutWithApi(): Promise<void> {
  try {
    await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {}
}

// --- Master Brands & Shelves API Client ---
export const deleteBrandToApi = async (id: number | string): Promise<boolean> => {
  const res = await apiFetch(`${API_BASE_URL}/brands/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
};

export const getShelvesFromApi = async (): Promise<any[]> => {
  const res = await apiFetch(`${API_BASE_URL}/shelves`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
};

export const createShelfToApi = async (name: string): Promise<any | null> => {
  const res = await apiFetch(`${API_BASE_URL}/shelves`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
};

export const deleteShelfToApi = async (id: number | string): Promise<boolean> => {
  const res = await apiFetch(`${API_BASE_URL}/shelves/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
};
