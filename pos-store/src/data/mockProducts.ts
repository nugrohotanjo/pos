import {
  Utensils,
  Zap,
  CupSoda,
  Scissors,
  Box,
  Sparkles,
  Umbrella,
  Smartphone,
  Shirt,
  Wrench,
  Droplet,
  Cable
} from 'lucide-react';
import type { Product } from '../types/product';

export const CATEGORIES = [
  "Semua",
  "Dapur & Masak",
  "Perabot & Kamar",
  "Perkakas & Mobil",
  "Aksesoris & Gadget",
  "Printilan Unik"
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Rak Bumbu Gantung Tempel Dapur Tanpa Bor",
    category: "Dapur & Masak",
    price: 35000,
    originalPrice: 49000,
    tag: "Best Seller Toko",
    stockNote: "Sisa 8 di rak kasir",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: 2,
    name: "Lampu Tidur LED Sensor Gerak Otomatis Charge USB",
    category: "Perabot & Kamar",
    price: 35000,
    originalPrice: 55000,
    tag: "Viral Offline",
    stockNote: "Paling dicari ibu-ibu",
    icon: Zap,
    color: "bg-amber-100 text-amber-600"
  },
  {
    id: 3,
    name: "Botol Minum Jumbo 2 Liter Penanda Waktu & Sedotan",
    category: "Printilan Unik",
    price: 35000,
    originalPrice: 48000,
    tag: "Serba 35Rb",
    stockNote: "Banyak pilihan warna",
    icon: CupSoda,
    color: "bg-sky-100 text-sky-600"
  },
  {
    id: 4,
    name: "Gunting Dapur Serbaguna 8 in 1 Stainless Steel",
    category: "Dapur & Masak",
    price: 25000,
    originalPrice: 35000,
    tag: "Flash Sale",
    stockNote: "Tahan karat & tajam",
    icon: Scissors,
    color: "bg-rose-100 text-rose-600"
  },
  {
    id: 5,
    name: "Kotak Organizer Sepatu Susun Lipat Transparan (Isi 2)",
    category: "Perabot & Kamar",
    price: 35000,
    originalPrice: 45000,
    tag: "Serba 35Rb",
    stockNote: "Bikin rapi lemari",
    icon: Box,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    id: 6,
    name: "Kanebo Tebal Serat Tabung Kuning Cuci Mobil Motor",
    category: "Perkakas & Mobil",
    price: 20000,
    originalPrice: 30000,
    tag: "Promo Cuci",
    stockNote: "Daya serap tinggi",
    icon: Sparkles,
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: 7,
    name: "Payung Lipat Mini Anti UV Pocket Size Ringan",
    category: "Printilan Unik",
    price: 35000,
    originalPrice: 50000,
    tag: "Serba 35Rb",
    stockNote: "Bisa masuk tas kecil",
    icon: Umbrella,
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    id: 8,
    name: "Holder HP Meja Lipat Aluminium Fleksibel",
    category: "Aksesoris & Gadget",
    price: 30000,
    originalPrice: 40000,
    tag: "Serba Murah",
    stockNote: "Kokoh buat nonton",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 9,
    name: "Gantungan Baju Magic Hanger 9 Lubang Putar 360°",
    category: "Perabot & Kamar",
    price: 20000,
    originalPrice: 30000,
    tag: "Hemat Ruang",
    stockNote: "Beli banyak makin rapi",
    icon: Shirt,
    color: "bg-pink-100 text-pink-600"
  },
  {
    id: 10,
    name: "Set Obeng Presisi 31-in-1 Multifungsi HP & Jam",
    category: "Perkakas & Mobil",
    price: 35000,
    originalPrice: 55000,
    tag: "Serba 35Rb",
    stockNote: "Wajib punya di rumah",
    icon: Wrench,
    color: "bg-slate-200 text-slate-800"
  },
  {
    id: 11,
    name: "Pompa Galon Elektrik Otomatis Rechargeable Portabel",
    category: "Dapur & Masak",
    price: 35000,
    originalPrice: 49000,
    tag: "Best Seller Toko",
    stockNote: "Tinggal tekan air keluar",
    icon: Droplet,
    color: "bg-cyan-100 text-cyan-600"
  },
  {
    id: 12,
    name: "Kabel Data Fast Charging 3-in-1 Universal Nylon",
    category: "Aksesoris & Gadget",
    price: 25000,
    originalPrice: 35000,
    tag: "Flash Sale",
    stockNote: "Type-C, Micro, Lightning",
    icon: Cable,
    color: "bg-blue-100 text-blue-600"
  }
];