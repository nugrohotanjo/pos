import React, { useState, useEffect, useRef } from 'react';
import type { Product, Brand } from '../../types';
import { CategoryCascadeModal } from '../../components/CategoryCascadeModal';
import { FieldTooltip } from '../../components/common/FieldTooltip';
import { getBrandsFromApi, createBrandToApi } from '../../utils/api';
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
  const [brand, setBrand] = useState((initialProduct as any)?.brand || 'Tidak Ada Merk');
  const [brandId, setBrandId] = useState<number | undefined>(
    (initialProduct as any)?.brand_id || (initialProduct as any)?.brandId
  );
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  // Price & Stock States (Kosong jika tambah baru)
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
  const [minStock, setMinStock] = useState(
    String((initialProduct as any)?.min_stock ?? (initialProduct as any)?.minStock ?? '5')
  );
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
  const [isCustom, setIsCustom] = useState<string>(
    (initialProduct as any)?.is_custom != null || (initialProduct as any)?.isCustom != null
      ? (initialProduct as any)?.is_custom || (initialProduct as any)?.isCustom
        ? 'Ya'
        : 'Tidak'
      : ''
  );
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
    if (!category.trim()) {
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
        stock: Number(stock) || 0,
        min_stock: Number(minStock) || 0,
        unit: unit.trim() || 'Pcs',
        is_active: isActive,
        // Atribut baru
        dimension: dimension.trim(),
        origin: origin.trim(),
        warranty_period: warrantyPeriod.trim(),
        warranty_type: warrantyType.trim(),
        is_custom: isCustom === 'Ya' ? true : isCustom === 'Tidak' ? false : undefined,
        cert_number: certNumber.trim(),
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Identitas Barang, Atribut Lainnya & Kategori */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Identitas Barang */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package size={16} className="text-indigo-600" />
                <span>Identitas Barang</span>
              </h3>
              <span className="text-[11px] text-slate-400">Barcode & Nama Produk</span>
            </div>

            <div className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Barang / Produk <span className="text-rose-500">*</span>
                  <FieldTooltip content="Nama lengkap produk, ukuran, atau varian. Teks ini dicari oleh kasir dan tercetak pada struk belanja." />
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kaos Polos Katun Combed 30s Hitam L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Master Merek / Brand */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Merek / Brand <span className="text-rose-500">*</span>
                    <FieldTooltip content="Merek produk dagang. Pilih 'Tidak Ada Merk' jika produk generic / no-brand (misal: aksesoris polos, curah)." />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    + Tambah Merek Baru
                  </button>
                </div>
                <select
                  value={brand}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    setBrand(selectedVal);
                    const found = brandsList.find((b) => b.name === selectedVal);
                    setBrandId(found ? found.id : undefined);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                >
                  <option value="Tidak Ada Merk">Tidak Ada Merk (Generic / Polos)</option>
                  {brandsList
                    .filter((b) => b.name !== 'Tidak Ada Merk')
                    .map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Barcode & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / SKU <span className="text-rose-500">*</span>
                    <FieldTooltip content="Kode barcode fisik produk atau buat SKU unik manual jika produk tidak memiliki barcode fisik." />
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      disabled={isEdit}
                      placeholder="899..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none ${
                        isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan Unit
                    <FieldTooltip content="Satuan takaran jual produk saat transaksi (misal: Pcs, Botol, Pack, Dus, Kg)." />
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Pack">Pack</option>
                    <option value="Dus">Dus / Box</option>
                    <option value="Lusin">Lusin</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>

              {/* Status Publikasi Produk */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Publikasi Produk
                  <FieldTooltip content="Aktif: Langsung bisa discan dan dijual di kasir POS. Tidak Aktif: Disimpan sebagai arsip/draft dan disembunyikan dari katalog kasir." />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !isActive
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Tidak Aktif (Draft)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Aktif (Jual)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* === CARD BARU: ATRIBUT LAINNYA === */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Atribut Lainnya</span>
              </h3>
              <span className="text-[11px] text-slate-400">Opsional / Spesifikasi Tambahan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Dimensi (P x L x T) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dimensi (P x L x T)
                </label>
                <input
                  type="text"
                  placeholder="Silakan isi (contoh: 33x98x98)"
                  value={dimension}
                  onChange={(e) => handleDimensionChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* 2. Asal Produk (Combobox / Free Input) */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Produk
                </label>
                <div
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'origin' ? null : 'origin');
                    setSearchFilter('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer flex items-center justify-between text-slate-700"
                >
                  <span className={origin ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {origin || 'Silakan pilih'}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                {openDropdown === 'origin' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ketik nama negara / cari..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchFilter.trim()) {
                            e.preventDefault();
                            setOrigin(searchFilter.trim());
                            setOpenDropdown(null);
                          }
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1">
                      {searchFilter.trim() && !PRESET_ORIGINS.some((c) => c.toLowerCase() === searchFilter.toLowerCase()) && (
                        <div
                          onClick={() => {
                            setOrigin(searchFilter.trim());
                            setOpenDropdown(null);
                          }}
                          className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Gunakan "{searchFilter.trim()}"
                        </div>
                      )}
                      {PRESET_ORIGINS.filter((c) =>
                        c.toLowerCase().includes(searchFilter.toLowerCase())
                      ).map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            setOrigin(c);
                            setOpenDropdown(null);
                          }}
                          className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                            origin === c ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{c}</span>
                          {origin === c && <Check size={14} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Masa Garansi */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masa Garansi
                </label>
                <div
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'warranty_period' ? null : 'warranty_period');
                    setShowCustomInputBox(false);
                    setSearchFilter('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer flex items-center justify-between text-slate-700"
                >
                  <span className={warrantyPeriod ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {warrantyPeriod || 'Silakan pilih'}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                {openDropdown === 'warranty_period' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Masukkan min. 1 karakter"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1">
                      {PRESET_WARRANTY_PERIODS.filter((p) =>
                        p.toLowerCase().includes(searchFilter.toLowerCase())
                      ).map((p) => (
                        <div
                          key={p}
                          onClick={() => {
                            setWarrantyPeriod(p);
                            setOpenDropdown(null);
                          }}
                          className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                            warrantyPeriod === p ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{p}</span>
                          {warrantyPeriod === p && <Check size={14} />}
                        </div>
                      ))}

                      {/* Item Pilihan Isi Sendiri */}
                      {customWarrantyPeriods.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                            Pilihan Isi Sendiri
                          </span>
                          {customWarrantyPeriods.map((cp) => (
                            <div
                              key={cp}
                              onClick={() => {
                                setWarrantyPeriod(cp);
                                setOpenDropdown(null);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                                warrantyPeriod === cp ? 'text-rose-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{cp}</span>
                              {warrantyPeriod === cp && <Check size={14} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Tambah Nilai Atribut Custom */}
                    <div className="pt-2 border-t border-slate-100">
                      {showCustomInputBox ? (
                        <div className="flex items-center gap-1.5 p-1">
                          <input
                            type="text"
                            placeholder="Contoh: 6 Tahun"
                            value={customInputText}
                            onChange={(e) => setCustomInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customInputText.trim()) {
                                e.preventDefault();
                                const val = customInputText.trim();
                                if (!customWarrantyPeriods.includes(val)) {
                                  setCustomWarrantyPeriods((prev) => [...prev, val]);
                                }
                                setWarrantyPeriod(val);
                                setCustomInputText('');
                                setShowCustomInputBox(false);
                                setOpenDropdown(null);
                              }
                            }}
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customInputText.trim()) {
                                const val = customInputText.trim();
                                if (!customWarrantyPeriods.includes(val)) {
                                  setCustomWarrantyPeriods((prev) => [...prev, val]);
                                }
                                setWarrantyPeriod(val);
                                setCustomInputText('');
                                setShowCustomInputBox(false);
                                setOpenDropdown(null);
                              }
                            }}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomInputBox(false);
                              setCustomInputText('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomInputBox(true)}
                          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Plus size={14} /> Tambah nilai atribut
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Jenis Garansi */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Garansi
                </label>
                <div
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'warranty_type' ? null : 'warranty_type');
                    setShowCustomInputBox(false);
                    setSearchFilter('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer flex items-center justify-between text-slate-700"
                >
                  <span className={warrantyType ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {warrantyType || 'Silakan pilih'}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                {openDropdown === 'warranty_type' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Masukkan min. 1 karakter"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1">
                      {PRESET_WARRANTY_TYPES.filter((t) =>
                        t.toLowerCase().includes(searchFilter.toLowerCase())
                      ).map((t) => (
                        <div
                          key={t}
                          onClick={() => {
                            setWarrantyType(t);
                            setOpenDropdown(null);
                          }}
                          className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                            warrantyType === t ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{t}</span>
                          {warrantyType === t && <Check size={14} />}
                        </div>
                      ))}

                      {/* Item Pilihan Isi Sendiri */}
                      {customWarrantyTypes.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                            Pilihan Isi Sendiri
                          </span>
                          {customWarrantyTypes.map((ct) => (
                            <div
                              key={ct}
                              onClick={() => {
                                setWarrantyType(ct);
                                setOpenDropdown(null);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                                warrantyType === ct ? 'text-rose-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{ct}</span>
                              {warrantyType === ct && <Check size={14} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {showCustomInputBox ? (
                        <div className="flex items-center gap-1.5 p-1">
                          <input
                            type="text"
                            placeholder="Contoh: Garansi Distributor Resmi"
                            value={customInputText}
                            onChange={(e) => setCustomInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customInputText.trim()) {
                                e.preventDefault();
                                const val = customInputText.trim();
                                if (!customWarrantyTypes.includes(val)) {
                                  setCustomWarrantyTypes((prev) => [...prev, val]);
                                }
                                setWarrantyType(val);
                                setCustomInputText('');
                                setShowCustomInputBox(false);
                                setOpenDropdown(null);
                              }
                            }}
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customInputText.trim()) {
                                const val = customInputText.trim();
                                if (!customWarrantyTypes.includes(val)) {
                                  setCustomWarrantyTypes((prev) => [...prev, val]);
                                }
                                setWarrantyType(val);
                                setCustomInputText('');
                                setShowCustomInputBox(false);
                                setOpenDropdown(null);
                              }
                            }}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomInputBox(false);
                              setCustomInputText('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomInputBox(true)}
                          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Plus size={14} /> Tambah nilai atribut
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Produk Custom (Ya / Tidak) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Produk Custom
                </label>
                <select
                  value={isCustom}
                  onChange={(e) => setIsCustom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                >
                  <option value="">Silakan pilih</option>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>

              {/* 6. No. Sertifikat (POSTEL / BPOM / SN) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No.Sertifikat (POSTEL)
                </label>
                <input
                  type="text"
                  placeholder="Silakan isi"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Card Kategori Bertingkat */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>Kategori & Klasifikasi Bertingkat</span>
                <span className="text-rose-500">*</span>
                <FieldTooltip content="Hierarki klasifikasi produk untuk memudahkan filter laporan penjualan, penataan rak, dan analisis margin per kategori." />
              </h3>
              <span className="text-[11px] text-slate-400">Pilih hingga level terdalam</span>
            </div>
            <div>
              <CategoryCascadeModal
                value={category}
                categoryId={categoryId}
                onChange={(catName, catId) => {
                  setCategory(catName);
                  setCategoryId(catId);
                }}
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Harga & Stok */}
        <div className="space-y-6">
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
                  value={stock}
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
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewBrand(e);
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddBrandModal(false);
                  setNewBrandName('');
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
                {isSavingBrand ? 'Menyimpan...' : 'Simpan Merek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
