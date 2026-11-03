import { API_BASE_URL, apiFetch, getAuthHeaders } from '../../../services/api/client';

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

export async function toggleEmployeeStatusToApi(empId: string, actor?: string): Promise<any> {
  const res = await apiFetch(`${API_BASE_URL}/employees/${empId}/toggle-status?actor=${encodeURIComponent(actor || 'Owner')}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Gagal update status karyawan');
  return res.json();
}
