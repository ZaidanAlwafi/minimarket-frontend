import { useEffect, useState } from 'react';
import ProductImg from './ProductImg.jsx';

export default function ProductDetailView({
  product,
  formatIDR,
  closeProductDetail,
  addToCart,
}) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="customer-main">
        <div className="mm-empty">Produk tidak ditemukan.</div>
        <button type="button" className="katalog-btn-back" onClick={closeProductDetail}>
          <i className="fas fa-arrow-left" /> Kembali
        </button>
      </div>
    );
  }

  const stock = Number(product.stock) || 0;
  const minSt = Number(product.minStock) > 0 ? Number(product.minStock) : 10;
  const out = stock <= 0;
  const low = !out && stock < minSt;
  const maxQty = stock;
  const desc =
    product.description?.trim() ||
    `${product.name} tersedia di Minimarket Pro. Produk berkualitas dengan pengiriman cepat ke alamat Anda.`;

  const changeQty = (delta) => {
    setQty((q) => Math.min(maxQty, Math.max(1, q + delta)));
  };

  const handleAdd = () => {
    addToCart(product.id, qty);
  };

  return (
    <div className="customer-main">
      <button type="button" className="katalog-btn-back" onClick={closeProductDetail}>
        <i className="fas fa-arrow-left" /> Kembali ke katalog
      </button>

      <article className="katalog-product-detail">
        <div className="katalog-product-detail__grid">
          <div className="katalog-product-detail__gallery">
            <ProductImg product={product} name={product.name} size={520} className="katalog-product-detail__img" />
          </div>
          <div className="katalog-product-detail__info">
            <span className="katalog-product-detail__category">{product.category || 'Umum'}</span>
            <h1 className="katalog-product-detail__title">{product.name}</h1>
            <p className="katalog-product-detail__price">{formatIDR(product.price)}</p>
            <p
              className={`katalog-product-detail__stock${out ? ' is-out' : low ? ' is-low' : ''}`}
            >
              {out ? (
                <>
                  <i className="fas fa-times-circle" /> Stok habis
                </>
              ) : low ? (
                <>
                  <i className="fas fa-exclamation-circle" /> Stok menipis — tersisa {stock} unit
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle" style={{ color: '#059669' }} /> Stok tersedia ({stock}{' '}
                  unit)
                </>
              )}
            </p>

            <ul className="katalog-product-detail__meta">
              <li>
                <span>Stok minimum</span>
                <strong>{minSt} unit</strong>
              </li>
              {product.categoryId ? (
                <li>
                  <span>ID Kategori</span>
                  <strong>{product.categoryId}</strong>
                </li>
              ) : null}
            </ul>

            <p className="katalog-product-detail__desc">{desc}</p>

            {!out && (
              <>
                <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Jumlah</p>
                <div className="katalog-detail-qty">
                  <button type="button" onClick={() => changeQty(-1)} aria-label="Kurangi">
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => {
                      const v = Math.min(maxQty, Math.max(1, Number(e.target.value) || 1));
                      setQty(v);
                    }}
                  />
                  <button type="button" onClick={() => changeQty(1)} aria-label="Tambah">
                    +
                  </button>
                </div>
                <p className="mm-muted" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
                  Subtotal: <strong>{formatIDR(product.price * qty)}</strong>
                </p>
              </>
            )}

            <button type="button" className="katalog-btn-cta" disabled={out} onClick={handleAdd}>
              <i className="fas fa-cart-plus" />
              {out ? 'Stok habis' : `Tambah ${qty} ke keranjang`}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
