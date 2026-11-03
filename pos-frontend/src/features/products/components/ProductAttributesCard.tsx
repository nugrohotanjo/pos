import React from 'react';
import { FieldTooltip } from './FieldTooltip';
import { ChevronDown } from 'lucide-react';

interface ProductAttributesCardProps {
  dimension: string;
  setDimension: (v: string) => void;
  origin: string;
  setOrigin: (v: string) => void;
  warrantyPeriod: string;
  setWarrantyPeriod: (v: string) => void;
  warrantyType: string;
  setWarrantyType: (v: string) => void;
  isCustom: boolean;
  setIsCustom: (v: boolean) => void;
  certNumber: string;
  setCertNumber: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export const ProductAttributesCard: React.FC<ProductAttributesCardProps> = ({
  dimension,
  setDimension,
  origin,
  setOrigin,
  warrantyPeriod,
  setWarrantyPeriod,
  warrantyType,
  setWarrantyType,
  isCustom,
  setIsCustom,
  certNumber,
  setCertNumber,
  description,
  setDescription,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Atribut Lainnya</h3>
        <span className="text-xs text-slate-400">Opsional / Spesifikasi Tambahan</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Dimensi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Dimensi (P x L x T)
            <FieldTooltip content="Format bebas, misal: 10 x 5 x 2 cm" />
          </label>
          <input
            type="text"
            placeholder="Contoh: 10x5x2 cm"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Negara Asal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Negara Asal
            <FieldTooltip content="Negara produsen atau asal barang diimpor." />
          </label>
          <input
            type="text"
            placeholder="Contoh: Indonesia, China"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Masa Garansi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Masa Garansi
            <FieldTooltip content="Durasi garansi resmi bila ada." />
          </label>
          <input
            type="text"
            placeholder="Contoh: 1 Bulan, 1 Tahun"
            value={warrantyPeriod}
            onChange={(e) => setWarrantyPeriod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Jenis Garansi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Jenis Garansi
          </label>
          <div className="relative">
            <select
              value={warrantyType}
              onChange={(e) => setWarrantyType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              <option value="Tanpa Garansi">Tanpa Garansi</option>
              <option value="Garansi Toko">Garansi Toko</option>
              <option value="Garansi Resmi">Garansi Resmi</option>
              <option value="Garansi Distributor">Garansi Distributor</option>
              <option value="Garansi Internasional">Garansi Internasional</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Produk Kustom */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Produk Kustom
            <FieldTooltip content="Apakah produk diproduksi sesuai permintaan pembeli (pre-order/custom)." />
          </label>
          <div className="relative">
            <select
              value={isCustom ? 'true' : 'false'}
              onChange={(e) => setIsCustom(e.target.value === 'true')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              <option value="false">Tidak (Produk Jadi)</option>
              <option value="true">Ya (Kustom / Pre-order)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Nomor Sertifikat POSTEL / K3L */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            No. Sertifikat (POSTEL / SNI)
            <FieldTooltip content="Nomor sertifikat izin edar atau kelayakan produk." />
          </label>
          <input
            type="text"
            placeholder="Nomor izin/sertifikat"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Deskripsi Produk */}
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
              placeholder="Tuliskan deskripsi produk atau tambahkan catatan spesifikasi."
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
  );
};
