import React from 'react';
import { Package, Barcode, ChevronDown, X } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import { SearchableSelectWithManage } from '../../../components/SearchableSelectWithManage';
import { CategoryCascadeModal } from '../../../components/CategoryCascadeModal';
import { ProductImageUploader } from './ProductImageUploader';

export interface ProductIdentityCardProps {
  images?: string[];
  setImages?: (imgs: string[]) => void;
  name: string;
  setName: (v: string) => void;
  condition?: string;
  setCondition?: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  setBrandId: (v?: number) => void;
  brandsList: any[];
  setBrandsList: React.Dispatch<React.SetStateAction<any[]>>;
  createBrandToApi: (name: string) => Promise<any>;
  deleteBrandToApi: (id: any) => Promise<boolean>;
  shelfLocation: string;
  setShelfLocation: (v: string) => void;
  shelvesList: any[];
  setShelvesList: React.Dispatch<React.SetStateAction<any[]>>;
  createShelfToApi: (name: string) => Promise<any>;
  deleteShelfToApi: (id: any) => Promise<boolean>;
  category: string;
  categoryId?: number;
  setCategory: (name: string) => void;
  setCategoryId: (id?: number) => void;
  barcode: string;
  setBarcode: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
}

export function ProductIdentityCard({
  images = [],
  setImages,
  name,
  setName,
  condition = "",
  setCondition,
  brand,
  setBrand,
  setBrandId,
  brandsList,
  setBrandsList,
  createBrandToApi,
  deleteBrandToApi,
  shelfLocation,
  setShelfLocation,
  shelvesList,
  setShelvesList,
  createShelfToApi,
  deleteShelfToApi,
  category,
  categoryId,
  setCategory,
  setCategoryId,
  barcode,
  setBarcode,
  unit,
  setUnit,
}: ProductIdentityCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Identitas Barang</h3>
        </div>
        <span className="text-xs text-slate-400">Barcode, Kategori & Nama Produk</span>
      </div>

      <div className="space-y-4">
        {/* 0. Multi-Image Uploader (Max 9) */}
        {setImages && (
          <ProductImageUploader
            images={images}
            onChange={setImages}
            maxImages={9}
          />
        )}

        {/* 1. Nama Produk dengan Counter & Tombol Clear */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Barang / Produk <span className="text-rose-500">*</span>
            <FieldTooltip content="Nama spesifik barang yang akan dicetak di struk belanja. Maksimal 255 karakter." />
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              maxLength={255}
              placeholder="Contoh: Kaos Polos Katun Combed 30s Hitam L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-3.5 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <div className="absolute right-3 flex items-center gap-2">
              {name.length > 0 && (
                <button
                  type="button"
                  onClick={() => setName("")}
                  title="Hapus teks"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                >
                  <X size={14} />
                </button>
              )}
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-mono select-none">
                {name.length}/255
              </span>
            </div>
          </div>
        </div>

        {/* 2. Merek / Brand */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Merek / Brand <span className="text-rose-500">*</span>
            <FieldTooltip content="Merek pembuat barang atau pilih 'Tidak Ada Merk' jika generic. Tekan Enter untuk langsung menambah merek baru." />
          </label>
          <SearchableSelectWithManage
            value={brand === 'Tidak Ada Merk' ? '' : brand}
            options={(brandsList || []).map((b: any) => ({ id: b.id, name: b.name }))}
            placeholder="-- Pilih atau Cari Merek (Enter untuk buat baru) --"
            emptyLabel="Tidak Ada Merk (Generic / Polos)"
            onSelect={(item) => {
              if (item) {
                setBrand(item.name);
                setBrandId(Number(item.id));
              } else {
                setBrand('Tidak Ada Merk');
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

        {/* 3. List Rak / Lokasi Penempatan */}
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
              setShelfLocation(item ? item.name : '');
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

        {/* 4. Kategori & Klasifikasi Bertingkat */}
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

        {/* 5. Barcode & Satuan Unit */}
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

        {/* 6. Kondisi Barang (Setengah Kolom & Opsional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kondisi Barang
              <FieldTooltip content="Pilih kondisi fisik produk saat dijual (opsional)." />
            </label>
            <div className="relative">
              <select
                value={condition}
                onChange={(e) => setCondition && setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                <option value="">-- Pilih Kondisi --</option>
                <option value="Baru">Baru</option>
                <option value="Pernah Dipakai">Pernah Dipakai (Bekas)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductIdentityCard;
