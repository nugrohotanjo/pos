import { API_BASE_URL, apiFetch, encryptLoginPayload } from '../../../services/api/client';

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

export async function logoutWithApi(): Promise<void> {
  try {
    await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {}
}
