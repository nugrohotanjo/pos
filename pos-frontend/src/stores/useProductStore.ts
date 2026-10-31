import { create } from 'zustand';
import type { Product, ProductAuditHistory } from '../types';
import { 
  getProductsFromApi, 
  createProductToApi, 
  updateProductToApi, 
  toggleArchiveProductToApi 
} from '../utils/api';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  backendError: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (
    newProduct: Product, 
    actorName: string, 
    onAudit?: (details: string) => void
  ) => Promise<void>;
  updateProduct: (
    barcode: string,
    updatedFields: { 
      name: string; 
      category: string; 
      stock: number; 
      price: number; 
      costPrice: number;
      unit?: string;
      minStock?: number;
      shelfLocation?: string;
    },
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
  isLoading: true,
  backendError: null,

  fetchProducts: async () => {
    set({ isLoading: true, backendError: null });
    try {
      const data = await getProductsFromApi();
      set({ products: data, isLoading: false });
    } catch (err: any) {
      console.error('Gagal fetch produk:', err);
      set({ 
        backendError: 'Gagal terhubung ke server backend (http://localhost:8000). Pastikan server Go & Database PostgreSQL sedang berjalan.',
        products: [],
        isLoading: false 
      });
    }
  },

  addProduct: async (newProduct, actorName, onAudit) => {
    // 1. Simpan ke database via backend Go
    await createProductToApi(newProduct);

    // 2. Update state lokal di store
    set((state) => ({
      products: [{ ...newProduct, isActive: true, history: [] }, ...state.products]
    }));

    if (onAudit) {
      onAudit(`Menambahkan barang baru: "${newProduct.name}" (${newProduct.barcode})`);
    }
  },

  updateProduct: async (barcode, updatedFields, reason, actorName, onAudit) => {
    const target = get().products.find((p) => p.barcode === barcode);
    if (!target) return;

    // 1. Kirim update ke backend Go
    await updateProductToApi(barcode, updatedFields);

    // 2. Susun entri audit histori lokal
    const timestamp = new Date().toLocaleString('id-ID');
    const historyEntry: ProductAuditHistory = {
      id: `HIST-${Date.now().toString().slice(-4)}`,
      timestamp,
      updatedBy: actorName,
      oldValues: {
        name: target.name,
        category: target.category,
        stock: target.stock,
        price: target.price,
        costPrice: target.costPrice,
        unit: target.unit,
        minStock: target.minStock,
        shelfLocation: target.shelfLocation,
      },
      newValues: {
        ...updatedFields,
      },
      reason,
    };

    // 3. Update state di store
    set((state) => ({
      products: state.products.map((p) => {
        if (p.barcode === barcode) {
          return {
            ...p,
            ...updatedFields,
            history: [historyEntry, ...(p.history || [])],
          };
        }
        return p;
      }),
    }));

    if (onAudit) {
      onAudit(`Koreksi data barang "${target.name}" (${barcode}): Alasan - ${reason}`);
    }
  },

  toggleArchiveProduct: async (barcode, onAudit) => {
    const target = get().products.find((p) => p.barcode === barcode);
    if (!target) return;
    const currentlyActive = target.isActive !== false;

    // 1. Kirim patch toggle status ke backend
    await toggleArchiveProductToApi(barcode);

    // 2. Update status aktif di store
    set((state) => ({
      products: state.products.map((p) =>
        p.barcode === barcode ? { ...p, isActive: !currentlyActive } : p
      ),
    }));

    if (onAudit) {
      const action = currentlyActive ? 'ARCHIVE_PRODUCT' : 'RESTORE_PRODUCT';
      const text = `${currentlyActive ? 'Mengarsipkan' : 'Memulihkan'} barang: "${target.name}" (${barcode})`;
      onAudit(action, text);
    }
  },

  adjustStockLocal: (barcode, newStock) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.barcode === barcode ? { ...p, stock: newStock } : p
      ),
    }));
  },
}));
