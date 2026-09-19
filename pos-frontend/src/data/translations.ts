export const translations = {
  id: {
    // Sidebar & Navigation
    appTitle: 'ADMIN SERBA 35K',
    appSubtitle: 'Pusat Kendali Toko',
    dashboard: 'Dashboard Pusat',
    products: 'Data Barang & Stok',
    reports: 'Laporan Penjualan',
    employees: 'Data Karyawan',
    openPos: 'BUKA LAYAR KASIR',
    
    // Header
    dashboardTitle: 'Ringkasan Dashboard',
    inventoryTitle: 'Manajemen Inventaris Gudang',
    
    // Products View
    masterData: 'Master Data Barang',
    addProduct: 'Tambah Barang Baru',
    searchPlaceholder: 'Cari nama atau barcode...',
    allCategories: 'Semua Kategori',
    showingSku: 'Menampilkan {count} dari {total} SKU',
    colBarcode: 'Barcode',
    colName: 'Nama Barang',
    colCategory: 'Kategori',
    colPrice: 'Harga Jual',
    colStock: 'Stok Gudang',
    noProducts: 'Tidak ada barang yang cocok dengan filter atau kata kunci.',
    
    // Modal Form
    modalTitle: 'Tambah SKU Barang Baru',
    barcodeLabel: 'Kode Barcode / EAN',
    nameLabel: 'Nama Barang',
    categoryLabel: 'Kategori Barang',
    stockLabel: 'Jumlah Stok Awal',
    lockedPriceLabel: 'Harga Jual Terkunci',
    cancel: 'Batal',
    saveProduct: 'Simpan Barang',
    addCategoryPrompt: 'Tambahkan',
    searchCatPlaceholder: 'Cari atau tambah kategori...',
    
    // POS Terminal
    exitPos: 'Keluar',
    posTitle: 'POS SERBA 35.000',
    scanPlaceholder: 'Scan Barcode / Ketik Nama Barang + Enter...',
    totalBill: 'Total Belanja',
    itemCount: '{count} Item Terscan (@ Rp 35.000)',
    payCash: 'PEMBAYARAN TUNAI',
    payCard: 'QRIS / EDC KARTU',
    holdOrder: 'Parkir Transaksi (Hold)',
    voidOrder: 'Void Transaksi (PIN)',
    emptyCart: 'Belum ada barang di keranjang. Silakan scan barcode barang.',
  },
  en: {
    // Sidebar & Navigation
    appTitle: '35K RETAIL ADMIN',
    appSubtitle: 'Store Control Center',
    dashboard: 'Main Dashboard',
    products: 'Inventory & Stock',
    reports: 'Sales Reports',
    employees: 'Employee Management',
    openPos: 'OPEN POS TERMINAL',
    
    // Header
    dashboardTitle: 'Dashboard Overview',
    inventoryTitle: 'Warehouse Inventory Management',
    
    // Products View
    masterData: 'Product Master Data',
    addProduct: 'Add New Product',
    searchPlaceholder: 'Search by name or barcode...',
    allCategories: 'All Categories',
    showingSku: 'Showing {count} of {total} SKUs',
    colBarcode: 'Barcode',
    colName: 'Item Name',
    colCategory: 'Category',
    colPrice: 'Retail Price',
    colStock: 'Warehouse Stock',
    noProducts: 'No products matched your search or category filter.',
    
    // Modal Form
    modalTitle: 'Add New Product SKU',
    barcodeLabel: 'Barcode / EAN Code',
    nameLabel: 'Product Name',
    categoryLabel: 'Product Category',
    stockLabel: 'Initial Stock Qty',
    lockedPriceLabel: 'Fixed Retail Price',
    cancel: 'Cancel',
    saveProduct: 'Save Product',
    addCategoryPrompt: 'Add',
    searchCatPlaceholder: 'Search or add category...',
    
    // POS Terminal
    exitPos: 'Exit',
    posTitle: '35K RETAIL POS',
    scanPlaceholder: 'Scan Barcode / Enter Product Name + Enter...',
    totalBill: 'Total Amount',
    itemCount: '{count} Items Scanned (@ Rp 35,000)',
    payCash: 'CASH PAYMENT',
    payCard: 'QRIS / CARD EDC',
    holdOrder: 'Hold Transaction',
    voidOrder: 'Void Transaction (PIN)',
    emptyCart: 'Cart is empty. Please scan product barcode.',
  }
};

export type Language = 'id' | 'en';