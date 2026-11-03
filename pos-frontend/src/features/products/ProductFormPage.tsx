import { uploadPendingProductImages } from './components/ProductImageUploader';
import { SearchableSelectWithManage, type OptionItem } from '../../components/SearchableSelectWithManage';
import React, { useState, useEffect, useRef } from 'react';
import type { Product, Brand } from '../../types';
import { CategoryCascadeModal } from '../../components/CategoryCascadeModal';
import { CustomSelect } from "../../components/CustomSelect";
import { ProductVariationSection, type VariantTypeState, type VariantItemState } from './components/ProductVariationSection';
import { ProductIdentityCard } from './components/ProductIdentityCard';
import { ProductAttributesCard } from './components/ProductAttributesCard';
import { ProductPricingStockCard } from './components/ProductPricingStockCard';
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
  // Ekstrak gambar awal untuk mode edit
  const getInitialImages = (): string[] => {
    if (!initialProduct) return [];
    const anyProd = initialProduct as any;

    const rawList = anyProd.images || anyProd.Images || anyProd.product_images;
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item.image_url || item.imageUrl || item.url || item.path || '';
        })
        .filter(Boolean);
    }

    if (anyProd.image_url) return [anyProd.image_url];
    if (anyProd.imageUrl) return [anyProd.imageUrl];
    return [];
  };

  // Sinkronkan state images saat initialProduct tiba dari fetch API
  useEffect(() => {
    if (initialProduct) {
      const extracted = getInitialImages();
      if (extracted.length > 0) {
        setImages(extracted);
      }
    }
  }, [initialProduct]);

  const [images, setImages] = useState<string[]>(getInitialImages);
  const [name, setName] = useState(initialProduct?.name || '');
  const [condition, setCondition] = useState<string>((initialProduct as any)?.condition || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(
    (initialProduct as any)?.category_id || (initialProduct as any)?.categoryId
  );

  // Brand States
    const [brands, setBrands] = useState<Brand[]>([]);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
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
    const rawImgs = (initialProduct as any)?.images || [];
    setImages(rawImgs.map((img: any) => typeof img === "string" ? img : img.image_url));
    setName(initialProduct.name || "");
    setCondition((initialProduct as any)?.condition || "");
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
      const uploadedImages = await uploadPendingProductImages(images);
      await onSave({
        image_url: uploadedImages[0] || '',
        images: uploadedImages,
        barcode: barcode.trim(),
        name: name.trim(),
        condition: condition || 'Baru',
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


  useEffect(() => {
    if (initialProduct) {
      const extracted = getInitialImages();
      if (extracted.length > 0) {
        setImages(extracted);
      }
    }
  }, [initialProduct]);

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
          <ProductIdentityCard
            images={images}
            setImages={setImages}
            name={name}
            setName={setName}
            condition={condition}
            setCondition={setCondition}
            brand={brand}
            setBrand={setBrand}
            setBrandId={setBrandId}
            brandsList={brandsList}
            setBrandsList={setBrandsList}
            createBrandToApi={createBrandToApi}
            deleteBrandToApi={deleteBrandToApi}
            shelfLocation={shelfLocation}
            setShelfLocation={setShelfLocation}
            shelvesList={shelvesList}
            setShelvesList={setShelvesList}
            createShelfToApi={createShelfToApi}
            deleteShelfToApi={deleteShelfToApi}
            category={category}
            categoryId={categoryId}
            setCategory={setCategory}
            setCategoryId={setCategoryId}
            barcode={barcode}
            setBarcode={setBarcode}
            unit={unit}
            setUnit={setUnit}
          />

          <ProductAttributesCard
            dimension={dimension}
            setDimension={setDimension}
            origin={origin}
            setOrigin={setOrigin}
            warrantyPeriod={warrantyPeriod}
            setWarrantyPeriod={setWarrantyPeriod}
            warrantyType={warrantyType}
            setWarrantyType={setWarrantyType}
            isCustom={isCustom}
            setIsCustom={setIsCustom}
            certNumber={certNumber}
            setCertNumber={setCertNumber}
            description={description}
            setDescription={setDescription}
          />

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
        <ProductPricingStockCard
          isActive={isActive}
          setIsActive={setIsActive}
          price={price}
          setPrice={setPrice}
          costPrice={costPrice}
          setCostPrice={setCostPrice}
          marginEstimation={marginEstimation}
          stock={stock}
          setStock={setStock}
          hasVariant={hasVariant}
          minStock={minStock}
          setMinStock={setMinStock}
        />
      </form>
    </div>
  );
};
