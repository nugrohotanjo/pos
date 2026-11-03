import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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
