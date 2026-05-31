/**
 * Peta role → dashboard utama setelah login.
 * Satu sumber kebenaran untuk redirect ProtectedRoute & Login.
 */
export const ROLE_HOME_PATHS = {
  owner: '/owner',
  admin: '/pos',
  gudang: '/pos',
  customer: '/katalog',
};

export function homePathForRole(role) {
  return ROLE_HOME_PATHS[role] || '/';
}

/** Role yang boleh mengakses setiap path (React Router). */
export const ROUTE_ACCESS = {
  '/pos': ['admin', 'gudang'],
  '/owner': ['owner'],
  /** Customer belanja; owner boleh pratinjau toko (tab Katalog Online). */
  '/katalog': ['customer', 'owner'],
};

export function rolesForPath(pathname) {
  return ROUTE_ACCESS[pathname] || null;
}

export function canAccessRoute(role, pathname) {
  const allowed = rolesForPath(pathname);
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(role);
}
