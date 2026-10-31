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

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilter: (key: 'page' | 'limit' | 'search' | 'categoryFilter' | 'statusFilter', value: any) => void;
  addProduct: (newProduct: Product, actorName: string, onAudit?: (details: string) => void) => Promise<void>;
  updateProduct: (
    barcode: string,
    updatedFields: any,
    reason: string,
    actorName: string,
    onAudit?: (details: string) => void
  ) => Promise<void>;
  toggleArchiveProduct: (
    barcode: string,
    onAudit?: (action: 'ARCHIVE_PRODUCT' | 'RESTORE_PRODUCT', details: string) => void
  ) => Promise<void>;
  adjustStockLocal: (barcode: string, newStock: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
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
  statusFilter: 'ACTIVE',

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
    const { page, limit, search, categoryFilter, statusFilter } = get();
    set({ isLoading: true, backendError: null });

    try {
      const res = await getProductsServerSide({
        page,
        limit,
        search,
        category: categoryFilter,
        status: statusFilter
      });

      set({
        products: res.data || [],
        totalItems: res.pagination.total_items,
        totalPages: res.pagination.total_pages,
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

  addProduct: async (newProduct, actorName, onAudit) => {
    await createProductToApi(newProduct);
    if (onAudit) {
      onAudit(`Menambahkan barang baru: "${newProduct.name}" (${newProduct.barcode})`);
    }
    await get().fetchProducts();
    await get().fetchCategories();
  },

  updateProduct: async (barcode, updatedFields, reason, actorName, onAudit) => {
    await updateProductToApi(barcode, updatedFields);
    if (onAudit) {
      onAudit(`Koreksi data barang (${barcode}): Alasan - ${reason}`);
    }
    await get().fetchProducts();
    await get().fetchCategories();
  },

  toggleArchiveProduct: async (barcode, onAudit) => {
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
