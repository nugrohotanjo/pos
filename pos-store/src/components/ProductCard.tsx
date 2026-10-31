import React from 'react';
import { Link } from 'react-router-dom';
import { Store, PlusCircle, MessageCircle } from 'lucide-react';
import type { Product } from '../types/product';
import { formatRupiah, createSlug } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
  onBuyDirect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyDirect
}) => {
  const IconComponent = product.icon;
  const productSlug = createSlug(product.name);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div>
        {/* Gambar / Visual Produk ke URL Slug */}
        <Link 
          to={`/product/${productSlug}`}
          className="h-40 sm:h-48 w-full bg-slate-50 flex flex-col items-center justify-center relative p-4 border-b border-slate-100 group-hover:bg-orange-50/30 transition-colors cursor-pointer block"
        >
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            product.price === 35000 
              ? 'bg-red-500 text-white' 
              : product.price < 35000 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-800 text-white'
          }`}>
            ${product.tag}
          </span>

          <div className={`w-20 h-20 rounded-2xl ${product.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-10 h-10" />
          </div>
          
          <span className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
            <Store className="w-3 h-3 text-slate-400" />
            {product.stockNote}
          </span>
        </Link>

        {/* Informasi Produk */}
        <div className="p-3.5 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider block mb-1">
            {product.category}
          </span>
          <Link 
            to={`/product/${productSlug}`}
            className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-orange-600 transition-colors block"
          >
            {product.name}
          </Link>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-black text-red-600">
              {formatRupiah(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              {formatRupiah(product.originalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-0 space-y-2">
        <button 
          onClick={() => onAddToCart(product.id)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          + Ke Keranjang
        </button>
        <button 
          onClick={() => onBuyDirect(product)}
          className="w-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[11px] font-semibold py-1.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-200 flex items-center justify-center gap-1 transition"
        >
          <MessageCircle className="w-3 h-3 text-emerald-600" />
          Beli Cepat via WA
        </button>
      </div>
    </div>
  );
};