import React, { useState, useRef } from 'react';
import { Camera, Trash2, Eye, RefreshCw, Star, X, Image as ImageIcon } from 'lucide-react';

interface ProductImageUploaderProps {
  images?: string[];
  onChange?: (images: string[]) => void;
  maxImages?: number;
}

// In-memory file cache untuk menyimpan Blob sebelum form di-submit
export const pendingUploadBlobs = new Map<string, Blob>();

// Helper kompresi gambar ke WebP lokal (Shopee-like 1:1 / max 1000px)
const compressImageToWebP = (file: File, maxDim = 1000, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Gagal kompresi gambar'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper upload yang dipanggil saat Simpan Produk ditekan
export const uploadPendingProductImages = async (imageUrls: string[]): Promise<string[]> => {
  const token = localStorage.getItem('token');
  const uploadApi = `${window.location.protocol}//${window.location.hostname}:8000/api/v1/products/upload-image`;
  const finalUrls: string[] = [];

  for (const url of imageUrls) {
    if (url.startsWith('blob:') && pendingUploadBlobs.has(url)) {
      const blob = pendingUploadBlobs.get(url)!;
      const formData = new FormData();
      formData.append('image', blob, `prod_${Date.now()}.webp`);

      const res = await fetch(uploadApi, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal mengupload salah satu foto produk');
      const data = await res.json();
      if (data.success && data.data?.url) {
        finalUrls.push(data.data.url);
        pendingUploadBlobs.delete(url);
      }
    } else {
      // URL yang sudah ada sebelumnya
      finalUrls.push(url);
    }
  }

  return finalUrls;
};

// Helper resolver URL display
export const resolveDisplayImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.protocol}//${window.location.hostname}:8000${clean}`;
};

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 9,
}) => {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    const chosen = Array.from(files).slice(0, remaining);

    const newBlobUrls: string[] = [];
    for (const f of chosen) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const compressedBlob = await compressImageToWebP(f);
        const blobUrl = URL.createObjectURL(compressedBlob);
        pendingUploadBlobs.set(blobUrl, compressedBlob);
        newBlobUrls.push(blobUrl);
      } catch (err) {
        console.error('Error compress image:', err);
      }
    }

    if (newBlobUrls.length > 0) {
      onChange?.([...images, ...newBlobUrls]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplace = async (files: FileList | null) => {
    if (!files || !files[0] || replacingIndex === null) return;
    try {
      const compressedBlob = await compressImageToWebP(files[0]);
      const blobUrl = URL.createObjectURL(compressedBlob);
      pendingUploadBlobs.set(blobUrl, compressedBlob);

      const next = [...images];
      // Bersihkan blob lama dari memori bila ada
      if (next[replacingIndex].startsWith('blob:')) {
        pendingUploadBlobs.delete(next[replacingIndex]);
      }
      next[replacingIndex] = blobUrl;
      onChange?.(next);
    } catch (err) {
      console.error('Error replace image:', err);
    } finally {
      setReplacingIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange?.(next);
  };

  const handleDelete = (index: number) => {
    const target = images[index];
    if (target?.startsWith('blob:')) {
      pendingUploadBlobs.delete(target);
    }
    onChange?.(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-slate-700">Foto Produk</span>
        <span className="text-xs text-slate-400">
          ({images.length}/{maxImages}) • Foto ke-1 adalah Sampul Utama
        </span>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {images.map((imgUrl, index) => {
          const isMain = index === 0;

          return (
            <div
              key={`${imgUrl}-${index}`}
              className={`group relative w-24 h-24 rounded-lg border-2 transition-all ${
                isMain ? 'border-primary shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="w-full h-full rounded-[6px] overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={resolveDisplayImageUrl(imgUrl)}
                  alt={`Produk ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tag Sampul Utama */}
              {isMain && (
                <div className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded shadow z-10 font-medium">
                  Utama
                </div>
              )}

              {/* Hover Floating Action Bar (Shopee Style) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-30">
                <div className="flex items-center bg-slate-900/95 backdrop-blur-sm text-white px-2 py-1 rounded-full shadow-2xl text-xs gap-1 border border-slate-700 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingIndex(index);
                      replaceInputRef.current?.click();
                    }}
                    title="Ubah Foto"
                    className="flex items-center gap-0.5 hover:bg-slate-700/80 px-2 py-0.5 rounded-full transition-colors text-[11px]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>

                  <span className="text-slate-600 text-[10px]">|</span>

                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(resolveDisplayImageUrl(imgUrl))}
                    title="Preview Foto"
                    className="flex items-center gap-0.5 hover:bg-slate-700/80 px-2 py-0.5 rounded-full transition-colors text-[11px]"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>

                  {!isMain && (
                    <>
                      <span className="text-slate-600 text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={() => handleSetMain(index)}
                        title="Set Gambar Utama"
                        className="flex items-center gap-0.5 hover:bg-amber-600/80 px-2 py-0.5 rounded-full transition-colors text-[11px] text-amber-300"
                      >
                        <Star className="w-3 h-3" />
                        <span>Utama</span>
                      </button>
                    </>
                  )}

                  <span className="text-slate-600 text-[10px]">|</span>

                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    title="Hapus Foto"
                    className="flex items-center gap-0.5 hover:bg-rose-600/80 px-2 py-0.5 rounded-full transition-colors text-[11px] text-rose-300"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900/95 mx-auto" />
              </div>
            </div>
          );
        })}

        {/* Kotak Tambah Foto */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-slate-300 hover:border-primary/70 rounded-lg flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary transition-all bg-slate-50/50 hover:bg-primary/5 cursor-pointer"
          >
            <div className="p-2 rounded-full bg-white shadow-sm border border-slate-200">
              <Camera className="w-5 h-5 text-slate-500" />
            </div>
            <span className="text-xs font-medium">Tambah</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={(e) => handleReplace(e.target.files)}
        className="hidden"
      />

      {previewModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
              <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Preview Gambar
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewModalUrl}
                alt="Preview Detail"
                className="max-h-[70vh] w-auto object-contain rounded-md shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
