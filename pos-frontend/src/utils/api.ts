// Re-export Facade (Zero-Breakage Backward Compatibility)
// File ini menjaga agar komponen lama tidak rusak saat arsitektur beralih ke Domain-Driven API.

export * from '../services/api/client';
export * from '../services/api/types';
export * from '../features/products/api/productsApi';
export * from '../features/products/api/brandsApi';
export * from '../features/products/api/shelvesApi';
export * from '../features/categories/api/categoriesApi';
export * from '../features/roles/api/rolesApi';
export * from '../features/employees/api/employeesApi';
export * from '../features/auth/api/authApi';
export * from '../features/settings/api/settingsApi';
export * from '../features/audit-logs/api/auditLogsApi';
