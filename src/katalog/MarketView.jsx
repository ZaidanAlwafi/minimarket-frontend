import ProductImg from './ProductImg.jsx';

export default function MarketView({
  category,
  setCategory,
  sort,
  setSort,
  products,
  categories,
  filteredProducts,
  formatIDR,
  openProductDetail,
  addToCart,
}) {
  return (
    <>
      <div className="categories-sidebar">
        <h3>Kategori</h3>
        <ul>
          <li className={category === 'all' ? 'active' : ''}>
            <a
              href="#all"
              onClick={(e) => {
                e.preventDefault();
                setCategory('all');
              }}
            >
              Semua Produk <span className="count">{products.length}</span>
            </a>
          </li>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <li key={cat.id} className={category === cat.name ? 'active' : ''}>
                <a
                  href={`#cat-${cat.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCategory(cat.name);
                  }}
                >
                  {cat.name} <span className="count">{count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="customer-main">
        <div className="promo-banner">
          <img
            src="https://via.placeholder.com/900x160/6366f1/ffffff?text=Belanja+Mudah+%7C+Antar+Cepat"
            alt="Promo"
          />
        </div>

        <div className="filter-bar">
          <div className="sort-options">
            <label htmlFor="katalog-sort">Urutkan:</label>
            <select id="katalog-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Terpopuler</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name">Nama A–Z</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mm-empty" style={{ background: '#fff', borderRadius: 16, padding: 48 }}>
            <i className="fas fa-search" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: 12 }} />
            <p>Tidak ada produk yang cocok.</p>
          </div>
        ) : (
          <div className="customer-product-grid">
            {filteredProducts.map((p) => {
              const out = Number(p.stock) <= 0;
              const minSt = Number(p.minStock) > 0 ? Number(p.minStock) : 10;
              const low = !out && Number(p.stock) < minSt;
              return (
                <article
                  key={p.id}
                  className={`customer-product-card${out ? ' is-out' : ''}`}
                  onClick={() => openProductDetail(p.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openProductDetail(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  {low ? <div className="product-badge">STOK MENIPIS</div> : null}
                  {out ? <div className="product-badge sale">HABIS</div> : null}
                  <ProductImg product={p} name={p.name} size={400} />
                  <div className="card-body">
                    <h4>{p.name}</h4>
                    <p className="product-price">{formatIDR(p.price)}</p>
                    <p className="mm-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                      Stok {Number(p.stock) || 0} · {p.category || 'Umum'}
                    </p>
                    <button
                      type="button"
                      className="btn-add-cart"
                      disabled={out}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!out) addToCart(p.id, 1);
                      }}
                    >
                      <i className="fas fa-cart-plus" /> {out ? 'Habis' : 'Keranjang'}
                    </button>
                    <button
                      type="button"
                      className="btn-add-cart btn-add-cart--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductDetail(p.id);
                      }}
                    >
                      Lihat detail
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
