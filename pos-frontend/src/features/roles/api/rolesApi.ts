import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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
