import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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

export const deleteBrandToApi = async (id: number | string): Promise<boolean> => {
  const res = await apiFetch(`${API_BASE_URL}/brands/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
};
