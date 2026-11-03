import { API_BASE_URL, apiFetch } from '../../../services/api/client';
import type { PaginatedResponse } from '../../../services/api/types';

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

export async function getAuditLogsFromApi(): Promise<any[]> {
  const res = await apiFetch(`${API_BASE_URL}/audit-logs`);
  if (!res.ok) {
    throw new Error('Gagal mengambil data audit logs');
  }
  const json = await res.json();
  return json.data || [];
}
