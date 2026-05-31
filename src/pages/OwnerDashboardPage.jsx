import { Fragment, useEffect, useRef } from 'react';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard.js';
import { OwnerOrdersTab } from '../owner/OwnerOrderSection.jsx';
import { OwnerModals } from '../owner/OwnerModals.jsx';
import ProductImg from '../katalog/ProductImg.jsx';
import SalesChart from '../owner/SalesChart.jsx';
import '../styles/owner-dashboard.css';

function roleBadge(role) {
  const r = String(role || '').toUpperCase();
  if (r.includes('OWNER')) return <span className="role-badge">OWNER</span>;
  if (r.includes('ADMIN') || r.includes('KASIR') || r.includes('EMPLOYEE'))
    return <span className="role-badge" style={{ background: '#34d399' }}>ADMIN</span>;
  if (r.includes('GUDANG')) return <span className="role-badge" style={{ background: '#fbbf24', color: 'black' }}>GUDANG</span>;
  return <span className="role-badge" style={{ background: '#a78bfa' }}>{r}</span>;
}

const SIDEBAR_GROUPS = [
  {
    items: [{ id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' }],
  },
  {
    section: 'Master Data',
    items: [
      { id: 'manajemen-user', icon: 'fa-users', label: 'Manajemen User' },
      { id: 'kategori-produk', icon: 'fa-tags', label: 'Kategori Produk' },
      { id: 'produk', icon: 'fa-box', label: 'Produk' },
      { id: 'supplier', icon: 'fa-truck', label: 'Supplier' },
    ],
  },
  {
    section: 'Inventori & Gudang',
    items: [
      { id: 'inventaris', icon: 'fa-boxes', label: 'Inventaris Stok' },
      { id: 'barang-masuk', icon: 'fa-sign-in-alt', label: 'Barang Masuk' },
      { id: 'retur-barang', icon: 'fa-sign-out-alt', label: 'Retur Barang' },
      { id: 'audit-stok', icon: 'fa-history', label: 'Audit Stok' },
    ],
  },
  {
    section: 'Aplikasi',
    items: [
      { id: 'katalog-online', icon: 'fa-store', label: 'Katalog Online' },
      { id: 'order-konfirmasi', icon: 'fa-shopping-bag', label: 'Pesanan Online' },
    ],
  },
];

export default function OwnerDashboardPage() {
  const rootRef = useRef(null);
  const welcomed = useRef(false);
  const {
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
    lowStockProducts,
    dashboardStats,
    activeSuppliersCount,
    suppliers,
    goodsReceipts,
    returns,
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
    getMinStock,
    modal,
    closeModal,
    saveKategori,
    saveProduk,
    saveSupplier,
    savePesanStok,
    saveBarangMasuk,
    saveRetur,
    salesChart,
    topProducts,
    priceSummary,
  } = useOwnerDashboard();

  useEffect(() => {
    if (welcomed.current) return;
    welcomed.current = true;
    showToast(`Selamat datang, ${ownerName}`);
  }, [ownerName, showToast]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (window.innerWidth > 1024) return;
      const root = rootRef.current;
      if (!root) return;
      const sidebar = root.querySelector('.sidebar');
      const menuToggle = root.querySelector('.menu-toggle');
      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        menuToggle &&
        !menuToggle.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [setSidebarOpen]);

  return (
    <div className="owner-dashboard-root" ref={rootRef}>
      <OwnerModals
        modal={modal}
        closeModal={closeModal}
        categories={categories}
        products={products}
        suppliers={suppliers}
        saveKategori={saveKategori}
        saveProduk={saveProduk}
        saveSupplier={saveSupplier}
        savePesanStok={savePesanStok}
        saveBarangMasuk={saveBarangMasuk}
        saveRetur={saveRetur}
      />
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <i className="fas fa-check-circle" />
        <span>{toast.message}</span>
      </div>

      <div className="dashboard-container">
        <div className={`sidebar${sidebarOpen ? ' active' : ''}`}>
          <div className="sidebar-header">
            <img src="https://via.placeholder.com/40x40/2563eb/ffffff?text=M" alt="" />
            <h3>Minimarket Pro</h3>
          </div>

          <div className="user-info">
            <div className="user-avatar">{ownerInitials}</div>
            <div>
              <div className="user-name">{ownerName}</div>
              <span className="role-badge">OWNER</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <ul>
              {SIDEBAR_GROUPS.map((group, gi) => (
                <Fragment key={gi}>
                  {group.section ? (
                    <li style={{ listStyle: 'none', marginBottom: 0 }}>
                      <div className="menu-section">{group.section}</div>
                    </li>
                  ) : null}
                  {group.items.map((item) => (
                    <li key={item.id} className={activeTab === item.id ? 'active' : ''}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          switchTab(item.id);
                        }}
                      >
                        <i className={`fas ${item.icon}`} /> {item.label}
                      </a>
                    </li>
                  ))}
                </Fragment>
              ))}
              <li style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <a
                  href="#logout"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <i className="fas fa-sign-out-alt" /> Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          <div className="top-bar">
            <button type="button" className="menu-toggle" onClick={toggleSidebar} aria-label="Menu">
              <i className="fas fa-bars" />
            </button>
            <div className="page-indicator">
              <h2>
                <i className={`fas ${pageIcon}`} /> {pageTitle}
              </h2>
            </div>
            <div className="search-bar">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchEnter()}
              />
            </div>
            <button type="button" className="notification" onClick={showNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <i className="fas fa-bell" />
              {notifCount > 0 ? <span className="badge">{notifCount}</span> : null}
            </button>
          </div>

          <div className="content">
            {activeTab === 'dashboard' && (
              <div className="tab-content active">
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                      <i className="fas fa-shopping-cart" style={{ color: '#1976d2' }} />
                    </div>
                    <div className="stat-info">
                      <h3>Rp {dashboardStats.salesToday.toLocaleString('id-ID')}</h3>
                      <p>Total Penjualan (hari ini)</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#e8f5e8' }}>
                      <i className="fas fa-chart-line" style={{ color: '#2e7d32' }} />
                    </div>
                    <div className="stat-info">
                      <h3>Rp {dashboardStats.profitToday.toLocaleString('id-ID')}</h3>
                      <p>Total Profit / Laba (hari ini)</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fff8e1' }}>
                      <i className="fas fa-tags" style={{ color: '#f9a825' }} />
                    </div>
                    <div className="stat-info">
                      <h3>Rp {dashboardStats.costToday.toLocaleString('id-ID')}</h3>
                      <p>HPP / Harga beli terjual (hari ini)</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fce4e4' }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#d32f2f' }} />
                    </div>
                    <div className="stat-info">
                      <h3>{dashboardStats.lowStockCount}</h3>
                      <p>Stok menipis</p>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 24 }}>
                  <div className="card-header">
                    <h3>Ringkasan Harga Beli &amp; Harga Jual Produk</h3>
                  </div>
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th>Harga Beli</th>
                          <th>Harga Jual</th>
                          <th>Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(priceSummary || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#6b7280', padding: 16 }}>
                              Belum ada data produk
                            </td>
                          </tr>
                        ) : (
                          priceSummary.map((p) => {
                            const margin = (Number(p.sellPrice) || 0) - (Number(p.buyPrice) || 0);
                            return (
                              <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>Rp {(Number(p.buyPrice) || 0).toLocaleString('id-ID')}</td>
                                <td>Rp {(Number(p.sellPrice) || 0).toLocaleString('id-ID')}</td>
                                <td>Rp {margin.toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row">
                  <div className="col-6">
                    <div className="card">
                      <div className="card-header">
                        <h3>Grafik Penjualan 7 Hari Terakhir</h3>
                        <span className="orders-spa__muted">Data real-time</span>
                      </div>
                      <div className="card-body">
                        <SalesChart data={salesChart} height={250} />
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card">
                      <div className="card-header">
                        <h3>Produk Terlaris</h3>
                        <span className="orders-spa__muted">{dashboardStats.txCount} pesanan hari ini</span>
                      </div>
                      <div className="card-body">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Produk</th>
                              <th>Terjual</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(topProducts || []).length === 0 ? (
                              <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280', padding: 16 }}>
                                  Belum ada penjualan tercatat
                                </td>
                              </tr>
                            ) : (
                              topProducts.map((p) => (
                                <tr key={p.productId}>
                                  <td>{p.name}</td>
                                  <td>{p.qty} pcs</td>
                                  <td>Rp {(p.total || 0).toLocaleString('id-ID')}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Produk dengan Stok Menipis</h3>
                    <a
                      href="#inv"
                      onClick={(e) => {
                        e.preventDefault();
                        switchTab('inventaris');
                      }}
                    >
                      Lihat Semua
                    </a>
                  </div>
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th>Kategori</th>
                          <th>Stok Saat Ini</th>
                          <th>Stok Minimum</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Tidak ada stok menipis
                            </td>
                          </tr>
                        ) : (
                          lowStockProducts.slice(0, 8).map((p) => (
                            <tr key={p.id}>
                              <td>{p.name}</td>
                              <td>{p.category}</td>
                              <td>{p.stock}</td>
                              <td>{getMinStock(p)}</td>
                              <td>
                                <span className="stock-badge stock-warning">Menipis</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manajemen-user' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Manajemen User</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-user')}>
                    <i className="fas fa-plus" /> Tambah User
                  </button>
                </div>
                <div className="filter-section">
                  <div className="filter-item">
                    <label>Role</label>
                    <select defaultValue="">
                      <option value="">Semua Role</option>
                      <option>Owner</option>
                      <option>Admin</option>
                      <option>Gudang</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Status</label>
                    <select defaultValue="">
                      <option value="">Semua Status</option>
                      <option>Aktif</option>
                      <option>Nonaktif</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>&nbsp;</label>
                    <button type="button" className="btn-secondary" style={{ width: '100%' }}>
                      Filter
                    </button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nama</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(staffUsers || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada staff
                            </td>
                          </tr>
                        ) : (
                          staffUsers.map((u) => (
                            <tr key={u.id}>
                              <td>#{String(u.id).padStart(3, '0')}</td>
                              <td>{u.name}</td>
                              <td>{u.email}</td>
                              <td>{roleBadge(u.role)}</td>
                              <td>
                                <span className={String(u.status || '').toLowerCase() === 'aktif' ? 'status-active' : 'status-inactive'}>
                                  {u.status || 'aktif'}
                                </span>
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => editItem('user', u.id)}>
                                  <i className="fas fa-edit" />
                                </button>
                                <button type="button" className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => deleteItem('user', u.id)}>
                                  <i className="fas fa-trash" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kategori-produk' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Kategori Produk</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-kategori')}>
                    <i className="fas fa-plus" /> Tambah Kategori
                  </button>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nama Kategori</th>
                          <th>Deskripsi</th>
                          <th>Jumlah Produk</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(categories || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada kategori
                            </td>
                          </tr>
                        ) : (
                          categories.map((c) => {
                            const count = (products || []).filter((p) => p.category === c.name).length;
                            return (
                              <tr key={c.id}>
                                <td>#{String(c.id).padStart(3, '0')}</td>
                                <td>{c.name}</td>
                                <td>{c.description}</td>
                                <td>{count}</td>
                                <td>
                                  <span className={c.status === 'nonaktif' ? 'status-inactive' : 'status-active'}>
                                    {c.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                                  </span>
                                </td>
                                <td>
                                  <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => editItem('kategori', c.id)}>
                                    <i className="fas fa-edit" />
                                  </button>
                                  <button type="button" className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => deleteItem('kategori', c.id)}>
                                    <i className="fas fa-trash" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'produk' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Daftar Produk</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-produk')}>
                    <i className="fas fa-plus" /> Tambah Produk
                  </button>
                </div>
                <div className="filter-section">
                  <div className="filter-item">
                    <label>Kategori</label>
                    <select defaultValue="">
                      <option>Semua Kategori</option>
                      {(categories || []).map((c) => (
                        <option key={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Status Stok</label>
                    <select defaultValue="">
                      <option>Semua Stok</option>
                      <option>Stok Aman</option>
                      <option>Stok Menipis</option>
                      <option>Stok Habis</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>&nbsp;</label>
                    <button type="button" className="btn-secondary" style={{ width: '100%' }}>
                      Filter
                    </button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Gambar</th>
                          <th>SKU / Kode</th>
                          <th>Nama Produk</th>
                          <th>Kategori</th>
                          <th>Supplier</th>
                          <th>Harga Beli</th>
                          <th>Harga Jual</th>
                          <th>Stok</th>
                          <th>Min.</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(products || []).length === 0 ? (
                          <tr>
                            <td colSpan={11} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada produk
                            </td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <ProductImg product={p} name={p.name} size={48} className="owner-table-product-thumb" />
                              </td>
                              <td>{p.sku || `PRD${String(p.id).padStart(3, '0')}`}</td>
                              <td>{p.name}</td>
                              <td>{p.category}</td>
                              <td>{p.supplierName || '—'}</td>
                              <td>Rp {(Number(p.buyPrice) || 0).toLocaleString('id-ID')}</td>
                              <td>Rp {(Number(p.price) || 0).toLocaleString('id-ID')}</td>
                              <td>{Number(p.stock) || 0}</td>
                              <td>{getMinStock(p)}</td>
                              <td>
                                <span className="status-active">Aktif</span>
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => editItem('produk', p.id)}>
                                  <i className="fas fa-edit" />
                                </button>
                                <button type="button" className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => deleteItem('produk', p.id)}>
                                  <i className="fas fa-trash" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'supplier' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Daftar Supplier</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-supplier')}>
                    <i className="fas fa-plus" /> Tambah Supplier
                  </button>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Kode</th>
                          <th>Nama Supplier</th>
                          <th>Kontak</th>
                          <th>Telepon</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(suppliers || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada supplier. Klik Tambah Supplier.
                            </td>
                          </tr>
                        ) : (
                          suppliers.map((s) => (
                            <tr key={s.id}>
                              <td>{s.code}</td>
                              <td>{s.name}</td>
                              <td>{s.contactPerson}</td>
                              <td>{s.phone}</td>
                              <td>{s.email}</td>
                              <td>
                                <span className={s.status === 'nonaktif' ? 'status-inactive' : 'status-active'}>
                                  {s.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                                </span>
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => editItem('supplier', s.id)}>
                                  <i className="fas fa-edit" />
                                </button>
                                <button type="button" className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => deleteItem('supplier', s.id)}>
                                  <i className="fas fa-trash" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventaris' && (
              <div className="tab-content active">
                <div className="inventory-stats">
                  <div className="inventory-stat-card">
                    <div className="inventory-stat-icon" style={{ background: '#e3f2fd' }}>
                      <i className="fas fa-boxes" style={{ color: '#1976d2' }} />
                    </div>
                    <div className="inventory-stat-info">
                      <h4>Total Produk</h4>
                      <p>{(products || []).length}</p>
                    </div>
                  </div>
                  <div className="inventory-stat-card">
                    <div className="inventory-stat-icon" style={{ background: '#fee2e2' }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }} />
                    </div>
                    <div className="inventory-stat-info">
                      <h4>Stok Menipis</h4>
                      <p>{lowStockProducts.length}</p>
                    </div>
                  </div>
                  <div className="inventory-stat-card">
                    <div className="inventory-stat-icon" style={{ background: '#d1fae5' }}>
                      <i className="fas fa-check-circle" style={{ color: '#059669' }} />
                    </div>
                    <div className="inventory-stat-info">
                      <h4>Stok Aman</h4>
                      <p>{Math.max(0, (products || []).length - lowStockProducts.length)}</p>
                    </div>
                  </div>
                  <div className="inventory-stat-card">
                    <div className="inventory-stat-icon" style={{ background: '#fef3c7' }}>
                      <i className="fas fa-truck" style={{ color: '#d97706' }} />
                    </div>
                    <div className="inventory-stat-info">
                      <h4>Supplier Aktif</h4>
                      <p>{activeSuppliersCount}</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h3>Status Stok Produk</h3>
                    <span className="orders-spa__muted">Per supplier produk</span>
                  </div>
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th>Kategori</th>
                          <th>Supplier</th>
                          <th>Harga Beli</th>
                          <th>Harga Jual</th>
                          <th>Stok Saat Ini</th>
                          <th>Stok Minimum</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(products || []).map((p) => {
                          const min = getMinStock(p);
                          const low = Number(p.stock) < min;
                          return (
                            <tr key={p.id}>
                              <td>{p.name}</td>
                              <td>{p.category}</td>
                              <td>{p.supplierName || '—'}</td>
                              <td>Rp {(Number(p.buyPrice) || 0).toLocaleString('id-ID')}</td>
                              <td>Rp {(Number(p.price) || 0).toLocaleString('id-ID')}</td>
                              <td>{p.stock}</td>
                              <td>{min}</td>
                              <td>
                                {low ? (
                                  <span className="stock-badge stock-warning">Menipis</span>
                                ) : (
                                  <span className="stock-badge stock-safe">Aman</span>
                                )}
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => openPesanStok(p.id)}>
                                  Pesan
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'barang-masuk' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Barang Masuk</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-barang-masuk')}>
                    <i className="fas fa-plus" /> Tambah Barang Masuk
                  </button>
                </div>
                <div className="filter-section">
                  <div className="filter-item">
                    <label>Supplier</label>
                    <select defaultValue="">
                      <option>Semua Supplier</option>
                      <option>PT Indofood</option>
                      <option>PT Sumber Protein</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Tanggal</label>
                    <input type="date" />
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>No. PO</th>
                          <th>Tanggal</th>
                          <th>Supplier</th>
                          <th>Produk</th>
                          <th>Jumlah</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(goodsReceipts || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada penerimaan. Gunakan tombol Tambah Barang Masuk.
                            </td>
                          </tr>
                        ) : (
                          goodsReceipts.map((r) => (
                            <tr key={r.id}>
                              <td>{r.poNumber}</td>
                              <td>{r.date}</td>
                              <td>{r.supplierName}</td>
                              <td>{r.productName}</td>
                              <td>
                                {r.qty} {r.unit || 'pcs'}
                              </td>
                              <td>
                                <span className="status-active">{r.status || 'Selesai'}</span>
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => viewDetail('po', r.id)}>
                                  <i className="fas fa-eye" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'retur-barang' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0 }}>
                  <h3>Retur Barang</h3>
                  <button type="button" className="btn-primary" onClick={() => openModal('tambah-retur')}>
                    <i className="fas fa-plus" /> Tambah Retur
                  </button>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>No. Retur</th>
                          <th>Tanggal</th>
                          <th>Supplier</th>
                          <th>Produk</th>
                          <th>Jumlah</th>
                          <th>Alasan</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(returns || []).length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                              Belum ada retur. Gunakan Tambah Retur.
                            </td>
                          </tr>
                        ) : (
                          returns.map((r) => (
                            <tr key={r.id}>
                              <td>{r.noRetur}</td>
                              <td>{r.date}</td>
                              <td>{r.supplierName}</td>
                              <td>{r.productName}</td>
                              <td>
                                {r.qty} {r.unit || 'pcs'}
                              </td>
                              <td>{r.reason}</td>
                              <td>
                                <span className="status-active">{r.status}</span>
                              </td>
                              <td>
                                <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => viewDetail('retur', r.id)}>
                                  <i className="fas fa-eye" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit-stok' && (
              <div className="tab-content active">
                <div className="card-header" style={{ marginBottom: 20, padding: 0, flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 'min(100%, 360px)' }}>
                    <h3>Audit Stok</h3>
                    <p style={{ marginTop: 10, fontSize: '0.875rem', color: '#6b7280', fontWeight: 400, lineHeight: 1.55 }}>
                      <strong>Audit stok</strong> dipakai saat Anda menghitung fisik barang di rak/gudang, lalu mencatat hasilnya dan membandingkannya
                      dengan angka di aplikasi.
                    </p>
                  </div>
                  <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => openModal('audit-baru')}>
                    <i className="fas fa-plus" /> Catat pemeriksaan
                  </button>
                </div>
                <div className="card">
                  <div className="card-body">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Produk</th>
                          <th>Stok Sistem</th>
                          <th>Stok Fisik</th>
                          <th>Selisih</th>
                          <th>Auditor</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>10 Mar 2024</td>
                          <td>Indomie Goreng</td>
                          <td>45</td>
                          <td>43</td>
                          <td>-2</td>
                          <td>Budi</td>
                          <td>
                            <button type="button" className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => viewDetail('audit', 1)}>
                              <i className="fas fa-eye" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'katalog-online' && (
              <div className="tab-content active" style={{ padding: 24 }}>
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <h3 style={{ marginBottom: 12 }}>Katalog Online (pelanggan)</h3>
                  <p style={{ color: '#6b7280', marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
                    Pratinjau toko online untuk pelanggan. Buka di tab baru agar tampilan penuh seperti pengalaman belanja customer.
                  </p>
                  <a
                    href="/katalog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                  >
                    <i className="fas fa-external-link-alt" /> Buka katalog
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'order-konfirmasi' && (
              <OwnerOrdersTab
                orders={orders}
                ownerUpdateOrderStatus={ownerUpdateOrderStatus}
                ownerVerifyPayment={ownerVerifyPayment}
                ownerCancelOnlineOrder={ownerCancelOnlineOrder}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
