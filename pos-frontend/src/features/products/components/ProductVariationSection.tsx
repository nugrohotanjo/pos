import React, { useState, useEffect } from 'react';
import { Plus, X, Layers, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';

export interface VariantTypeState {
  name: string;
  options: string[];
}

export interface VariantItemState {
  sku_code: string;
  barcode: string;
  option_values: string[]; // Nilai opsi urut sesuai variantTypes
  option1_value?: string;  // backward-compatibility
  option2_value?: string;  // backward-compatibility
  price: number;
  cost_price: number;
  stock: number;
  image_url: string;
}

interface ProductVariationSectionProps {
  hasVariant: boolean;
  onToggleVariant: (enabled: boolean) => void;
  variantTypes: VariantTypeState[];
  setVariantTypes: React.Dispatch<React.SetStateAction<VariantTypeState[]>>;
  variants: VariantItemState[];
  setVariants: React.Dispatch<React.SetStateAction<VariantItemState[]>>;
  basePrice: number;
  baseCostPrice: number;
  baseBarcode: string;
}

const MAX_VARIANT_TYPES = 10;

export const ProductVariationSection: React.FC<ProductVariationSectionProps> = ({
  hasVariant,
  onToggleVariant,
  variantTypes,
  setVariantTypes,
  variants,
  setVariants,
  basePrice,
  baseCostPrice,
  baseBarcode,
}) => {
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [bulkSku, setBulkSku] = useState('');

  // Local state input text opsi baru per baris variasi
  const [newOptionInputs, setNewOptionInputs] = useState<{ [key: number]: string }>({});

  const handleToggle = (enabled: boolean) => {
    onToggleVariant(enabled);
    if (enabled && variantTypes.length === 0) {
      setVariantTypes([{ name: 'Warna', options: [] }]);
    }
  };

  const addVariantType = () => {
    if (variantTypes.length < MAX_VARIANT_TYPES) {
      setVariantTypes([...variantTypes, { name: `Variasi ${variantTypes.length + 1}`, options: [] }]);
    }
  };

  const removeVariantType = (index: number) => {
    setVariantTypes(variantTypes.filter((_, i) => i !== index));
  };

  const updateTypeName = (index: number, name: string) => {
    const updated = [...variantTypes];
    updated[index].name = name;
    setVariantTypes(updated);
  };

  const addOption = (typeIndex: number, optionVal: string) => {
    const trimmed = optionVal.trim();
    if (!trimmed) return;
    const updated = [...variantTypes];
    if (!updated[typeIndex].options.includes(trimmed)) {
      updated[typeIndex].options.push(trimmed);
      setVariantTypes(updated);
    }
  };

  const removeOption = (typeIndex: number, optIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options = updated[typeIndex].options.filter((_, i) => i !== optIndex);
    setVariantTypes(updated);
  };

  // Helper Cartesian Product N-Dimensi
  const cartesianProduct = (arrays: string[][]): string[][] => {
    return arrays.reduce<string[][]>(
      (acc, curr) => {
        const res: string[][] = [];
        acc.forEach((a) => {
          curr.forEach((b) => {
            res.push([...a, b]);
          });
        });
        return res;
      },
      [[]]
    );
  };

  // Generate SKU Matrix secara dinamis saat variantTypes berubah
  useEffect(() => {
    if (!hasVariant) return;

    // Filter tipe yang punya setidaknya 1 opsi
    const activeTypes = variantTypes.filter((vt) => vt.options.length > 0);
    if (activeTypes.length === 0) {
      setVariants([]);
      return;
    }

    const optionsArrays = activeTypes.map((vt) => vt.options);
    const combinations = cartesianProduct(optionsArrays);

    const currentMap = new Map<string, VariantItemState>();
    variants.forEach((v) => {
      const opts = (v.option_values && v.option_values.length > 0)
        ? v.option_values
        : [v.option1_value, v.option2_value].filter(Boolean);
      const key = opts.join("|");
      if (key) {
        currentMap.set(key, v);
      }
    });

    const newVariants: VariantItemState[] = combinations.map((comb) => {
      const key = comb.join('|');
      const existing = currentMap.get(key);

      const skuSuffix = comb.map((c) => c.replace(/\s+/g, '').toUpperCase()).join('-');
      const defaultSku = baseBarcode ? `${baseBarcode}-${skuSuffix}` : skuSuffix;

      return (
        existing || {
          sku_code: defaultSku,
          barcode: '',
          option_values: comb,
          option1_value: comb[0] || '',
          option2_value: comb[1] || '',
          price: basePrice || 0,
          cost_price: baseCostPrice || 0,
          stock: 0,
          image_url: '',
        }
      );
    });

    setVariants(newVariants);
  }, [variantTypes, hasVariant]);

  const handleApplyToAll = () => {
    if (!bulkPrice && !bulkStock && !bulkSku) return;

    setVariants((prev) =>
      prev.map((item, index) => ({
        ...item,
        price: bulkPrice !== '' ? Number(bulkPrice) : item.price,
        stock: bulkStock !== '' ? Number(bulkStock) : item.stock,
        sku_code: bulkSku !== '' ? `${bulkSku}-${index + 1}` : item.sku_code,
      }))
    );
  };

  const updateVariantItem = (index: number, field: keyof VariantItemState, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const activeTypesWithOpts = variantTypes.filter((vt) => vt.options.length > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Informasi Penjualan & Variasi</h3>
            <p className="text-xs text-slate-500">
              Aktifkan untuk variasi bertingkat hingga {MAX_VARIANT_TYPES} tipe (cth: Warna, Ukuran, Bahan, Model, dsb)
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariant}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {hasVariant && (
        <div className="space-y-5">
          {/* List Tipe Variasi (1 sampai 10) */}
          <div className="space-y-4">
            {variantTypes.map((vt, tIdx) => (
              <div key={tIdx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Tipe Variasi {tIdx + 1}</span>
                  {variantTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantType(tIdx)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                      title="Hapus Tipe Variasi"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="max-w-md">
                  <input
                    type="text"
                    placeholder={`Nama Variasi ${tIdx + 1} (cth: Warna / Ukuran / Bahan / Rasa)`}
                    value={vt.name}
                    onChange={(e) => updateTypeName(tIdx, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Tag Chips Opsi */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-500">Pilihan Opsi:</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {vt.options.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeOption(tIdx, oIdx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Ketik & Enter..."
                        value={newOptionInputs[tIdx] || ''}
                        onChange={(e) =>
                          setNewOptionInputs({ ...newOptionInputs, [tIdx]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOption(tIdx, newOptionInputs[tIdx] || '');
                            setNewOptionInputs({ ...newOptionInputs, [tIdx]: '' });
                          }
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addOption(tIdx, newOptionInputs[tIdx] || '');
                          setNewOptionInputs({ ...newOptionInputs, [tIdx]: '' });
                        }}
                        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tombol Tambah Tipe Variasi (Maksimal 10) */}
          {variantTypes.length < MAX_VARIANT_TYPES && (
            <button
              type="button"
              onClick={addVariantType}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-xl hover:bg-indigo-100/70 transition-all"
            >
              <Plus size={14} /> Tambah Variasi ({variantTypes.length}/{MAX_VARIANT_TYPES})
            </button>
          )}

          {/* Mass Update & Dynamic Matrix Table */}
          {variants.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> Terapkan Masal ke {variants.length} Kombinasi:
                </span>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <input
                    type="number"
                    placeholder="Harga Satuan"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Stok"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Prefix SKU"
                    value={bulkSku}
                    onChange={(e) => setBulkSku(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyToAll}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                  >
                    Terapkan Ke Semua
                  </button>
                </div>
              </div>

              {/* Matriks Kombinasi Tabel SKU */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 font-bold text-slate-700 shadow-xs">
                    <tr>
                      <th className="p-3 w-12 text-center">Foto</th>
                      {activeTypesWithOpts.map((vt, idx) => (
                        <th key={idx} className="p-3 whitespace-nowrap">
                          {vt.name || `Variasi ${idx + 1}`}
                        </th>
                      ))}
                      <th className="p-3 w-36"><span className="text-rose-500">*</span> Harga (Rp)</th>
                      <th className="p-3 w-28"><span className="text-rose-500">*</span> Stok</th>
                      <th className="p-3 min-w-[140px]">Kode SKU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-center">
                          <div className="w-8 h-8 mx-auto border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-white">
                            <ImageIcon size={13} />
                          </div>
                        </td>
                        {(item.option_values || [item.option1_value || '', item.option2_value || '']).map((val, vIdx) => (
                          <td key={vIdx} className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">
                            {val}
                          </td>
                        ))}
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.price}
                            onChange={(e) => updateVariantItem(idx, 'price', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.stock}
                            onChange={(e) => updateVariantItem(idx, 'stock', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Kode SKU"
                            value={item.sku_code}
                            onChange={(e) => updateVariantItem(idx, 'sku_code', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariationSection;
