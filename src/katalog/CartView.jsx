import { PAYMENT_OPTIONS } from './productImage.js';
import ProductImg from './ProductImg.jsx';

export default function CartView({
  currentCustomer,
  setView,
  cart,
  checkedCartIds,
  allCartChecked,
  toggleCartCheck,
  toggleAllCartCheck,
  updateCartItemQty,
  removeCartItem,
  selectedCartTotal,
  selectedCartItems,
  paymentMethod,
  setPaymentMethod,
  checkoutSelected,
  formatIDR,
}) {
  if (!currentCustomer) {
    return (
      <div className="customer-main">
        <h2 className="katalog-page-title">Keranjang</h2>
        <div className="mm-empty">
          <p>Silakan daftar profil terlebih dahulu.</p>
          <button type="button" className="mm-btn mm-btn-primary" onClick={() => setView('profile')}>
            Ke profil
          </button>
        </div>
      </div>
    );
  }

  const items = cart.items || [];

  if (!items.length) {
    return (
      <div className="customer-main">
        <h2 className="katalog-page-title">Keranjang</h2>
        <div className="mm-empty" style={{ background: '#fff', borderRadius: 16, padding: 48 }}>
          <i className="fas fa-shopping-cart" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: 16 }} />
          <p>Keranjang masih kosong.</p>
          <button type="button" className="mm-btn mm-btn-primary" style={{ marginTop: 16 }} onClick={() => setView('market')}>
            Mulai belanja
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = selectedCartItems.length;

  return (
    <div className="customer-main">
      <h2 className="katalog-page-title">Keranjang belanja</h2>

      <label className="katalog-select-all">
        <input
          type="checkbox"
          checked={allCartChecked}
          onChange={(e) => toggleAllCartCheck(e.target.checked)}
        />
        Pilih semua ({items.length} item)
      </label>

      <div className="katalog-cart-layout">
        <div>
          {items.map((it) => {
            const checked = checkedCartIds.has(Number(it.productId));
            return (
              <div key={it.productId} className={`katalog-cart-item${checked ? ' is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="katalog-cart-check"
                  checked={checked}
                  onChange={() => toggleCartCheck(it.productId)}
                  aria-label={`Pilih ${it.name}`}
                />
                <ProductImg product={{ name: it.name, image: it.image }} name={it.name} size={144} className="katalog-cart-item__thumb" />
                <div className="katalog-cart-item__main">
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{it.name}</div>
                  <p className="mm-muted">{formatIDR(it.price)} / item</p>
                  <div className="mm-qty" style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="mm-btn mm-btn-secondary"
                      onClick={() => updateCartItemQty(it.productId, it.qty - 1)}
                    >
                      −
                    </button>
                    <input
                      className="mm-input"
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => updateCartItemQty(it.productId, e.target.value)}
                      style={{ width: 64 }}
                    />
                    <button
                      type="button"
                      className="mm-btn mm-btn-secondary"
                      onClick={() => updateCartItemQty(it.productId, it.qty + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="mm-btn mm-btn-danger"
                      onClick={() => removeCartItem(it.productId)}
                      style={{ marginLeft: 4 }}
                    >
                      Hapus
                    </button>
                  </div>
                  <p style={{ marginTop: 8, fontWeight: 700, color: '#4f46e5' }}>
                    {formatIDR((Number(it.price) || 0) * (Number(it.qty) || 0))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="katalog-cart-summary">
          <h4>Ringkasan pesanan</h4>
          <div className="katalog-summary-row">
            <span>Item dipilih</span>
            <span>{selectedCount} produk</span>
          </div>
          <div className="katalog-summary-row is-total">
            <span>Total</span>
            <span>{formatIDR(selectedCartTotal)}</span>
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '20px 0 10px', color: '#334155' }}>
            Metode pembayaran
          </p>
          <div className="katalog-payment-options">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`katalog-payment-option${paymentMethod === opt.id ? ' is-active' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.id}
                  checked={paymentMethod === opt.id}
                  onChange={() => setPaymentMethod(opt.id)}
                />
                <div>
                  <span className="katalog-payment-option__label">
                    <i className={`fas ${opt.icon}`} style={{ marginRight: 8 }} />
                    {opt.label}
                  </span>
                  <span className="katalog-payment-option__desc">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="katalog-btn-cta"
            style={{ maxWidth: 'none', marginTop: 8 }}
            disabled={selectedCount === 0}
            onClick={checkoutSelected}
          >
            <i className="fas fa-check-circle" />
            Checkout ({selectedCount})
          </button>
          <p className="mm-muted" style={{ marginTop: 12, fontSize: '0.8rem', textAlign: 'center' }}>
            Pesanan masuk ke &quot;Pesanan Saya&quot; · status menunggu diproses
          </p>
        </aside>
      </div>
    </div>
  );
}
