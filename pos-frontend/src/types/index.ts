export type Product = {
  barcode: string;
  name: string;
  category: string;
  stock: number;
  price?: number;
};

export type CartItem = Product & {
  qty: number;
};

export type ActiveMenu = 'dashboard' | 'products' | 'pos';