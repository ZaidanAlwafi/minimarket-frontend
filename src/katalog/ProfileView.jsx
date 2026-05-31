import { useEffect, useState } from 'react';

export default function ProfileView({
  currentCustomer,
  customerInitials,
  registerCustomer,
  saveProfile,
  logoutCustomer,
  setView,
  cartCount,
  customerOrders,
}) {
  const [form, setForm] = useState({
    name: currentCustomer?.name || '',
    email: currentCustomer?.email || '',
    phone: currentCustomer?.phone || '',
    address: currentCustomer?.address || '',
  });

  useEffect(() => {
    setForm({
      name: currentCustomer?.name || '',
      email: currentCustomer?.email || '',
      phone: currentCustomer?.phone || '',
      address: currentCustomer?.address || '',
    });
  }, [currentCustomer]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pendingOrders = (customerOrders || []).filter((o) => o.status === 'pending').length;
  const completedOrders = (customerOrders || []).filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  ).length;

  if (!currentCustomer) {
    return (
      <div className="customer-main katalog-profile-page">
        <div className="katalog-profile-hero katalog-profile-hero--guest">
          <div className="katalog-profile-hero__avatar">?</div>
          <div>
            <h2>Selamat datang</h2>
            <p>Buat akun untuk belanja, checkout, dan lacak pesanan.</p>
          </div>
        </div>
        <div className="katalog-profile-card katalog-profile-card--register">
          <h3>
            <i className="fas fa-user-plus" /> Daftar akun baru
          </h3>
          <div className="katalog-profile-grid katalog-profile-grid--single">
            <div className="katalog-profile-form">
              <div>
                <label>Nama lengkap *</label>
                <input
                  className="mm-input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label>Email *</label>
                <input
                  className="mm-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label>Telepon</label>
                <input
                  className="mm-input"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="08xxxxxxxx"
                />
              </div>
              <div>
                <label>Alamat pengiriman</label>
                <input
                  className="mm-input"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Alamat lengkap"
                />
              </div>
              <button
                type="button"
                className="katalog-btn-cta"
                onClick={() => registerCustomer(form)}
              >
                <i className="fas fa-user-plus" /> Buat akun & mulai belanja
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-main katalog-profile-page">
      <div className="katalog-profile-hero">
        <div className="katalog-profile-hero__avatar">{customerInitials}</div>
        <div className="katalog-profile-hero__text">
          <h2>{currentCustomer.name}</h2>
          <p>{currentCustomer.email}</p>
          {currentCustomer.phone ? (
            <span className="katalog-profile-hero__chip">
              <i className="fas fa-phone" /> {currentCustomer.phone}
            </span>
          ) : null}
        </div>
      </div>

      <div className="katalog-profile-stats">
        <div className="katalog-profile-stat">
          <span className="katalog-profile-stat__icon is-cart">
            <i className="fas fa-shopping-cart" />
          </span>
          <div>
            <strong>{cartCount}</strong>
            <span>Item keranjang</span>
          </div>
        </div>
        <div className="katalog-profile-stat">
          <span className="katalog-profile-stat__icon is-pending">
            <i className="fas fa-clock" />
          </span>
          <div>
            <strong>{pendingOrders}</strong>
            <span>Menunggu diproses</span>
          </div>
        </div>
        <div className="katalog-profile-stat">
          <span className="katalog-profile-stat__icon is-done">
            <i className="fas fa-check-circle" />
          </span>
          <div>
            <strong>{completedOrders}</strong>
            <span>Pesanan selesai</span>
          </div>
        </div>
        <div className="katalog-profile-stat">
          <span className="katalog-profile-stat__icon is-total">
            <i className="fas fa-box" />
          </span>
          <div>
            <strong>{customerOrders.length}</strong>
            <span>Total pesanan</span>
          </div>
        </div>
      </div>

      <div className="katalog-profile-quick">
        <button type="button" className="katalog-profile-quick__btn" onClick={() => setView('market')}>
          <i className="fas fa-store" /> Belanja
        </button>
        <button type="button" className="katalog-profile-quick__btn" onClick={() => setView('orders')}>
          <i className="fas fa-box-open" /> Pesanan saya
        </button>
      </div>

      <div className="katalog-profile-grid">
        <div className="katalog-profile-card">
          <h3>
            <i className="fas fa-id-card" /> Data diri
          </h3>
          <div className="katalog-profile-form">
            <div>
              <label>Nama *</label>
              <input className="mm-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label>Email</label>
              <input className="mm-input" type="email" value={form.email} disabled />
              <small className="mm-muted">Email tidak dapat diubah</small>
            </div>
            <button type="button" className="mm-btn mm-btn-primary" onClick={() => saveProfile(form)}>
              <i className="fas fa-save" /> Simpan perubahan
            </button>
          </div>
        </div>

        <div className="katalog-profile-card">
          <h3>
            <i className="fas fa-truck" /> Pengiriman
          </h3>
          <div className="katalog-profile-form">
            <div>
              <label>Telepon</label>
              <input className="mm-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label>Alamat lengkap</label>
              <textarea
                className="mm-input"
                rows={4}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </div>
            <button type="button" className="mm-btn mm-btn-secondary" onClick={() => saveProfile(form)}>
              <i className="fas fa-map-marker-alt" /> Simpan alamat
            </button>
          </div>
        </div>
      </div>

      <div className="katalog-profile-logout-card">
        <div>
          <h3>Keluar dari akun</h3>
          <p className="mm-muted">Anda perlu login lagi untuk checkout dan melihat pesanan.</p>
        </div>
        <button type="button" className="mm-btn mm-btn-danger" onClick={logoutCustomer}>
          <i className="fas fa-sign-out-alt" /> Keluar
        </button>
      </div>
    </div>
  );
}
