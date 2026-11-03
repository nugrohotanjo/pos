import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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
