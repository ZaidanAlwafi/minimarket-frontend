import { useState, useCallback, useEffect, useMemo } from 'react';
import { api, getStoredUser } from '../api/client.js';

const TAB_TITLES = {
  dashboard: 'Ringkasan Toko',
  stok: 'Status Stok',
  orders: 'Pesanan Online',
  'barang-masuk': 'Barang Masuk',
  'update-stok': 'Update Stok',
};

const TAB_ICONS = {
  dashboard: 'fa-tachometer-alt',
  stok: 'fa-boxes',
  orders: 'fa-shopping-bag',
  'barang-masuk': 'fa-sign-in-alt',
  'update-stok': 'fa-edit',
};

export function usePosKasirState() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockInHistory, setStockInHistory] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const [stockInModal, setStockInModal] = useState(false);
  const [updateStockModal, setUpdateStockModal] = useState(false);
  const [stockInForm, setStockInForm] = useState({ product: '', quantity: '', supplier: '', note: '' });
  const [updateStockForm, setUpdateStockForm] = useState({ name: '', current: 0, newStock: '' });

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
  }, []);

  const reloadFromApi = useCallback(async () => {
    const [prods, ords, stockIn] = await Promise.all([
      api.getProducts(),
      api.getAllOrders().catch(() => []),
      api.listStockIn().catch(() => []),
    ]);
    setProducts(prods);
    setOrders(ords);
    setStockInHistory(
      stockIn.map((row) => ({
        date: row.date || '',
        product: row.productName || '',
        quantity: row.qty ?? 0,
        supplier: row.supplierName || '',
        ts: row.ts || 0,
      }))
    );
  }, []);

  useEffect(() => {
    reloadFromApi().catch((err) => showToast(err.message || 'Gagal memuat data.'));
  }, [reloadFromApi, showToast]);

  const switchTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      reloadFromApi().catch(() => {});
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    },
    [reloadFromApi]
  );

  const saveStockIn = useCallback(async () => {
    const productName = stockInForm.product;
    const quantity = parseInt(stockInForm.quantity, 10);
    const supplierName = stockInForm.supplier;
    if (!productName || !quantity) {
      window.alert('Isi produk dan jumlah!');
      return;
    }
    const target = products.find((pd) => pd.name === productName);
    if (!target) {
      window.alert('Produk tidak ditemukan.');
      return;
    }
    try {
      await api.stockIn({
        productId: target.id,
        supplierId: null,
        quantity,
        note: [supplierName, stockInForm.note].filter(Boolean).join(' · ') || '',
      });
      await reloadFromApi();
      setStockInForm({ product: '', quantity: '', supplier: '', note: '' });
      setStockInModal(false);
      showToast(`${quantity} pcs ${productName} masuk ke stok`);
    } catch (err) {
      showToast(err.message || 'Gagal barang masuk.');
    }
  }, [stockInForm, products, reloadFromApi, showToast]);

  const openUpdateStock = useCallback((name, currentStock) => {
    setUpdateStockForm({ name, current: currentStock, newStock: '' });
    setUpdateStockModal(true);
  }, []);

  const saveStockUpdate = useCallback(() => {
    const newStock = parseInt(updateStockForm.newStock, 10);
    if (Number.isNaN(newStock)) {
      window.alert('Masukkan stok baru!');
      return;
    }
    const target = products.find((p) => p.name === updateStockForm.name);
    if (target) {
      api
        .updateProduct(target.id, { ...target, stock: newStock })
        .then(() => reloadFromApi())
        .catch((err) => showToast(err.message));
    }
    setUpdateStockModal(false);
    showToast(`Stok ${updateStockForm.name} diupdate menjadi ${newStock}`);
  }, [updateStockForm, products, reloadFromApi, showToast]);

  const verifyPayment = useCallback(
    async (id, action) => {
      const label = action === 'reject' ? 'menolak' : 'memverifikasi';
      if (!window.confirm(`Yakin ${label} pembayaran pesanan ini?`)) return;
      try {
        await api.verifyPayment(id, action);
        await reloadFromApi();
        showToast(
          action === 'reject' ? 'Pembayaran ditolak.' : 'Pembayaran berhasil diverifikasi.'
        );
      } catch (err) {
        showToast(err.message);
      }
    },
    [reloadFromApi, showToast]
  );

  const updateOrderStatus = useCallback(
    async (id, newStatus) => {
      try {
        await api.updateOrderStatus(id, newStatus);
        await reloadFromApi();
        showToast('Status pesanan diperbarui.');
      } catch (err) {
        showToast(err.message);
      }
    },
    [reloadFromApi, showToast]
  );

  const cancelOnlineOrder = useCallback(
    async (id) => {
      const order = orders.find((o) => Number(o.id) === Number(id));
      if (!order || order.status !== 'pending') return;
      if (!window.confirm('Batalkan pesanan ini?')) return;
      try {
        await api.cancelOrder(id);
        await reloadFromApi();
        showToast(`Order ${order.orderId} dibatalkan`);
      } catch (err) {
        showToast(err.message);
      }
    },
    [orders, reloadFromApi, showToast]
  );

  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const pending = orders.filter((o) => o.status === 'pending').length;
    const processing = orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length;
    const done = orders.filter((o) => o.status === 'delivered').length;
    return {
      totalProducts: products.length,
      totalStock,
      pendingOrders: pending,
      recapOnlinePending: pending,
      recapOnlineProgress: processing,
      recapOnlineDone: done,
    };
  }, [products, orders]);

  const dashDate = useMemo(
    () =>
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const activityItems = useMemo(() => {
    const urgent = [];
    const recent = [];

    orders
      .filter((o) => o.status === 'pending')
      .sort((a, b) => b.id - a.id)
      .slice(0, 4)
      .forEach((o) => {
        urgent.push({
          accent: 'order',
          icon: 'fa-shopping-bag',
          title: 'Pesanan online — menunggu diproses',
          line1: `${o.orderId} · ${o.customer}`,
          line2: `Total Rp ${o.total.toLocaleString('id-ID')} · ${o.items.length} jenis barang`,
          time: o.date,
          tab: 'orders',
        });
      });

    const low = products.filter((p) => {
      const min = Number(p.minStock) > 0 ? Number(p.minStock) : 10;
      return Number(p.stock) < min;
    });
    if (low.length) {
      const shown = low.slice(0, 5);
      const rest = low.length - shown.length;
      let line1 = shown.map((p) => `${p.name} (${p.stock})`).join(' · ');
      if (rest > 0) line1 += ` · +${rest} lainnya`;
      urgent.push({
        accent: 'alert',
        icon: 'fa-exclamation-triangle',
        title: 'Stok menipis',
        line1,
        line2: 'Cek dan sesuaikan stok sebelum kehabisan di rak',
        time: 'Perlu tindakan',
        tab: 'update-stok',
      });
    }

    stockInHistory.forEach((s) => {
      recent.push({
        accent: 'in',
        icon: 'fa-sign-in-alt',
        title: 'Barang masuk',
        line1: `${s.quantity} pcs ${s.product}`,
        line2: s.supplier ? `Supplier: ${s.supplier}` : 'Masuk ke gudang / toko',
        time: s.date,
        tab: 'barang-masuk',
        sort: s.ts || 0,
      });
    });

    orders
      .filter((o) => o.status === 'delivered')
      .sort((a, b) => (b.deliveredTs || 0) - (a.deliveredTs || 0))
      .slice(0, 4)
      .forEach((o) => {
        recent.push({
          accent: 'done',
          icon: 'fa-circle-check',
          title: 'Pesanan online — selesai / sampai',
          line1: `${o.orderId} · ${o.customer}`,
          line2: `Total Rp ${o.total.toLocaleString('id-ID')} · ${o.items.length} jenis barang`,
          time: o.deliveredAt || o.date,
          tab: 'orders',
          sort: o.deliveredTs || o.id,
        });
      });

    recent.sort((a, b) => b.sort - a.sort);
    return { urgent, recent: recent.slice(0, 8) };
  }, [orders, products, stockInHistory]);

  const pageTitle = TAB_TITLES[activeTab] || 'Ringkasan Toko';
  const pageIcon = TAB_ICONS[activeTab] || 'fa-tachometer-alt';

  return {
    activeTab,
    switchTab,
    sidebarOpen,
    setSidebarOpen,
    products,
    orders,
    stockInHistory,
    toast,
    showToast,
    stockInModal,
    setStockInModal,
    updateStockModal,
    setUpdateStockModal,
    stockInForm,
    setStockInForm,
    updateStockForm,
    setUpdateStockForm,
    saveStockIn,
    saveStockUpdate,
    openUpdateStock,
    verifyPayment,
    updateOrderStatus,
    cancelOnlineOrder,
    canVerifyPayment: ['owner', 'admin'].includes(getStoredUser()?.role),
    stats,
    dashDate,
    activityItems,
    pageTitle,
    pageIcon,
    reloadFromApi,
  };
}
