export default function KatalogNav({
  navView,
  setView,
  search,
  setSearch,
  cartCount,
  goCart,
  currentCustomer,
  customerInitials,
}) {
  return (
    <nav className="customer-nav">
      <div className="nav-container">
        <div className="logo">
          <img src="https://via.placeholder.com/40x40/6366f1/ffffff?text=M" alt="" />
          <span>Minimarket Pro</span>
        </div>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setView('market');
            }}
          />
          <button type="button" onClick={() => setView('market')} aria-label="Cari">
            <i className="fas fa-search" />
          </button>
        </div>

        <div className="nav-menu">
          <a
            href="#beranda"
            className={navView === 'market' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setView('market');
            }}
          >
            <i className="fas fa-home" /> Beranda
          </a>
          <a
            href="#keranjang"
            className={navView === 'cart' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              goCart();
            }}
          >
            <i className="fas fa-shopping-cart" /> Keranjang
            {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
          </a>
          <a
            href="#pesanan"
            className={navView === 'orders' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              if (!currentCustomer) {
                setView('profile');
                return;
              }
              setView('orders');
            }}
          >
            <i className="fas fa-box" /> Pesanan Saya
          </a>
        </div>

        <div
          className="nav-profile"
          role="button"
          tabIndex={0}
          onClick={() => setView('profile')}
          onKeyDown={(e) => e.key === 'Enter' && setView('profile')}
        >
          <img
            src={`https://via.placeholder.com/35x35/6366f1/ffffff?text=${customerInitials}`}
            alt=""
          />
          <span>{currentCustomer?.name || 'Guest'}</span>
        </div>
      </div>
    </nav>
  );
}
