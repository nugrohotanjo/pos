import { useState } from 'react';
import type { ActiveMenu, Product } from './types';
import { INITIAL_PRODUCTS } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './features/dashboard/DashboardView';
import { ProductsView } from './features/products/ProductsView';
import { PosView } from './features/pos/PosView';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Jika kasir dibuka, tampilkan full screen POS
  if (activeMenu === 'pos') {
    return <PosView products={products} setActiveMenu={setActiveMenu} />;
  }

  // Layout default Admin Panel
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header activeMenu={activeMenu} />
        {activeMenu === 'dashboard' && <DashboardView />}
        {activeMenu === 'products' && <ProductsView products={products} />}
      </main>
    </div>
  );
}