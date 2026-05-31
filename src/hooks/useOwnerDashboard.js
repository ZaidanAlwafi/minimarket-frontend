import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LS_KEYS, loadLS, saveLS } from '../pos/posStorage.js';
import { nextId } from '../owner/ownerSeed.js';
import { api, clearAuth, getStoredUser } from '../api/client.js';

const TAB_TITLES = {
  dashboard: 'Dashboard Owner',
  'manajemen-user': 'Manajemen User',
  'kategori-produk': 'Kategori Produk',
  produk: 'Daftar Produk',
  'katalog-online': 'Katalog Online',
  'order-konfirmasi': 'Pesanan Online',
  supplier: 'Daftar Supplier',
  inventaris: 'Inventaris Stok',
  'barang-masuk': 'Barang Masuk',
  'retur-barang': 'Retur Barang',
  'audit-stok': 'Audit Stok',
};

const TAB_ICONS = {
  dashboard: 'fa-tachometer-alt',
  'manajemen-user': 'fa-users',
  'kategori-produk': 'fa-tags',
  produk: 'fa-box',
  'katalog-online': 'fa-store',
  'order-konfirmasi': 'fa-shopping-bag',
  supplier: 'fa-truck',
  inventaris: 'fa-boxes',
  'barang-masuk': 'fa-sign-in-alt',
  'retur-barang': 'fa-sign-out-alt',
  'audit-stok': 'fa-history',
};

export const LOW_STOCK_THRESHOLD = 10;

export function getMinStock(p) {
  const m = Number(p?.minStock);
  return Number.isFinite(m) && m >= 0 ? m : LOW_STOCK_THRESHOLD;
}

function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function supplierCodeFromId(id) {
  return `SUP${String(id).padStart(3, '0')}`;
}

export function useOwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [dataVersion, setDataVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [returns, setReturns] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    salesToday: 0,
    costToday: 0,
    profitToday: 0,
    txCountToday: 0,
    chart: [],
    topProducts: [],
    priceSummary: [],
  });

  const refresh = useCallback(() => setDataVersion((v) => v + 1), []);

  const loadFromApi = useCallback(async () => {
    const [prods, cats, ords, sups, staff, ins, ret, metrics] = await Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getAllOrders(),
      api.getSuppliers(),
      api.getStaff(),
      api.listStockIn().catch(() => []),
      api.listReturns().catch(() => []),
      api.getDashboardMetrics().catch(() => ({
        salesToday: 0,
        costToday: 0,
        profitToday: 0,
        txCountToday: 0,
        chart: [],
        topProducts: [],
        priceSummary: [],
      })),
    ]);
    setProducts(prods);
    setCategories(cats);
    setOrders(ords);
    setSuppliers(sups);
    setStaffUsers(staff);
    setStockIns(ins);
    setReturns(ret);
    setDashboardMetrics(metrics);
  }, []);

  const toastTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
  }, []);

  useEffect(() => {
    loadFromApi().catch((err) => showToast(err.message || 'Gagal memuat data owner.'));
  }, [dataVersion, loadFromApi, showToast]);

  const closeModal = useCallback(() => setModal(null), []);

  const storedUser = getStoredUser();
  const ownerName = storedUser?.name || 'Owner';
  const ownerInitials = useMemo(() => {
    const parts = ownerName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return ownerName.slice(0, 2).toUpperCase();
  }, [ownerName]);
  const stockOrders = useMemo(() => loadLS(LS_KEYS.stockOrders, []), [dataVersion]);

  const goodsReceipts = useMemo(
    () =>
      (stockIns || []).map((r) => ({
        id: r.id,
        poNumber: `BM-${String(r.id).padStart(4, '0')}`,
        date: r.date,
        supplierName: r.supplierName,
        productName: r.productName,
        qty: r.qty,
        unit: 'pcs',
        status: 'Selesai',
      })),
    [stockIns]
  );

  const lowStockProducts = useMemo(
    () => (products || []).filter((p) => Number(p.stock) < getMinStock(p)),
    [products]
  );

  const dashboardStats = useMemo(
    () => ({
      salesToday: dashboardMetrics.salesToday || 0,
      costToday: dashboardMetrics.costToday || 0,
      profitToday: dashboardMetrics.profitToday || 0,
      txCount: dashboardMetrics.txCountToday || 0,
      productCount: (products || []).length,
      lowStockCount: lowStockProducts.length,
    }),
    [products, dashboardMetrics, lowStockProducts.length]
  );

  const activeSuppliersCount = useMemo(
    () => (suppliers || []).filter((s) => String(s.status || '').toLowerCase() === 'aktif').length,
    [suppliers]
  );

  const switchTab = useCallback(
    (tabName) => {
      setActiveTab(tabName);
      const title = TAB_TITLES[tabName] || 'Dashboard Owner';
      showToast(`Membuka ${title}`);
      if (window.innerWidth <= 1024) setSidebarOpen(false);
    },
    [showToast]
  );

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  const logout = useCallback(() => {
    if (!window.confirm('Apakah Anda yakin ingin logout?')) return;
    clearAuth();
    showToast('Logout berhasil');
    window.setTimeout(() => navigate('/'), 400);
  }, [navigate, showToast]);

  const openModal = useCallback((type) => {
    if (type === 'tambah-kategori') {
      setModal({ type: 'kategori', mode: 'add' });
      return;
    }
    if (type === 'tambah-produk') {
      setModal({ type: 'produk', mode: 'add' });
      return;
    }
    if (type === 'tambah-supplier') {
      setModal({ type: 'supplier', mode: 'add' });
      return;
    }
    if (type === 'tambah-barang-masuk') {
      setModal({ type: 'barang-masuk', mode: 'add' });
      return;
    }
    if (type === 'tambah-retur') {
      setModal({ type: 'retur', mode: 'add' });
      return;
    }
    if (type === 'tambah-user') {
      const name = window.prompt('Nama staff:');
      if (!name) return;
      const email = window.prompt('Email:') || '';
      const role = (window.prompt('Role (OWNER/ADMIN/GUDANG):', 'ADMIN') || 'ADMIN').toUpperCase();
      const password = window.prompt('Password:', '12345') || '12345';
      api
        .createStaff({ name, email, role, password })
        .then(() => {
          showToast('Akun staff ditambahkan.');
          refresh();
        })
        .catch((err) => showToast(err.message));
      return;
    }
    if (type === 'audit-baru') {
      showToast('Riwayat audit berikut masih contoh; nanti Anda bisa menghubungkannya dengan stok aplikasi secara real.');
      return;
    }
    showToast(`Membuka form ${type.replace(/-/g, ' ')}`);
  }, [showToast, refresh]);

  const openPesanStok = useCallback((productId) => {
    setModal({ type: 'pesan-stok', productId: Number(productId) });
  }, []);

  const saveKategori = useCallback(
    async (payload, editId) => {
      const name = String(payload.name || '').trim();
      if (!name) {
        showToast('Nama kategori wajib diisi.');
        return false;
      }
      const description = String(payload.description || '').trim();
      try {
        if (editId != null) {
          await api.updateCategory(editId, { name, description });
          showToast('Kategori diperbarui.');
        } else {
          await api.createCategory({ name, description });
          showToast('Kategori ditambahkan.');
        }
        refresh();
        closeModal();
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [refresh, showToast, closeModal]
  );

  const saveProduk = useCallback(
    async (payload, editId) => {
      const name = String(payload.name || '').trim();
      const category = String(payload.category || '').trim();
      if (!name || !category) {
        showToast('Nama dan kategori wajib diisi.');
        return false;
      }
      const price = Number(payload.price);
      const buyPrice = Number(payload.buyPrice ?? payload.hargaBeli);
      const stock = Number(payload.stock);
      const minStock = Number(payload.minStock);
      if (!Number.isFinite(price) || price < 0) {
        showToast('Harga jual tidak valid.');
        return false;
      }
      if (!Number.isFinite(buyPrice) || buyPrice < 0) {
        showToast('Harga beli tidak valid.');
        return false;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        showToast('Stok tidak valid.');
        return false;
      }
      const minSt = Number.isFinite(minStock) && minStock >= 0 ? minStock : LOW_STOCK_THRESHOLD;
      const description = String(payload.description || '').trim();
      const rawSup = payload.supplierId;
      const supplierId =
        rawSup !== '' && rawSup != null && !Number.isNaN(Number(rawSup)) ? Number(rawSup) : null;
      const body = {
        name,
        category,
        price,
        buyPrice,
        hargaBeli: buyPrice,
        stock,
        minStock: minSt,
        description,
        image: payload.image || '',
        supplierId,
      };

      try {
        if (editId != null) {
          await api.updateProduct(editId, body);
          showToast('Produk diperbarui.');
        } else {
          await api.createProduct(body);
          showToast('Produk ditambahkan.');
        }
        refresh();
        closeModal();
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [refresh, showToast, closeModal]
  );

  const saveSupplier = useCallback(
    async (payload, editId) => {
      const name = String(payload.name || '').trim();
      if (!name) {
        showToast('Nama supplier wajib diisi.');
        return false;
      }
      if (editId != null) {
        showToast('Update supplier belum tersedia di API; hapus lalu tambah baru jika perlu.');
        return false;
      }
      try {
        await api.addSupplier({
          name,
          phone: payload.phone || '',
          email: payload.email || '',
          address: payload.address || '',
        });
        showToast('Supplier ditambahkan.');
        refresh();
        closeModal();
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [refresh, showToast, closeModal]
  );

  const savePesanStok = useCallback(
    (payload) => {
      const productId = Number(payload.productId);
      const qty = Number(payload.qty);
      if (!productId || !Number.isFinite(qty) || qty < 1) {
        showToast('Produk dan jumlah pesanan wajib valid.');
        return false;
      }
      const prods = loadLS(LS_KEYS.products, []);
      const p = prods.find((x) => Number(x.id) === productId);
      if (!p) {
        showToast('Produk tidak ditemukan.');
        return false;
      }
      const rawSup = payload.supplierId;
      const supplierId =
        rawSup !== '' && rawSup != null && !Number.isNaN(Number(rawSup)) ? Number(rawSup) : null;
      const supList = loadLS(LS_KEYS.suppliers, []);
      const sup = supplierId != null ? supList.find((s) => Number(s.id) === supplierId) : null;
      const expectedDate = String(payload.expectedDate || '').trim();
      const note = String(payload.note || '').trim();

      const ordersList = loadLS(LS_KEYS.stockOrders, []);
      const row = {
        id: nextId(ordersList),
        ts: Date.now(),
        date: new Date().toLocaleString('id-ID'),
        productId,
        productName: p.name,
        qty,
        unit: String(payload.unit || 'pcs'),
        supplierId: sup?.id ?? null,
        supplierName: sup?.name ?? '',
        expectedDate,
        note,
        status: 'diajukan',
      };
      saveLS(LS_KEYS.stockOrders, [row, ...ordersList]);
      showToast(`Pesanan stok ${qty} ${row.unit} untuk ${p.name} dicatat.`);
      refresh();
      closeModal();
      return true;
    },
    [refresh, showToast, closeModal]
  );

  const saveBarangMasuk = useCallback(
    async (payload) => {
      const supplierId = Number(payload.supplierId);
      const productId = Number(payload.productId);
      const qty = Number(payload.qty);
      if (!supplierId || !productId || !Number.isFinite(qty) || qty < 1) {
        showToast('Supplier, produk, dan jumlah wajib diisi.');
        return false;
      }
      const note = [
        payload.receivedBy && `Penerima: ${payload.receivedBy}`,
        payload.referencePo && `Ref: ${payload.referencePo}`,
        payload.note,
      ]
        .filter(Boolean)
        .join(' · ');
      try {
        await api.stockIn({ productId, supplierId, quantity: qty, note });
        showToast(`Barang masuk: stok +${qty} unit.`);
        refresh();
        closeModal();
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [refresh, showToast, closeModal]
  );

  const saveRetur = useCallback(
    async (payload) => {
      const supplierId = Number(payload.supplierId);
      const productId = Number(payload.productId);
      const qty = Number(payload.qty);
      if (!supplierId || !productId || !Number.isFinite(qty) || qty < 1) {
        showToast('Supplier, produk, dan jumlah wajib diisi.');
        return false;
      }
      try {
        await api.stockReturn({
          productId,
          supplierId,
          quantity: qty,
          reason: payload.reason || 'Lainnya',
          adjustStock: payload.adjustStock !== false,
        });
        showToast(`Retur dicatat${payload.adjustStock !== false ? '; stok berkurang.' : '.'}`);
        refresh();
        closeModal();
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [refresh, showToast, closeModal]
  );

  const editItem = useCallback(
    (type, id) => {
      if (type === 'produk') {
        setModal({ type: 'produk', mode: 'edit', id: Number(id) });
        return;
      }
      if (type === 'kategori') {
        setModal({ type: 'kategori', mode: 'edit', id: Number(id) });
        return;
      }
      if (type === 'supplier') {
        setModal({ type: 'supplier', mode: 'edit', id: Number(id) });
        return;
      }
      if (type === 'user') {
        const users = loadLS(LS_KEYS.staffUsers, []);
        const target = users.find((u) => Number(u.id) === Number(id));
        if (!target) return;
        const name = window.prompt('Nama staff:', target.name);
        if (!name) return;
        const email = window.prompt('Email:', target.email || '') || '';
        const role = (window.prompt('Role (OWNER/ADMIN/GUDANG):', target.role || 'ADMIN') || target.role).toUpperCase();
        const status = (window.prompt('Status (aktif/nonaktif):', target.status || 'aktif') || 'aktif').toLowerCase();
        const next = users.map((u) =>
          Number(u.id) === Number(id) ? { ...u, name, email, role, status } : u
        );
        saveLS(LS_KEYS.staffUsers, next);
        showToast('Staff diperbarui.');
        refresh();
        return;
      }
      showToast(`edit ${type} ${id}`);
    },
    [refresh, showToast]
  );

  const deleteItem = useCallback(
    (type, id) => {
      if (!window.confirm(`Hapus ${type} ID: ${id}?`)) return;
      if (type === 'produk') {
        api
          .deleteProduct(id)
          .then(() => {
            showToast('Produk dihapus.');
            refresh();
          })
          .catch((err) => showToast(err.message));
        return;
      }
      if (type === 'kategori') {
        api
          .deleteCategory(id)
          .then(() => {
            showToast('Kategori dihapus.');
            refresh();
          })
          .catch((err) => showToast(err.message));
        return;
      }
      if (type === 'user') {
        showToast('Hapus staff belum tersedia di API.');
        return;
      }
      if (type === 'supplier') {
        showToast('Hapus supplier belum tersedia di API.');
        return;
      }
      showToast(`${type} berhasil dihapus`);
    },
    [refresh, showToast]
  );

  const ownerUpdateOrderStatus = useCallback(
    async (id, newStatus) => {
      try {
        await api.updateOrderStatus(id, newStatus);
        refresh();
        showToast(`Status pesanan #${id} diperbarui.`);
      } catch (err) {
        showToast(err.message);
      }
    },
    [refresh, showToast]
  );

  const ownerVerifyPayment = useCallback(
    async (id, action) => {
      const label = action === 'reject' ? 'menolak' : 'memverifikasi';
      if (!window.confirm(`Yakin ${label} pembayaran pesanan ini?`)) return;
      try {
        await api.verifyPayment(id, action);
        refresh();
        showToast(
          action === 'reject' ? 'Pembayaran ditolak.' : 'Pembayaran berhasil diverifikasi.'
        );
      } catch (err) {
        showToast(err.message);
      }
    },
    [refresh, showToast]
  );

  const ownerCancelOnlineOrder = useCallback(
    async (id) => {
      const order = (orders || []).find((o) => Number(o.id) === Number(id));
      if (!order || order.status !== 'pending') return;
      if (!window.confirm('Batalkan pesanan ini?')) return;
      try {
        await api.cancelOrder(id);
        refresh();
        showToast(`Order ${order.orderId} dibatalkan`);
      } catch (err) {
        showToast(err.message);
      }
    },
    [orders, refresh, showToast]
  );

  const viewDetail = useCallback(
    (type, id) => {
      showToast(`Melihat detail ${type} #${id}`);
    },
    [showToast]
  );

  const showNotifications = useCallback(() => {
    showToast('Menampilkan semua notifikasi');
  }, [showToast]);

  const onSearchEnter = useCallback(() => {
    showToast(`Mencari: ${searchQuery}`);
  }, [searchQuery, showToast]);

  const pageTitle = TAB_TITLES[activeTab] || 'Dashboard Owner';
  const pageIcon = TAB_ICONS[activeTab] || 'fa-tachometer-alt';

  const pendingOrders = useMemo(() => (orders || []).filter((o) => o.status === 'pending'), [orders]);
  const notifCount = Math.min(99, pendingOrders.length);

  return {
    activeTab,
    switchTab,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    toast,
    showToast,
    logout,
    ownerName,
    ownerInitials,
    products,
    categories,
    staffUsers,
    orders,
    suppliers,
    stockOrders,
    goodsReceipts,
    returns,
    dashboardMetrics,
    salesChart: dashboardMetrics.chart,
    topProducts: dashboardMetrics.topProducts,
    priceSummary: dashboardMetrics.priceSummary,
    lowStockProducts,
    dashboardStats,
    activeSuppliersCount,
    openModal,
    editItem,
    deleteItem,
    ownerUpdateOrderStatus,
    ownerVerifyPayment,
    ownerCancelOnlineOrder,
    openPesanStok,
    viewDetail,
    showNotifications,
    pageTitle,
    pageIcon,
    searchQuery,
    setSearchQuery,
    onSearchEnter,
    notifCount,
    LOW_STOCK_THRESHOLD,
    getMinStock,
    modal,
    closeModal,
    saveKategori,
    saveProduk,
    saveSupplier,
    savePesanStok,
    saveBarangMasuk,
    saveRetur,
  };
}
