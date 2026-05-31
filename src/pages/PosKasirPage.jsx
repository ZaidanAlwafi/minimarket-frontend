import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosKasirState } from '../pos/usePosKasirState.js';
import { clearAuth } from '../api/client.js';
import OnlineOrdersSPA from '../components/OnlineOrdersSPA.jsx';
import '../styles/pos-kasir.css';
import '../styles/owner-dashboard.css';

export default function PosKasirPage() {
  const navigate = useNavigate();
  const s = usePosKasirState();

  useEffect(() => {
    const q = (e) => {
      const sidebar = document.querySelector('.pos-kasir-root .sidebar');
      const toggle = document.querySelector('.pos-kasir-root .menu-toggle');
      if (
        window.innerWidth <= 768 &&
        sidebar &&
        !sidebar.contains(e.target) &&
        toggle &&
        !toggle.contains(e.target)
      ) {
        s.setSidebarOpen(false);
      }
    };
    document.addEventListener('click', q);
    return () => document.removeEventListener('click', q);
  }, [s.setSidebarOpen]);

  const onSearchKey = (e) => {
    if (e.key === 'Enter') s.showToast(`Mencari: ${e.target.value}`);
  };

  const logout = () => {
    if (window.confirm('Logout?')) {
      clearAuth();
      s.showToast('Logout berhasil');
      window.setTimeout(() => navigate('/'), 400);
    }
  };

  const openStockIn = () => {
    const first = s.products[0]?.name || '';
    s.setStockInForm((f) => ({ ...f, product: f.product || first }));
    s.setStockInModal(true);
  };

  const tab = (name, active) => `tab-content${active ? ' active' : ''}`;

  return (
    <div className="pos-kasir-root">
      <div className={`toast${s.toast.show ? ' show' : ''}`} id="toast">
        <i className="fas fa-check-circle" />
        <span id="toastMessage">{s.toast.msg}</span>
      </div>

      <div className={`modal${s.stockInModal ? ' active' : ''}`} id="stockInModal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              <i className="fas fa-sign-in-alt" /> Tambah Barang Masuk
            </h3>
            <button type="button" className="modal-close" onClick={() => s.setStockInModal(false)}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Pilih Produk</label>
              <select
                value={s.stockInForm.product}
                onChange={(e) => s.setStockInForm((f) => ({ ...f, product: e.target.value }))}
              >
                {s.products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Jumlah Masuk</label>
              <input
                type="number"
                placeholder="Jumlah"
                value={s.stockInForm.quantity}
                onChange={(e) => s.setStockInForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                placeholder="Nama supplier"
                value={s.stockInForm.supplier}
                onChange={(e) => s.setStockInForm((f) => ({ ...f, supplier: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Catatan</label>
              <textarea
                rows={2}
                placeholder="Catatan (opsional)"
                value={s.stockInForm.note}
                onChange={(e) => s.setStockInForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => s.setStockInModal(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={() => s.saveStockIn()}>
              Simpan
            </button>
          </div>
        </div>
      </div>

      <div className={`modal${s.updateStockModal ? ' active' : ''}`} id="updateStockModal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              <i className="fas fa-edit" /> Update Stok
            </h3>
            <button type="button" className="modal-close" onClick={() => s.setUpdateStockModal(false)}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Produk</label>
              <input type="text" readOnly style={{ background: '#f3f4f6' }} value={s.updateStockForm.name} />
            </div>
            <div className="form-group">
              <label>Stok Saat Ini</label>
              <input type="text" readOnly style={{ background: '#f3f4f6' }} value={String(s.updateStockForm.current)} />
            </div>
            <div className="form-group">
              <label>Stok Baru</label>
              <input
                type="number"
                placeholder="Masukkan stok baru"
                value={s.updateStockForm.newStock}
                onChange={(e) => s.setUpdateStockForm((f) => ({ ...f, newStock: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => s.setUpdateStockModal(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={() => s.saveStockUpdate()}>
              Update
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className={`sidebar${s.sidebarOpen ? ' active' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand-logo" aria-hidden="true">
              <i className="fas fa-store" />
            </div>
            <h3>Minimarket Pro</h3>
          </div>
          <div className="user-info">
            <div className="user-avatar">AD</div>
            <div>
              <div className="user-name">Admin Store</div>
              <span className="role-badge">ADMIN</span>
            </div>
          </div>
          <nav className="sidebar-menu">
            <ul>
              {[
                ['dashboard', 'fa-tachometer-alt', 'Dashboard'],
                ['barang-masuk', 'fa-sign-in-alt', 'Barang Masuk'],
                ['stok', 'fa-boxes', 'Lihat Stok'],
                ['orders', 'fa-shopping-bag', 'Pesanan Online'],
                ['update-stok', 'fa-edit', 'Update Stok'],
              ].map(([id, icon, label]) => (
                <li key={id} className={s.activeTab === id ? 'active' : ''} data-tab={id}>
                  <a
                    role="button"
                    tabIndex={0}
                    onClick={() => s.switchTab(id)}
                    onKeyDown={(e) => e.key === 'Enter' && s.switchTab(id)}
                  >
                    <i className={`fas ${icon}`} /> {label}
                  </a>
                </li>
              ))}
              <li className="sidebar-logout">
                <a role="button" tabIndex={0} onClick={logout}>
                  <i className="fas fa-sign-out-alt" /> Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          <div className="top-bar">
            <div className="menu-toggle" onClick={() => s.setSidebarOpen((v) => !v)}>
              <i className="fas fa-bars" />
            </div>
            <div className="page-indicator">
              <h2 id="pageTitle">
                <i className={`fas ${s.pageIcon}`} /> {s.pageTitle}
              </h2>
            </div>
            <div className="search-bar">
              <i className="fas fa-search" />
              <input type="text" id="globalSearch" placeholder="Cari..." onKeyUp={onSearchKey} />
            </div>
            <div className="notification" onClick={() => s.showToast('Menampilkan semua notifikasi')}>
              <i className="fas fa-bell" />
              <span className="badge">3</span>
            </div>
          </div>

          <div className="content">
            <div id="tab-dashboard" className={tab('dashboard', s.activeTab === 'dashboard')}>
              <div className="dashboard-hero">
                <h1 className="dashboard-hero__title">Selamat datang, Admin Store</h1>
                <p className="dashboard-hero__lead">Pantau stok, rekap transaksi, dan pesanan online dari satu tempat.</p>
                <div className="dashboard-hero-meta">
                  <span id="dashDate">{s.dashDate}</span>
                  <span>
                    <i className="fas fa-store" /> Minimarket Pro
                  </span>
                </div>
              </div>
              <div className="stat-cards">
                <div className="stat-card stat-card--sku">
                  <div className="stat-icon" style={{ background: 'linear-gradient(145deg,#dbeafe,#eff6ff)' }}>
                    <i className="fas fa-box" style={{ color: '#1d4ed8' }} />
                  </div>
                  <div className="stat-info">
                    <h3 id="totalProducts">{s.stats.totalProducts}</h3>
                    <p>SKU aktif</p>
                  </div>
                </div>
                <div className="stat-card stat-card--stock">
                  <div className="stat-icon" style={{ background: 'linear-gradient(145deg,#d1fae5,#ecfdf5)' }}>
                    <i className="fas fa-cubes" style={{ color: '#047857' }} />
                  </div>
                  <div className="stat-info">
                    <h3 id="totalStock">{s.stats.totalStock}</h3>
                    <p>Total unit stok</p>
                  </div>
                </div>
                <div className="stat-card stat-card--online">
                  <div className="stat-icon" style={{ background: 'linear-gradient(145deg,#e0f2fe,#f0f9ff)' }}>
                    <i className="fas fa-globe" style={{ color: '#0369a1' }} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-channel">Saluran online</span>
                    <h3 id="pendingOrders">{s.stats.pendingOrders}</h3>
                    <p>Pesanan menunggu diproses</p>
                  </div>
                </div>
                <div className="stat-card stat-card--offline">
                  <div className="stat-icon" style={{ background: 'linear-gradient(145deg,#dcfce7,#f0fdf4)' }}>
                    <i className="fas fa-check-circle" style={{ color: '#15803d' }} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-channel">Pesanan selesai</span>
                    <h3 id="ordersDoneCount">{s.stats.recapOnlineDone}</h3>
                    <p>Sudah sampai ke pelanggan</p>
                  </div>
                </div>
              </div>
              <div className="card recap-card">
                <div className="card-header">
                  <div>
                    <h3>Rekap transaksi</h3>
                    <p className="recap-note">
                      Jumlah transaksi &amp; status per saluran — total omzet gabungan tidak di ringkasan ini
                    </p>
                  </div>
                </div>
                <div className="card-body" style={{ paddingTop: '4px' }}>
                  <div className="recap-grid">
                    <div className="recap-panel recap-panel--online" style={{ gridColumn: '1 / -1' }}>
                      <h4>
                        <i className="fas fa-globe" /> Pesanan online
                      </h4>
                      <div className="recap-stats">
                        <div className="recap-stat">
                          <div className="recap-stat-value" id="recapOnlinePending">
                            {s.stats.recapOnlinePending}
                          </div>
                          <div className="recap-stat-label">Menunggu</div>
                        </div>
                        <div className="recap-stat">
                          <div className="recap-stat-value" id="recapOnlineProgress">
                            {s.stats.recapOnlineProgress}
                          </div>
                          <div className="recap-stat-label">Diproses / kirim</div>
                        </div>
                        <div className="recap-stat">
                          <div className="recap-stat-value" id="recapOnlineDone">
                            {s.stats.recapOnlineDone}
                          </div>
                          <div className="recap-stat-label">Selesai / sampai</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card activity-card">
                <div className="card-header">
                  <div>
                    <h3>Aktivitas terbaru</h3>
                    <p className="activity-subtitle">Perhatian operasional &amp; jejak aktivitas terkini</p>
                  </div>
                </div>
                <div className="card-body" style={{ paddingTop: '12px' }}>
                  <div id="activityFeed" className="activity-feed" aria-live="polite">
                    {s.activityItems.urgent.length === 0 && s.activityItems.recent.length === 0 ? (
                      <div className="activity-empty">
                        <i className="fas fa-clipboard-list" />
                        <p>
                          Belum ada pesanan pending, stok menipis, atau aktivitas. Pantau pesanan online atau catat
                          barang masuk.
                        </p>
                        <div className="activity-empty-actions">
                          <button type="button" className="btn-primary" onClick={() => s.switchTab('orders')}>
                            <i className="fas fa-shopping-bag" /> Pesanan online
                          </button>
                          <button type="button" className="btn-secondary" onClick={() => s.switchTab('barang-masuk')}>
                            <i className="fas fa-sign-in-alt" /> Barang masuk
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {s.activityItems.urgent.length > 0 && (
                          <>
                            <div className="activity-section-label">
                              <i className="fas fa-bolt" /> Perlu perhatian
                            </div>
                            {s.activityItems.urgent.map((row, idx) => (
                              <ActivityRow key={`u-${idx}`} row={row} onGo={() => s.switchTab(row.tab)} />
                            ))}
                          </>
                        )}
                        {s.activityItems.recent.length > 0 && (
                          <>
                            <div className="activity-section-label">
                              <i className="fas fa-clock" /> Aktivitas terkini
                            </div>
                            {s.activityItems.recent.map((row, idx) => (
                              <ActivityRow key={`r-${idx}`} row={row} onGo={() => s.switchTab(row.tab)} />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div id="tab-stok" className={tab('stok', s.activeTab === 'stok')}>
              <div className="page-section">
                <div>
                  <h3>Status stok barang</h3>
                  <p className="page-section-desc">Monitor level inventori dan status ketersediaan di rak</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body card-body--flush table-wrap">
                  <table className="data-table" id="stockTable">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Stok Saat Ini</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody id="stockTableBody">
                      {s.products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.stock}</td>
                          <td>
                            {p.stock <= 10 ? (
                              <span style={{ color: 'red' }}>Menipis</span>
                            ) : (
                              <span style={{ color: 'green' }}>Aman</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="tab-orders" className={tab('orders', s.activeTab === 'orders')}>
              <div className="page-section">
                <div>
                  <h3>Pesanan online</h3>
                  <p className="page-section-desc">
                    Verifikasi pembayaran manual, lalu proses hingga selesai — semua dalam satu halaman.
                  </p>
                </div>
              </div>
              <OnlineOrdersSPA
                orders={s.orders}
                canVerifyPayment={s.canVerifyPayment}
                onVerifyPayment={s.verifyPayment}
                onUpdateStatus={s.updateOrderStatus}
                onCancel={s.cancelOnlineOrder}
              />
            </div>

            <div id="tab-barang-masuk" className={tab('barang-masuk', s.activeTab === 'barang-masuk')}>
              <div className="page-section">
                <div>
                  <h3>Barang masuk</h3>
                  <p className="page-section-desc">Catat pemasukan stok dari supplier</p>
                </div>
                <button type="button" className="btn-primary" onClick={openStockIn}>
                  <i className="fas fa-plus" /> Tambah barang masuk
                </button>
              </div>
              <div className="card">
                <div className="card-body card-body--flush table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Produk</th>
                        <th>Jumlah</th>
                        <th>Supplier</th>
                      </tr>
                    </thead>
                    <tbody id="stockInHistory">
                      {s.stockInHistory.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.product}</td>
                          <td>{row.quantity}</td>
                          <td>{row.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="tab-update-stok" className={tab('update-stok', s.activeTab === 'update-stok')}>
              <div className="page-section">
                <div>
                  <h3>Update stok</h3>
                  <p className="page-section-desc">Sesuaikan jumlah stok per SKU secara manual</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body card-body--flush table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Stok Saat Ini</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="updateStockTableBody">
                      {s.products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.stock}</td>
                          <td>
                            <button type="button" className="btn-primary" onClick={() => s.openUpdateStock(p.name, p.stock)}>
                              Update Stok
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ row, onGo }) {
  const accentKey = row.accent === 'done' ? 'done' : row.accent;
  const cls = `activity-item activity-item--${accentKey}`;
  const tabLabel = { orders: 'Pesanan', 'update-stok': 'Stok', 'barang-masuk': 'Barang masuk' };
  const go = tabLabel[row.tab] || 'Buka';
  return (
    <button type="button" className={cls} onClick={onGo}>
      <div className="activity-item__icon">
        <i className={`fas ${row.icon}`} />
      </div>
      <div className="activity-item__body">
        <div className="activity-item__title">{row.title}</div>
        <div className="activity-item__line">{row.line1}</div>
        {row.line2 ? <div className="activity-item__line muted">{row.line2}</div> : null}
      </div>
      <div className="activity-item__aside">
        <span className="activity-item__time">{row.time}</span>
        <span className="activity-item__go">
          {go} <i className="fas fa-chevron-right" style={{ fontSize: '0.65rem' }} />
        </span>
      </div>
    </button>
  );
}
