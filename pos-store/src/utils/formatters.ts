import type { Product, CartState } from '../types/product';

export const formatRupiah = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

export const createSingleItemWhatsAppUrl = (prod: Product, phoneNumber = '6281234567890'): string => {
  const text = `Halo Admin Toko Serba 35Ribu! Saya mau pesan barang ini:\n\n` +
               `• ${prod.name} (1x) - ${formatRupiah(prod.price)}\n\n` +
               `Apakah stoknya ada di toko offline? Mau langsung disiapkan untuk diambil/dikirim. Terima kasih!`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
};

export const createSlug = (text: string): string => {
  return text
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus karakter spesial selain spasi dan minus
    .replace(/[\s_-]+/g, '-')   // Ganti spasi/underscore berulang jadi satu strip (-)
    .replace(/^-+|-+$/g, '');   // Hapus strip di awal dan akhir
};

export const createCartWhatsAppUrl = (
  cart: CartState,
  products: Product[],
  custName: string,
  orderMethod: string,
  custAddress: string,
  totalAmount: number,
  phoneNumber = '6281234567890'
): string => {
  const itemIds = Object.keys(cart).map(Number);
  let itemsListText = '';

  itemIds.forEach((id, idx) => {
    const prod = products.find((p) => p.id === id);
    const qty = cart[id];
    if (prod) {
      itemsListText += `${idx + 1}. ${prod.name} (${qty}x) = ${formatRupiah(prod.price * qty)}\n`;
    }
  });

  let message = `*FORMAT ORDERAN ONLINE - SERBA 35 RIBU*\n`;
  message += `--------------------------------------\n`;
  message += `*Nama Pelanggan:* ${custName || 'Pembeli'}\n`;
  message += `*Metode Pesanan:* ${orderMethod}\n`;
  if (orderMethod.includes('Kurir') && custAddress) {
    message += `*Alamat Pengiriman:* ${custAddress}\n`;
  }
  message += `--------------------------------------\n`;
  message += `*Daftar Belanja:*\n${itemsListText}`;
  message += `--------------------------------------\n`;
  message += `*TOTAL TAGIHAN: ${formatRupiah(totalAmount)}*\n\n`;
  message += `Mohon dicek stoknya ya kasir/admin, tolong segera dibungkus. Terima kasih! 🙏`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};