import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearAuth, getStoredUser } from '../api/client.js';
import { paymentLabel } from '../katalog/productImage.js';

export function formatIDR(n) {
  return `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`;
}

function statusMeta(status) {
  const map = {
    pending: { label: 'Menunggu diproses', cls: 'is-pending' },
    processing: { label: 'Diproses', cls: '' },
    shipped: { label: 'Dikirim', cls: '' },
    delivered: { label: 'Selesai / Sampai', cls: 'is-delivered' },
    cancelled: { label: 'Dibatalkan', cls: 'is-cancelled' },
  };
  return map[status] || { label: status, cls: '' };
}

export function useKatalog() {
  const navigate = useNavigate();
  const [view, setView] = useState('market');
  const [detailProductId, setDetailProductId] = useState(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [toast, setToast] = useState('');
  const [checkedCartIds, setCheckedCartIds] = useState(() => new Set());
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [currentCustomer, setCurrentCustomer] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  }, []);

  const reloadAll = useCallback(async () => {
    try {
      const [prods, cats, ords, cartRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getMyOrders(),
        api.getCart(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setCart(cartRes);
    } catch (err) {
      showToast(err.message || 'Gagal memuat data.');
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const me = await api.me();
        if (!cancelled) setCurrentCustomer(me.user);
        await reloadAll();
      } catch {
        if (!cancelled) showToast('Sesi tidak valid. Silakan login ulang.');
        clearAuth();
        navigate('/');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadAll, showToast]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const cartCount = useMemo(
    () => (cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      (cart.items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [cart]
  );

  const selectedCartItems = useMemo(
    () => (cart.items || []).filter((it) => checkedCartIds.has(Number(it.productId))),
    [cart.items, checkedCartIds]
  );

  const selectedCartTotal = useMemo(
    () =>
      selectedCartItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [selectedCartItems]
  );

  const allCartChecked = useMemo(() => {
    const items = cart.items || [];
    if (!items.length) return false;
    return items.every((it) => checkedCartIds.has(Number(it.productId)));
  }, [cart.items, checkedCartIds]);

  const detailProduct = useMemo(() => {
    if (detailProductId == null) return null;
    return (
      (products || []).find(
        (p) =>
          Number(p.id) === Number(detailProductId) ||
          Number(p.product_id) === Number(detailProductId)
      ) || null
    );
  }, [products, detailProductId]);

  const customerOrders = useMemo(() => orders || [], [orders]);

  const filteredProducts = useMemo(() => {
    let list = [...(products || [])];
    const q = search.trim().toLowerCase();
    if (category !== 'all') {
      list = list.filter((p) => String(p.category) === category);
    }
    if (q) {
      list = list.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.description || '').toLowerCase().includes(q)
      );
    }
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name') list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return list;
  }, [products, category, search, sort]);

  useEffect(() => {
    const ids = (cart.items || []).map((it) => Number(it.productId));
    setCheckedCartIds((prev) => {
      if (!ids.length) return new Set();
      const idSet = new Set(ids);
      const next = new Set([...prev].filter((id) => idSet.has(id)));
      for (const id of ids) {
        if (!prev.has(id)) next.add(id);
      }
      return next;
    });
  }, [cart.items]);

  const openProductDetail = useCallback((productId) => {
    setDetailProductId(Number(productId));
    setView('detail');
  }, []);

  const closeProductDetail = useCallback(() => {
    setDetailProductId(null);
    setView('market');
  }, []);

  const addToCart = useCallback(
    async (productId, qty = 1) => {
      if (!currentCustomer) {
        setView('profile');
        showToast('Login sebagai customer untuk belanja.');
        return false;
      }
      const product = (products || []).find((p) => Number(p.id) === Number(productId));
      if (!product) {
        showToast('Produk tidak ditemukan.');
        return false;
      }
      if (Number(product.stock) <= 0) {
        showToast('Stok habis.');
        return false;
      }
      const existing = (cart.items || []).find((it) => Number(it.productId) === Number(productId));
      const nextQty = (existing?.qty || 0) + Math.max(1, Number(qty) || 1);
      if (nextQty > Number(product.stock)) {
        showToast(`Stok tersedia hanya ${product.stock}.`);
        return false;
      }
      try {
        const res = await api.setCartItem(productId, nextQty);
        setCart(res);
        setCheckedCartIds((prev) => new Set([...prev, Number(productId)]));
        showToast(`${product.name} masuk keranjang.`);
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [currentCustomer, products, cart.items, showToast]
  );

  const updateCartItemQty = useCallback(
    async (productId, nextQty) => {
      if (!currentCustomer) return;
      const product = (products || []).find((p) => Number(p.id) === Number(productId));
      const qty = Math.max(0, Number(nextQty) || 0);
      if (qty > 0 && product && qty > Number(product.stock)) {
        showToast(`Stok tersedia hanya ${product.stock}.`);
        return;
      }
      try {
        const res = await api.setCartItem(productId, qty);
        setCart(res);
        if (qty === 0) {
          setCheckedCartIds((prev) => {
            const n = new Set(prev);
            n.delete(Number(productId));
            return n;
          });
        }
        await reloadAll();
      } catch (err) {
        showToast(err.message);
      }
    },
    [currentCustomer, products, showToast, reloadAll]
  );

  const removeCartItem = useCallback(
    (productId) => {
      updateCartItemQty(productId, 0);
    },
    [updateCartItemQty]
  );

  const toggleCartCheck = useCallback((productId) => {
    const id = Number(productId);
    setCheckedCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllCartCheck = useCallback(
    (checked) => {
      if (checked) {
        setCheckedCartIds(new Set((cart.items || []).map((it) => Number(it.productId))));
      } else {
        setCheckedCartIds(new Set());
      }
    },
    [cart.items]
  );

  const checkoutSelected = useCallback(async () => {
    if (!currentCustomer) {
      setView('profile');
      return;
    }
    const items = (cart.items || []).filter((it) => checkedCartIds.has(Number(it.productId)));
    if (!items.length) {
      showToast('Pilih minimal satu produk untuk checkout.');
      return;
    }
    try {
      const data = await api.createOrder({
        items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
        paymentMethod,
        shippingAddress: currentCustomer.address,
      });
      showToast(`Pesanan ${data.order?.orderId || ''} dibuat.`);
      setView('orders');
      await reloadAll();
      setCheckedCartIds(new Set());
    } catch (err) {
      showToast(err.message);
    }
  }, [currentCustomer, cart.items, checkedCartIds, paymentMethod, showToast, reloadAll]);

  const cancelOrder = useCallback(
    async (orderIdNum) => {
      if (!currentCustomer) return;
      const target = (orders || []).find((o) => Number(o.id) === Number(orderIdNum));
      if (!target) return;
      if (target.status !== 'pending') {
        showToast('Hanya pesanan menunggu yang bisa dibatalkan.');
        return;
      }
      try {
        await api.cancelOrder(orderIdNum);
        showToast('Pesanan dibatalkan.');
        await reloadAll();
      } catch (err) {
        showToast(err.message);
      }
    },
    [currentCustomer, orders, showToast, reloadAll]
  );

  const registerCustomer = useCallback(
    async ({ name, phone, address }) => {
      const n = String(name || '').trim();
      if (!n) {
        showToast('Nama wajib diisi.');
        return false;
      }
      try {
        const data = await api.updateProfile({
          name: n,
          phone: phone || '',
          address: address || '',
        });
        setCurrentCustomer(data.user);
        showToast('Profil tersimpan.');
        setView('market');
        return true;
      } catch (err) {
        showToast(err.message);
        return false;
      }
    },
    [showToast]
  );

  const saveProfile = registerCustomer;

  const logoutCustomer = useCallback(() => {
    if (!window.confirm('Logout customer?')) return;
    clearAuth();
    navigate('/');
  }, [navigate]);

  const goCart = useCallback(() => {
    if (!currentCustomer) {
      setView('profile');
      showToast('Lengkapi profil customer terlebih dahulu.');
      return;
    }
    setView('cart');
  }, [currentCustomer, showToast]);

  const customerInitials = useMemo(() => {
    const name = currentCustomer?.name || 'Guest';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [currentCustomer]);

  const navView = view === 'detail' ? 'market' : view;

  return {
    loading,
    view,
    navView,
    setView,
    detailProductId,
    detailProduct,
    openProductDetail,
    closeProductDetail,
    category,
    setCategory,
    search,
    setSearch,
    sort,
    setSort,
    products,
    categories,
    filteredProducts,
    currentCustomer,
    customerInitials,
    cart,
    cartCount,
    cartTotal,
    selectedCartItems,
    selectedCartTotal,
    checkedCartIds,
    allCartChecked,
    toggleCartCheck,
    toggleAllCartCheck,
    paymentMethod,
    setPaymentMethod,
    customerOrders,
    addToCart,
    updateCartItemQty,
    removeCartItem,
    checkoutSelected,
    cancelOrder,
    registerCustomer,
    saveProfile,
    logoutCustomer,
    goCart,
    showToast,
    toast,
    formatIDR,
    statusMeta,
  };
}
