
function getCurrentActorName(): string {
  try {
    for (const key of ["pos_auth_user", "current_user", "auth_user", "user"]) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.name || parsed.username || parsed.fullName || parsed.user?.name;
        if (name) return name;
      }
    }
  } catch (e) {}
  return "Fadhil";
}

import { create } from 'zustand';
import type { Product } from '../types';
import { 
  getProductsServerSide, 
  getCategoriesFromApi,
  createProductToApi, 
  updateProductToApi, 
  toggleArchiveProductToApi 
} from '../utils/api';

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  backendError: string | null;

  // Metadata Server Pagination
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
  categoryFilter: string;
  statusFilter: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  setSorting: (column: string) => void;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilter: (key: 'page' | 'limit' | 'search' | 'categoryFilter' | 'statusFilter', value: any) => void;
  addProduct: (newProduct: Product, actorName?: string, onAudit?: (details: string) => void) => Promise<void>;
  updateProduct: (
    barcode: string,
    updatedFields: any,
    reason?: string,
    actorName?: string,
    onAudit?: (details: string) => void
  ) => Promise<void>;
  toggleArchiveProduct: (
    barcode: string,
    onAudit?: (action: 'ARCHIVE_PRODUCT' | 'RESTORE_PRODUCT', details: string) => void
  ) => Promise<void>;
  adjustStockLocal: (barcode: string, newStock: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  sortBy: "created_at",
  sortDir: "desc" as "asc" | "desc",
  setSorting: (column: string) => {
    const currentSort = get().sortBy;
    const currentDir = get().sortDir;
    const nextDir = currentSort === column && currentDir === "desc" ? "asc" : "desc";
    set({ sortBy: column, sortDir: nextDir });
    get().fetchProducts();
  },
  products: [],
  categories: [],
  isLoading: false,
  backendError: null,

  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  search: '',
  categoryFilter: 'ALL',
  statusFilter: "ACTIVE",
  sortOrder: "desc",

  setFilter: (key, value) => {
    set((state) => ({
      ...state,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {})
    }));
    get().fetchProducts();
  },

  fetchCategories: async () => {
    try {
      const cats = await getCategoriesFromApi();
      set({ categories: cats });
    } catch (e) {
      console.error(e);
    }
  },

  fetchProducts: async () => {
    if (get().isLoading) return;
    const { page, limit, search, categoryFilter, statusFilter } = get();
    set({ isLoading: true, backendError: null });

    try {
      const { page, limit, search, categoryFilter, statusFilter, sortBy, sortDir } = get();
      const res = await getProductsServerSide({
        page,
        limit,
        search,
        category: categoryFilter,
        status: statusFilter,
        order: `${sortBy || "created_at"} ${sortDir || "desc"}`
      });

            const rawList = Array.isArray(res?.data) ? res.data : [];
      const normalizedProducts = rawList.map((p: any) => ({
        ...p,
        costPrice: Number(p.costPrice ?? p.cost_price ?? 0),
        minStock: Number(p.minStock ?? p.min_stock ?? 5),
        shelfLocation: p.shelfLocation ?? p.shelf_location ?? "",
        isActive: p.isActive !== undefined ? p.isActive : (p.is_active !== undefined ? p.is_active : true)
      }));

      set({
        products: normalizedProducts,
        totalItems: res?.pagination?.total_items ?? normalizedProducts.length,
        totalPages: res?.pagination?.total_pages ?? 1,
        isLoading: false
      });
    } catch (err: any) {
      set({
        backendError: err.message || 'Gagal memuat produk dari server',
        isLoading: false,
        products: []
      });
    }
  },

  addProduct: async (newProduct, actorName = getCurrentActorName(), onAudit) => {
    await createProductToApi(newProduct);
    if (onAudit) {
      onAudit(`Menambahkan barang baru: "${newProduct.name}" (${newProduct.barcode})`);
    }
    await get().fetchProducts();
    await get().fetchCategories();
  },

  updateProduct: async (barcode, updatedFields, reason = "Update produk", actorName = getCurrentActorName(), onAudit) => {
    const rawCost = updatedFields.costPrice !== undefined ? updatedFields.costPrice : updatedFields.cost_price;
    const finalCost = isNaN(Number(rawCost)) ? 0 : Number(rawCost);
    const rawActive = updatedFields.isActive !== undefined ? updatedFields.isActive : (updatedFields.is_active !== undefined ? updatedFields.is_active : undefined);
    const payload = {
      ...updatedFields,
      cost_price: finalCost,
      costPrice: finalCost,
      ...(rawActive !== undefined ? { is_active: Boolean(rawActive), isActive: Boolean(rawActive) } : {}),
      actor: actorName
    };
    const res = await updateProductToApi(barcode, payload);
    // Update langsung state lokal agar posisi baris tidak bergeser
    set((state) => ({
      products: state.products.map((p) => p.barcode === barcode ? { ...p, ...payload, costPrice: finalCost } : p)
    }));
    await get().fetchProducts();
    await get().fetchCategories();
  },

  toggleArchiveProduct: async (
    barcode: string,
    onAudit?: (action: "ARCHIVE_PRODUCT" | "RESTORE_PRODUCT", details: string) => void
  ) => {
    const target = get().products.find(p => p.barcode === barcode);
    const currentlyActive = target ? target.isActive !== false : true;

    await toggleArchiveProductToApi(barcode);
    if (onAudit) {
      const action = currentlyActive ? 'ARCHIVE_PRODUCT' : 'RESTORE_PRODUCT';
      onAudit(action, `${currentlyActive ? 'Mengarsipkan' : 'Memulihkan'} barang (${barcode})`);
    }
    await get().fetchProducts();
  },

  adjustStockLocal: (barcode: string, newStock: number) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.barcode === barcode ? { ...p, stock: newStock } : p
      ),
    }));
  },
}));
