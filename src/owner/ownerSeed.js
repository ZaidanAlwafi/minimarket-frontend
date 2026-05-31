import { LS_KEYS, loadLS, saveLS, defaultProducts, defaultOrders } from '../pos/posStorage.js';

export function nextId(arr) {
  const max = Array.isArray(arr) ? Math.max(0, ...arr.map((x) => Number(x.id) || 0)) : 0;
  return max + 1;
}

const DEFAULT_STAFF = [
  { id: 1, name: 'Budi Santoso', email: 'budi@email.com', role: 'OWNER', status: 'aktif' },
  { id: 2, name: 'Siti Khadijah', email: 'siti@email.com', role: 'ADMIN', status: 'aktif' },
  { id: 3, name: 'Ahmad Junaedi', email: 'ahmad@email.com', role: 'GUDANG', status: 'aktif' },
];

const DEFAULT_SUPPLIERS = [
  {
    id: 1,
    code: 'SUP001',
    name: 'PT Indofood',
    contactPerson: 'Bambang',
    phone: '021-5551234',
    email: 'indofood@email.com',
    address: 'Jl. Industri Raya No. 1, Jakarta',
    status: 'aktif',
    note: '',
  },
  {
    id: 2,
    code: 'SUP002',
    name: 'PT Sumber Protein',
    contactPerson: 'Siti',
    phone: '021-5555678',
    email: 'sumberprotein@email.com',
    address: 'Jl. Pangan Sehat No. 5, Bekasi',
    status: 'aktif',
    note: '',
  },
];

export function seedIfEmpty() {
  let prods = loadLS(LS_KEYS.products, []);
  if (!Array.isArray(prods) || prods.length === 0) {
    prods = defaultProducts.map((p) => ({ ...p, description: p.description ?? '' }));
    saveLS(LS_KEYS.products, prods);
  }

  let cats = loadLS(LS_KEYS.categories, []);
  if (!Array.isArray(cats) || cats.length === 0) {
    const prodNow = loadLS(LS_KEYS.products, defaultProducts);
    const catNames = [...new Set((prodNow || []).map((p) => p.category).filter(Boolean))];
    saveLS(LS_KEYS.categories, catNames.map((name, idx) => ({ id: idx + 1, name, description: '' })));
  }

  let staff = loadLS(LS_KEYS.staffUsers, []);
  if (!Array.isArray(staff) || staff.length === 0) {
    saveLS(LS_KEYS.staffUsers, DEFAULT_STAFF);
  }

  let orders = loadLS(LS_KEYS.orders, []);
  if (!Array.isArray(orders) || orders.length === 0) {
    saveLS(LS_KEYS.orders, defaultOrders);
  }

  if (!Array.isArray(loadLS(LS_KEYS.promos, []))) saveLS(LS_KEYS.promos, []);
  if (!Array.isArray(loadLS(LS_KEYS.customers, []))) saveLS(LS_KEYS.customers, []);

  let suppliers = loadLS(LS_KEYS.suppliers, []);
  if (!Array.isArray(suppliers) || suppliers.length === 0) {
    saveLS(LS_KEYS.suppliers, DEFAULT_SUPPLIERS);
  }

  if (!Array.isArray(loadLS(LS_KEYS.stockOrders, []))) saveLS(LS_KEYS.stockOrders, []);
  if (!Array.isArray(loadLS(LS_KEYS.goodsReceipts, []))) saveLS(LS_KEYS.goodsReceipts, []);
  if (!Array.isArray(loadLS(LS_KEYS.returns, []))) saveLS(LS_KEYS.returns, []);
  const seq = loadLS(LS_KEYS.nextPoSeq, null);
  if (seq == null || Number.isNaN(Number(seq))) saveLS(LS_KEYS.nextPoSeq, 1);
}

export function getOwnerDisplayName() {
  const staff = loadLS(LS_KEYS.staffUsers, []);
  const owner = (staff || []).find((u) => String(u.role || '').toUpperCase().includes('OWNER'));
  return owner?.name || 'Owner';
}

export function getOwnerInitials(name) {
  const parts = String(name || 'O').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name || 'O').slice(0, 2).toUpperCase();
}
