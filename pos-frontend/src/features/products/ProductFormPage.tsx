import { SearchableSelectWithManage, type OptionItem } from '../../components/SearchableSelectWithManage';
import React, { useState, useEffect, useRef } from 'react';
import type { Product, Brand } from '../../types';
import { CategoryCascadeModal } from '../../components/CategoryCascadeModal';
import { CustomSelect } from "../../components/CustomSelect";
import { ProductVariationSection, type VariantTypeState, type VariantItemState } from './components/ProductVariationSection';
import { ProductWholesaleSection, type WholesalePriceState } from './components/ProductWholesaleSection';
import { FieldTooltip } from '../../components/common/FieldTooltip';
import { getBrandsFromApi, createBrandToApi, deleteBrandToApi, getShelvesFromApi, createShelfToApi, deleteShelfToApi } from '../../utils/api';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Barcode,
  Layers,
  AlertCircle,
  ChevronDown,
  Plus,
  Check,
  X,
  Search,
} from 'lucide-react';

interface ProductFormPageProps {
  initialProduct?: Product | null;
  onSave: (product: any) => Promise<void>;
  onCancel?: () => void;
  onBack?: () => void;
}

const PRESET_ORIGINS = ['Indonesia', 'China', 'Jepang', 'Korea Selatan', 'Amerika Serikat', 'Thailand', 'Vietnam', 'Malaysia'];
const PRESET_WARRANTY_PERIODS = [
  '1 Bulan',
  '2 Bulan',
  '3 Bulan',
  '6 Bulan',
  '12 Bulan',
  '24 Bulan',
  '3 Tahun',
  '5 Tahun',
  'Tidak Garansi',
];
const PRESET_WARRANTY_TYPES = [
  'Garansi Internasional',
  'Garansi Produsen',
  'Garansi Supplier',
  'Tidak Garansi',
];

export const ProductFormPage: React.FC<ProductFormPageProps> = ({
  initialProduct,
  onSave,
  onCancel,
  onBack,
}) => {
  const handleCancelOrBack = onBack || onCancel || (() => {});
  const isEdit = Boolean(initialProduct);

  // Core States
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(
    (initialProduct as any)?.category_id || (initialProduct as any)?.categoryId
  );

  // Brand States
    const [brands, setBrands] = useState<Brand[]>([]);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    getBrandsFromApi()
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch((err) => console.error('Error fetching brands:', err));
  }, []);

    // Rak (Shelf Location) States
  const [shelfLocation, setShelfLocation] = useState((initialProduct as any)?.shelf_location || (initialProduct as any)?.shelfLocation || "");
  const [description, setDescription] = useState((initialProduct as any)?.description || '');
  const [shelvesList, setShelvesList] = useState<OptionItem[]>([]);

  useEffect(() => {
    getShelvesFromApi().then((data) => setShelvesList(data));
  }, []);
  const [showAddShelfModal, setShowAddShelfModal] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");

  
  // Helper API Master Rak
  const fetchShelvesApi = async (): Promise<OptionItem[]> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/shelves', {
        credentials: 'include',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  };

  const createShelfApi = async (name: string): Promise<OptionItem | null> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/shelves', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  };

  const deleteShelfApi = async (id: number | string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/shelves/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      return json.success;
    } catch {
      return false;
    }
  };

  const deleteBrandApi = async (id: number | string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/brands/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      return json.success;
    } catch {
      return false;
    }
  };

  const [brand, setBrand] = useState((initialProduct as any)?.brand || 'Tidak Ada Merk');
  const [brandId, setBrandId] = useState<number | undefined>(
    (initialProduct as any)?.brand_id || (initialProduct as any)?.brandId
  );
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  // Price & Stock States (Kosong jika tambah baru)
  // State Variasi & Grosir
  const [hasVariant, setHasVariant] = useState<boolean>(initialProduct?.has_variant || false);
  const [variantTypes, setVariantTypes] = useState<VariantTypeState[]>(
    (initialProduct as any)?.variant_types?.map((vt: any) => ({
      name: vt.name,
      options: typeof vt.options === 'string' ? JSON.parse(vt.options) : (vt.options || []),
    })) || []
  );
  const [variants, setVariants] = useState<VariantItemState[]>(
    (initialProduct as any)?.variants || []
  );
  const [wholesalePrices, setWholesalePrices] = useState<WholesalePriceState[]>(
    (initialProduct as any)?.wholesale_prices || []
  );

  const [price, setPrice] = useState(
    initialProduct?.price != null ? String(initialProduct.price) : ''
  );
  const [costPrice, setCostPrice] = useState(
    (initialProduct as any)?.cost_price != null
      ? String((initialProduct as any).cost_price)
      : (initialProduct as any)?.costPrice != null
      ? String((initialProduct as any).costPrice)
      : ''
  );
  const [stock, setStock] = useState(
    initialProduct?.stock != null ? String(initialProduct.stock) : '0'
  );

  // Auto-kalkulasi total stok produk master dari varian saat variasi aktif
  useEffect(() => {
    if (hasVariant && variants.length > 0) {
      const total = variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
      setStock(String(total));
    }
  }, [hasVariant, variants]);

  const [minStock, setMinStock] = useState(
    String((initialProduct as any)?.min_stock ?? (initialProduct as any)?.minStock ?? '5')
  );

  // Sync state ketika initialProduct berubah/selesai di-fetch
  useEffect(() => {
    if (!initialProduct) return;

    setBarcode(initialProduct.barcode || "");
    setName(initialProduct.name || "");
    setCategory(initialProduct.category || "");
    setCategoryId((initialProduct as any).category_id || (initialProduct as any).categoryId);
    setBrand((initialProduct as any).brand || "Tidak Ada Merk");
    setBrandId((initialProduct as any).brand_id || (initialProduct as any).brandId);
    setPrice(initialProduct.price != null ? String(initialProduct.price) : "");
    setCostPrice((initialProduct as any).cost_price != null ? String((initialProduct as any).cost_price) : (initialProduct as any).costPrice != null ? String((initialProduct as any).costPrice) : "");
    setStock(initialProduct.stock != null ? String(initialProduct.stock) : "0");
    setMinStock(String((initialProduct as any).min_stock ?? (initialProduct as any).minStock ?? "5"));

    const pHasVariant = Boolean(initialProduct.has_variant);
    setHasVariant(pHasVariant);

    const rawTypes = (initialProduct as any).variant_types || (initialProduct as any).VariantTypes || [];
    const parsedTypes: VariantTypeState[] = rawTypes.map((vt: any) => {
      let opts: string[] = [];
      if (typeof vt.options === "string") {
        try { opts = JSON.parse(vt.options); } catch (e) { opts = []; }
      } else if (Array.isArray(vt.options)) {
        opts = vt.options;
      }
      return {
        name: vt.name || "",
        options: opts,
      };
    });
    setVariantTypes(parsedTypes);

    const rawVariants = (initialProduct as any).variants || (initialProduct as any).Variants || [];
    const mappedVariants: VariantItemState[] = rawVariants.map((v: any) => {
      const opts = v.option_values && v.option_values.length > 0 
        ? v.option_values 
        : [v.option1_value, v.option2_value].filter(Boolean);
      return {
        id: v.id,
        sku_code: v.sku_code || "",
        barcode: v.barcode || "",
        option_values: opts,
        option1_value: v.option1_value || (opts[0] || ""),
        option2_value: v.option2_value || (opts[1] || ""),
        price: Number(v.price) || 0,
        cost_price: Number(v.cost_price) || 0,
        stock: Number(v.stock) || 0,
        image_url: v.image_url || "",
      };
    });
    setVariants(mappedVariants);

        if ((initialProduct as any)?.shelf_location && !shelvesList.includes((initialProduct as any)?.shelf_location)) {
      setShelvesList((prev) => [...prev, (initialProduct as any)?.shelf_location]);
    }
    const rawWholesale = (initialProduct as any).wholesale_prices || (initialProduct as any).WholesalePrices || [];
    setWholesalePrices(rawWholesale);
  }, [initialProduct]);

  const [unit, setUnit] = useState(initialProduct?.unit || 'Pcs');
  const [isActive, setIsActive] = useState(initialProduct?.isActive !== false);

  // === NEW ATTRIBUTES STATES ===
  const [dimension, setDimension] = useState((initialProduct as any)?.dimension || '');
  const [origin, setOrigin] = useState((initialProduct as any)?.origin || '');
  const [warrantyPeriod, setWarrantyPeriod] = useState(
    (initialProduct as any)?.warranty_period || (initialProduct as any)?.warrantyPeriod || ''
  );
  const [warrantyType, setWarrantyType] = useState(
    (initialProduct as any)?.warranty_type || (initialProduct as any)?.warrantyType || ''
  );
  const [isCustom, setIsCustom] = useState<boolean | null>(() => {
    const rawVal = (initialProduct as any)?.is_custom ?? (initialProduct as any)?.isCustom;
    return typeof rawVal === "boolean" ? rawVal : null;
  });
  const [certNumber, setCertNumber] = useState(
    (initialProduct as any)?.cert_number || (initialProduct as any)?.certNumber || ''
  );

  // Dropdown UI states
  const [openDropdown, setOpenDropdown] = useState<'origin' | 'warranty_period' | 'warranty_type' | 'custom' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [customInputText, setCustomInputText] = useState('');
  const [showCustomInputBox, setShowCustomInputBox] = useState(false);

  const [customWarrantyPeriods, setCustomWarrantyPeriods] = useState<string[]>([]);
  const [customWarrantyTypes, setCustomWarrantyTypes] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setShowCustomInputBox(false);
        setCustomInputText('');
        setSearchFilter('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    getBrandsFromApi()
      .then((data) => {
        if (Array.isArray(data)) setBrandsList(data);
      })
      .catch((err) => console.error('Gagal mengambil daftar brand:', err));
  }, []);

  // Format Dimensi PxLxT: Hanya angka dan 'x' (maksimal 3 dimensi angka)
  const handleDimensionChange = (val: string) => {
    // Ambil hanya digit angka dan huruf x/X
    const sanitized = val.replace(/[^0-9xX]/g, '').toLowerCase();
    // Pisahkan berdasarkan huruf 'x' dan batasi maksimal 3 nilai (P x L x T)
    const parts = sanitized.split('x').slice(0, 3);
    const formatted = parts.join('x');
    setDimension(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!barcode.trim()) {
      setErrorMsg('Barcode produk wajib diisi!');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama barang / produk wajib diisi!');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('Merek / Brand produk wajib dipilih!');
      return;
    }
    if (!categoryId && (!category || !category.trim())) {
      setErrorMsg('Kategori produk wajib dipilih!');
      return;
    }
    if (price.trim() === '' || Number(price) <= 0 || isNaN(Number(price))) {
      setErrorMsg('Harga jual wajib diisi dengan nilai lebih dari 0!');
      return;
    }
    if (stock.trim() === '' || Number(stock) < 0 || isNaN(Number(stock))) {
      setErrorMsg('Jumlah stok saat ini wajib diisi dengan angka valid!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        barcode: barcode.trim(),
        name: name.trim(),
        category: category.trim(),
        category_id: categoryId,
        brand: brand.trim() || 'Tidak Ada Merk',
        brand_id: brandId,
        price: Number(price) || 0,
        cost_price: Number(costPrice) || 0,
        has_variant: hasVariant,
        variant_types: hasVariant ? variantTypes : [],
        variants: hasVariant ? variants : [],
        wholesale_prices: wholesalePrices,
        stock: Number(stock) || 0,
        min_stock: Number(minStock) || 0,
        unit: unit.trim() || 'Pcs',
        shelf_location: shelfLocation.trim(),
        is_active: isActive,
        // Atribut baru
        dimension: dimension.trim(),
        origin: origin.trim(),
        warranty_period: warrantyPeriod.trim(),
        warranty_type: warrantyType.trim(),
        is_custom: typeof isCustom === "boolean" ? isCustom : false,
        cert_number: certNumber.trim(),
        description: description.trim(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newBrandName.trim();
    if (!cleanName) return;

    try {
      setIsSavingBrand(true);
      const created = await createBrandToApi(cleanName);
      if (created) {
        setBrandsList((prev) => [...prev, created]);
        setBrand(created.name);
        setBrandId(created.id);
        setNewBrandName('');
        setShowAddBrandModal(false);
      }
    } catch (err) {
      console.error('Gagal membuat brand baru:', err);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const marginEstimation = Math.max(0, (Number(price) || 0) - (Number(costPrice) || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" ref={dropdownRef}>
      {/* Header Halaman */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancelOrBack}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="text-indigo-600" size={20} />
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-xs text-slate-400">
              Kelola detail inventaris, penetapan harga, dan klasifikasi kategori multi-level.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancelOrBack}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition"
          >
            <Save size={14} />
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Konten Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Kolom Kiri: Identitas Barang, Atribut Lainnya, Variasi & Grosir */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. Card Identitas Barang (dengan Kategori) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Identitas Barang</h3>
              </div>
              <span className="text-xs text-slate-400">Barcode, Kategori & Nama Produk</span>
            </div>

            <div className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Barang / Produk <span className="text-rose-500">*</span>
                  <FieldTooltip content="Nama spesifik barang yang akan dicetak di struk belanja." />
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kaos Polos Katun Combed 30s Hitam L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Merek / Brand */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merek / Brand <span className="text-rose-500">*</span>
                  <FieldTooltip content="Merek pembuat barang atau pilih 'Tidak Ada Merk' jika generic. Tekan Enter untuk langsung menambah merek baru." />
                </label>
                <SearchableSelectWithManage
                  value={brand === "Tidak Ada Merk" ? "" : brand}
                  options={(brandsList || []).map((b: any) => ({ id: b.id, name: b.name }))}
                  placeholder="-- Pilih atau Cari Merek (Enter untuk buat baru) --"
                  emptyLabel="Tidak Ada Merk (Generic / Polos)"
                  onSelect={(item) => {
                    if (item) {
                      setBrand(item.name);
                      setBrandId(Number(item.id));
                    } else {
                      setBrand("Tidak Ada Merk");
                      setBrandId(undefined);
                    }
                  }}
                  onCreate={async (cleanName) => {
                    const created = await createBrandToApi(cleanName);
                    if (created) {
                      setBrandsList((prev) => [...prev, created]);
                      return { id: created.id, name: created.name };
                    }
                    return null;
                  }}
                  onDelete={async (item) => {
                    const ok = await deleteBrandToApi(item.id);
                    if (ok) {
                      setBrandsList((prev) => prev.filter((b: any) => b.id !== item.id));
                    }
                    return ok;
                  }}
                />
              </div>

              {/* List Rak / Lokasi Penempatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Rak / Penyimpanan
                  <FieldTooltip content="Posisi penempatan barang. Ketik lalu tekan Enter untuk membuat lokasi baru." />
                </label>
                <SearchableSelectWithManage
                  value={shelfLocation}
                  options={shelvesList}
                  placeholder="-- Pilih atau Cari Lokasi Rak (Enter untuk buat baru) --"
                  emptyLabel="-- Tidak Ditentukan / Tanpa Rak --"
                  onSelect={(item) => {
                    setShelfLocation(item ? item.name : "");
                  }}
                  onCreate={async (cleanName) => {
                    const created = await createShelfToApi(cleanName);
                    if (created) {
                      setShelvesList((prev) => [...prev, created]);
                      return created;
                    }
                    return null;
                  }}
                  onDelete={async (item) => {
                    const ok = await deleteShelfToApi(item.id);
                    if (ok) {
                      setShelvesList((prev) => prev.filter((s) => s.id !== item.id));
                    }
                    return ok;
                  }}
                />
              </div>
      </div>


              {/* Kategori & Klasifikasi Bertingkat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori & Klasifikasi Bertingkat <span className="text-rose-500">*</span>
                  <FieldTooltip content="Pilih kategori bertingkat hingga sub-kategori terdalam." />
                </label>
                <CategoryCascadeModal
                  value={category}
                  categoryId={categoryId}
                  onChange={(catName, catId) => {
                    setCategory(catName);
                    setCategoryId(catId);
                  }}
                />
              </div>

              {/* Barcode & Satuan Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / SKU <span className="text-rose-500">*</span>
                    <FieldTooltip content="Scan barcode fisik produk atau ketik manual." />
                  </label>
                  <div className="relative">
                    <Barcode size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="899..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan Unit
                    <FieldTooltip content="Satuan hitung terkecil penjualan barang." />
                  </label>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="Pack">Pack</option>
                      <option value="Box">Box / Kotak</option>
                      <option value="Lusin">Lusin (12 Pcs)</option>
                      <option value="Kodi">Kodi (20 Pcs)</option>
                      <option value="Kg">Kg (Kilogram)</option>
                      <option value="Gram">Gram</option>
                      <option value="Liter">Liter</option>
                      <option value="Meter">Meter</option>
                      <option value="Set">Set</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                  </div>
              </div>
            </div>
          </div>

          {/* 2. Card Atribut Lainnya */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Atribut Lainnya</h3>
              <span className="text-xs text-slate-400">Opsional / Spesifikasi Tambahan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dimensi (P x L x T)
                </label>
                <input
                  type="text"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  placeholder="Silakan isi (contoh: 33x98x98)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Produk
                </label>
                <div className="relative">
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Silakan pilih</option>
                    {PRESET_ORIGINS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masa Garansi
                </label>
                <CustomSelect
                  value={warrantyPeriod}
                  onChange={setWarrantyPeriod}
                  presetOptions={PRESET_WARRANTY_PERIODS}
                  placeholder="Silakan pilih"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Garansi
                </label>
                <CustomSelect
                  value={warrantyType}
                  onChange={setWarrantyType}
                  presetOptions={PRESET_WARRANTY_TYPES}
                  placeholder="Silakan pilih"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Produk Custom
                </label>
                <div className="relative">
                  <select
                    value={isCustom === true ? 'Ya' : isCustom === false ? 'Tidak' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'Ya') setIsCustom(true);
                      else if (e.target.value === 'Tidak') setIsCustom(false);
                      else setIsCustom(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Silakan pilih</option>
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No.Sertifikat (POSTEL)
                </label>
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="Silakan isi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Deskripsi Produk (Menyatu dalam Atribut Lainnya) */}
              <div className="col-span-1 sm:col-span-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  <span className="text-rose-500 mr-1">*</span>Deskripsi Produk
                </label>
                <div className="relative">
                  <textarea
                    rows={5}
                    maxLength={3000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan deskripsi produk atau tambahkan gambar."
                    className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y min-h-[120px]"
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {description.length}/3000
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Informasi Penjualan & Variasi */}
        <ProductVariationSection
          hasVariant={hasVariant}
          onToggleVariant={setHasVariant}
          variantTypes={variantTypes}
          setVariantTypes={setVariantTypes}
          variants={variants}
          setVariants={setVariants}
          basePrice={Number(price) || 0}
          baseCostPrice={Number(costPrice) || 0}
          baseBarcode={barcode}
        />

        {/* 5. Harga Grosir (Tiered Wholesale) */}
        <ProductWholesaleSection
          wholesalePrices={wholesalePrices}
          setWholesalePrices={setWholesalePrices}
          regularPrice={Number(price) || 0}
        />
      </div>

      {/* Kolom Kanan: Harga & Stok */}
        <div className="space-y-6">
          {/* Card Status Produk */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Status Produk</h3>
              <span className="text-[11px] text-slate-400">Visibilitas Kasir</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Status Publikasi
                <FieldTooltip content="Tentukan apakah produk langsung siap dijual di kasir atau diarsipkan sebagai draft." />
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isActive
                      ? "bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Aktif (Jual)
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                {isActive
                  ? "Produk aktif dan langsung dapat dicari saat transaksi kasir."
                  : "Produk dinonaktifkan sementara dan disembunyikan dari kasir."}
              </p>
            </div>
          </div>
          {/* Card Harga & Margin */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign size={16} className="text-indigo-600" />
              <span>Harga & Margin</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Jual (Rp) <span className="text-rose-500">*</span>
                  <FieldTooltip content="Harga jual final ke konsumen saat checkout di kasir ritel." />
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Modal / Pokok (Rp)
                  <FieldTooltip content="Harga kulakan/HPP dari supplier. Digunakan sistem untuk menghitung estimasi keuntungan bersih secara otomatis." />
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">Estimasi Margin:</span>
                <span className="text-xs font-bold text-emerald-700">
                  Rp {marginEstimation.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>



          {/* Card Manajemen Stok */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Manajemen Stok
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Stok Saat Ini <span className="text-rose-500">*</span>
                  <FieldTooltip content="Jumlah fisik produk riil yang ada di toko/gudang. Otomatis berkurang saat kasir menyelesaikan transaksi." />
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock} disabled={hasVariant} title={hasVariant ? "Stok dikalkulasi otomatis dari variasi" : ""}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Peringatan Stok Minimum (Alert)
                  <FieldTooltip content="Batas ambang aman. Jika stok produk tersisa sama atau di bawah angka ini, sistem otomatis memunculkan peringatan waspada restock." />
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Cepat Tambah Merek Baru */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 w-full max-w-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Tambah Merek Baru</h3>
            <p className="text-xs text-slate-400 mb-4">Merek akan tersimpan ke master data untuk produk lainnya.</p>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: Indomie, Xiaomi, Uniqlo..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNewBrand(e);
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddBrandModal(false);
                  setNewBrandName("");
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddNewBrand}
                disabled={!newBrandName.trim() || isSavingBrand}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
              >
                {isSavingBrand ? "Menyimpan..." : "Simpan Merek"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cepat Tambah Rak Baru */}
      {showAddShelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 w-full max-w-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Tambah Lokasi Rak Baru</h3>
            <p className="text-xs text-slate-400 mb-4">Tambahkan nama/kode rak baru ke dalam daftar pilihan.</p>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: Rak D3 (Aksesoris), Etalase Kaca 2..."
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = newShelfName.trim();
                  if (trimmed) {
                    if (!shelvesList.includes(trimmed)) {
                      setShelvesList((prev) => [...prev, trimmed]);
                    }
                    setShelfLocation(trimmed);
                    setNewShelfName("");
                    setShowAddShelfModal(false);
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddShelfModal(false);
                  setNewShelfName("");
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = newShelfName.trim();
                  if (trimmed) {
                    if (!shelvesList.includes(trimmed)) {
                      setShelvesList((prev) => [...prev, trimmed]);
                    }
                    setShelfLocation(trimmed);
                    setNewShelfName("");
                    setShowAddShelfModal(false);
                  }
                }}
                disabled={!newShelfName.trim()}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
              >
                Simpan Rak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
