const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AUTH_TOKEN_KEY = 'mm_auth_token';
export const AUTH_USER_KEY = 'mm_auth_user';

/** sessionStorage = tiap tab browser punya sesi login sendiri (bisa owner + customer bersamaan) */
function authStore() {
  return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
}

export function getToken() {
  return authStore()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function getStoredUser() {
  try {
    const raw = authStore()?.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  const store = authStore();
  if (!store) return;
  if (token) store.setItem(AUTH_TOKEN_KEY, token);
  if (user) store.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  const store = authStore();
  if (!store) return;
  store.removeItem(AUTH_TOKEN_KEY);
  store.removeItem(AUTH_USER_KEY);
}

export { homePathForRole as dashboardPathForRole } from '../auth/roleConfig.js';

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request gagal');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  registerCustomer: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => apiFetch('/auth/me'),
  getProducts: () => apiFetch('/products'),
  uploadProductImage: (dataUrl, filename) =>
    apiFetch('/products/upload-image', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    }),
  createProduct: (body) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  getCategories: () => apiFetch('/categories'),
  createCategory: (body) =>
    apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) =>
    apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
  getSuppliers: () => apiFetch('/suppliers'),
  addSupplier: (body) =>
    apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(body) }),
  getStaff: () => apiFetch('/users/staff'),
  createStaff: (body) =>
    apiFetch('/users/staff', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getMyOrders: () => apiFetch('/orders/mine'),
  getAllOrders: () => apiFetch('/orders'),
  createOrder: (body) =>
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id, status) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  cancelOrder: (id) => apiFetch(`/orders/${id}/cancel`, { method: 'POST' }),
  verifyPayment: (id, action) =>
    apiFetch(`/orders/${id}/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({ action: action === 'reject' ? 'reject' : 'verify' }),
    }),
  getCart: () => apiFetch('/cart'),
  setCartItem: (productId, qty) =>
    apiFetch('/cart/item', {
      method: 'PUT',
      body: JSON.stringify({ productId, qty }),
    }),
  clearCart: () => apiFetch('/cart', { method: 'DELETE' }),
  getStockLogs: () => apiFetch('/owner/logs'),
  getNotifications: () => apiFetch('/owner/notifications'),
  readNotification: (id) =>
    apiFetch(`/owner/notifications/${id}/read`, { method: 'PUT' }),
  stockIn: (body) => apiFetch('/stock/in', { method: 'POST', body: JSON.stringify(body) }),
  stockReturn: (body) => apiFetch('/stock/return', { method: 'POST', body: JSON.stringify(body) }),
  listStockIn: () => apiFetch('/stock/in'),
  listReturns: () => apiFetch('/stock/returns'),
  getLowStock: () => apiFetch('/stock/low'),
  getDashboardMetrics: () => apiFetch('/dashboard/metrics'),
};
