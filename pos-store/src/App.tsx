import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import type { Product, CartState } from './types/product';
import { PRODUCTS, CATEGORIES } from './data/mockProducts';
import { createSingleItemWhatsAppUrl } from './utils/formatters';

import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { CartPageView } from './components/CartPageView';
import { OfflineStoreInfo } from './components/OfflineStoreInfo';
import { Toast } from './components/Toast';
import { PaymentPageView } from './components/PaymentPageView';
import { AuthPageView } from './components/AuthPageView';
import { UserProfileView } from './components/UserProfileView';

// Subkomponen untuk Halaman Beranda (Katalog)
const HomeCatalogView: React.FC<{
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onAddToCart: (id: number) => void;
  onBuyDirect: (product: Product) => void;
}> = ({ searchQuery, setSearchQuery, onAddToCart, onBuyDirect }) => {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchCat = activeCategory === "Semua" || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      <HeroBanner />

      <CategoryFilter 
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        filteredCount={filteredProducts.length}
      />

      <section className="mb-14">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard 
                key={prod.id}
                product={prod}
                onAddToCart={onAddToCart}
                onBuyDirect={onBuyDirect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Barang tidak ditemukan</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-4">Coba cari kata kunci lain seperti 'rak', 'lampu', atau klik tombol reset filter.</p>
            <button 
              onClick={() => { setActiveCategory("Semua"); setSearchQuery(""); }} 
              className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-700"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </section>

      <OfflineStoreInfo />
    </main>
  );
};

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleAddToCart = (id: number, quantity: number = 1) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + quantity }));
    triggerToast("Barang berhasil dimasukkan ke keranjang!");
  };

  const handleChangeQty = (id: number, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[id] || 0) + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nextQty };
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleBuyDirect = (product: Product) => {
    const url = createSingleItemWhatsAppUrl(product);
    window.open(url, '_blank');
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === Number(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [cart]);

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
      <AnnouncementBar />

      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          navigate('/'); // Otomatis balik ke katalog jika mengetik di kolom pencarian
        }}
        cartCount={totalCartCount}
      />

      <Routes>
  <Route 
    path="/" 
    element={
      <HomeCatalogView 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddToCart={handleAddToCart}
        onBuyDirect={handleBuyDirect}
      />
    } 
  />
  <Route 
    path="/product/:slug" 
    element={
      <ProductDetailView 
        onAddToCart={handleAddToCart}
      />
    } 
  />
  <Route 
    path="/cart" 
    element={
      <CartPageView 
        cart={cart}
        products={PRODUCTS}
        totalCartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        onChangeQty={handleChangeQty}
        onRemoveFromCart={handleRemoveFromCart}
      />
    } 
  />
  <Route 
    path="/payment" 
    element={<PaymentPageView />} 
  />
  <Route 
    path="/login" 
    element={<AuthPageView initialMode="login" onLoginSuccess={() => triggerToast("Berhasil masuk ke akun!")} />} 
  />
  <Route 
    path="/signup" 
    element={<AuthPageView initialMode="signup" onLoginSuccess={() => triggerToast("Pendaftaran akun berhasil!")} />} 
  />

  {/* Rute Profil & History Belanja Pengguna */}
  <Route 
    path="/profile" 
    element={<UserProfileView />} 
  />
</Routes>

      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-xs">35K</div>
            <span className="text-slate-200 font-bold">Serba35Ribu Offline & Online</span>
            <span>— Pusat Barang Murah Berkualitas</span>
          </div>
          <div className="text-center sm:text-right text-slate-500">
            © 2026 Toko Serba Murah. Melayani Eceran & Grosir Toko Offline.
          </div>
        </div>
      </footer>

      <Toast message={toastMessage} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;