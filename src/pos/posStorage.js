export const LS_KEYS = {
  products: 'mm_products',
  orders: 'mm_orders',
  stockInHistory: 'mm_stock_in_history',
  posTransactions: 'mm_pos_transactions',
  categories: 'mm_categories',
  promos: 'mm_promos',
  staffUsers: 'mm_staff_users',
  customers: 'mm_customers',
  nextOrderSeq: 'mm_next_order_seq',
  cart: 'mm_cart',
  currentCustomerId: 'mm_current_customer_id',
  suppliers: 'mm_suppliers',
  stockOrders: 'mm_stock_orders',
  goodsReceipts: 'mm_goods_receipts',
  returns: 'mm_returns',
  nextPoSeq: 'mm_next_po_seq',
};

export const defaultProducts = [
  {
    id: 1,
    name: 'Indomie Goreng',
    category: 'Makanan',
    price: 3500,
    stock: 45,
    image: '/images/products/indomie-goreng.jpg',
  },
  {
    id: 2,
    name: 'Telur 1kg',
    category: 'Sembako',
    price: 28000,
    stock: 12,
    image: '/images/products/telur-1kg.jpg',
  },
  {
    id: 3,
    name: 'Minyak Goreng',
    category: 'Sembako',
    price: 15000,
    stock: 23,
    image: '/images/products/minyak-goreng.jpg',
  },
  {
    id: 4,
    name: 'Beras 5kg',
    category: 'Sembako',
    price: 75000,
    stock: 8,
    image: '/images/products/beras-5kg.jpg',
  },
  {
    id: 5,
    name: 'Gula Pasir',
    category: 'Sembako',
    price: 14500,
    stock: 15,
    image: '/images/products/gula-pasir.jpg',
  },
  {
    id: 6,
    name: 'Kopi Sachet',
    category: 'Minuman',
    price: 2000,
    stock: 100,
    image: '/images/products/kopi-sachet.jpg',
  },
  {
    id: 7,
    name: 'Teh Botol',
    category: 'Minuman',
    price: 5000,
    stock: 30,
    image: '/images/products/teh-botol.jpg',
  },
  {
    id: 8,
    name: 'Roti Tawar',
    category: 'Makanan',
    price: 18000,
    stock: 7,
    image: '/images/products/roti-tawar.jpg',
  },
];

export const defaultOrders = [
  {
    id: 1,
    orderId: '#ORD-001',
    customer: 'Budi Santoso',
    address: 'Jl. Merdeka No. 45, Jakarta',
    phone: '081234567890',
    date: '2024-03-08 10:30',
    items: [
      { name: 'Indomie Goreng', qty: 2, price: 3500 },
      { name: 'Telur 1kg', qty: 1, price: 28000 },
    ],
    total: 45500,
    status: 'pending',
  },
  {
    id: 2,
    orderId: '#ORD-002',
    customer: 'Ani Wijaya',
    address: 'Jl. Sudirman No. 12, Jakarta',
    phone: '085678901234',
    date: '2024-03-08 11:15',
    items: [
      { name: 'Beras 5kg', qty: 2, price: 75000 },
      { name: 'Minyak Goreng', qty: 1, price: 15000 },
    ],
    total: 165000,
    status: 'pending',
  },
  {
    id: 3,
    orderId: '#ORD-003',
    customer: 'Citra Dewi',
    address: 'Jl. Diponegoro No. 78, Jakarta',
    phone: '087654321098',
    date: '2024-03-08 13:45',
    items: [
      { name: 'Roti Tawar', qty: 2, price: 18000 },
      { name: 'Susu UHT', qty: 1, price: 12000 },
    ],
    total: 48000,
    status: 'processing',
  },
  {
    id: 4,
    orderId: '#ORD-004',
    customer: 'Eko Prasetyo',
    address: 'Jl. Anggrek No. 3, Jakarta',
    phone: '081298765432',
    date: '2024-03-07 09:00',
    items: [
      { name: 'Kopi Sachet', qty: 10, price: 2000 },
      { name: 'Gula Pasir', qty: 1, price: 14500 },
    ],
    total: 34500,
    status: 'delivered',
    deliveredAt: '07/03/2024, 16.45',
    deliveredTs: 1709807100000,
  },
];

export function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function loadLS(key, fallback) {
  return safeJsonParse(localStorage.getItem(key), fallback);
}

export function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function persistAll(products, orders, stockInHistory, posTransactions) {
  const nextOrderId = Math.max(0, ...orders.map((o) => Number(o.id) || 0)) + 1;
  saveLS(LS_KEYS.products, products);
  saveLS(LS_KEYS.orders, orders);
  saveLS(LS_KEYS.stockInHistory, stockInHistory);
  saveLS(LS_KEYS.posTransactions, posTransactions);
  saveLS(LS_KEYS.nextOrderSeq, nextOrderId);
}

/** Muat ulang dari localStorage (sinkron dengan tab/halaman lain) */
export function loadPosSnapshot() {
  return {
    products: loadLS(LS_KEYS.products, defaultProducts),
    orders: loadLS(LS_KEYS.orders, defaultOrders),
    stockInHistory: loadLS(LS_KEYS.stockInHistory, []),
    posTransactions: loadLS(LS_KEYS.posTransactions, []),
  };
}
