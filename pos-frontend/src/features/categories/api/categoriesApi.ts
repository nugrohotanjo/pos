import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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

export async function getCategoriesFromApi(): Promise<any[]> {
  const res = await apiFetch(`${API_BASE_URL}/categories?all=true`);
  if (!res.ok) return [];
  const result = await res.json();
  const list = result.data || [];
  return list.map((item: any) => (typeof item === "object" ? item.name : item));
}

export async function getCategoriesServerSide(params: { 
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  all?: boolean; 
  order?: string;
}) {
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
    headers["X-User-Name"] = dataActorHeader(actor);
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

function dataActorHeader(actor?: string) {
  return actor || '';
}
