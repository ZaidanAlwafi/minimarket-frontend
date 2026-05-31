import { Link } from 'react-router-dom';
import { getStoredUser } from '../api/client.js';
import { homePathForRole } from '../auth/roleConfig.js';
import { useKatalog } from '../hooks/useKatalog.js';
import KatalogNav from '../katalog/KatalogNav.jsx';
import MarketView from '../katalog/MarketView.jsx';
import ProductDetailView from '../katalog/ProductDetailView.jsx';
import CartView from '../katalog/CartView.jsx';
import OrdersView from '../katalog/OrdersView.jsx';
import ProfileView from '../katalog/ProfileView.jsx';
import '../styles/katalog-panels.css';
import '../styles/katalog-store.css';

export default function KatalogOnlinePage() {
  const k = useKatalog();
  const sessionUser = getStoredUser();
  const staffHome = sessionUser?.role ? homePathForRole(sessionUser.role) : null;
  const isCustomerSession = sessionUser?.role === 'customer';
  const showSidebar = k.view === 'market';

  return (
    <div className="katalog-root">
      <KatalogNav
        navView={k.navView}
        setView={k.setView}
        search={k.search}
        setSearch={k.setSearch}
        cartCount={k.cartCount}
        goCart={k.goCart}
        currentCustomer={k.currentCustomer}
        customerInitials={k.customerInitials}
      />

      <div className={`customer-container${showSidebar ? '' : ' customer-container--full'}`}>
        {k.view === 'market' && (
          <MarketView
            category={k.category}
            setCategory={k.setCategory}
            sort={k.sort}
            setSort={k.setSort}
            products={k.products}
            categories={k.categories}
            filteredProducts={k.filteredProducts}
            formatIDR={k.formatIDR}
            openProductDetail={k.openProductDetail}
            addToCart={k.addToCart}
          />
        )}

        {k.view === 'detail' && (
          k.loading && !k.detailProduct ? (
            <div className="customer-main">
              <p className="mm-muted">Memuat detail produk...</p>
            </div>
          ) : (
            <ProductDetailView
              product={k.detailProduct}
              formatIDR={k.formatIDR}
              closeProductDetail={k.closeProductDetail}
              addToCart={k.addToCart}
            />
          )
        )}

        {k.view === 'cart' && (
          <CartView
            currentCustomer={k.currentCustomer}
            setView={k.setView}
            cart={k.cart}
            checkedCartIds={k.checkedCartIds}
            allCartChecked={k.allCartChecked}
            toggleCartCheck={k.toggleCartCheck}
            toggleAllCartCheck={k.toggleAllCartCheck}
            updateCartItemQty={k.updateCartItemQty}
            removeCartItem={k.removeCartItem}
            selectedCartTotal={k.selectedCartTotal}
            selectedCartItems={k.selectedCartItems}
            paymentMethod={k.paymentMethod}
            setPaymentMethod={k.setPaymentMethod}
            checkoutSelected={k.checkoutSelected}
            formatIDR={k.formatIDR}
          />
        )}

        {k.view === 'orders' && (
          <OrdersView
            currentCustomer={k.currentCustomer}
            setView={k.setView}
            customerOrders={k.customerOrders}
            cancelOrder={k.cancelOrder}
            formatIDR={k.formatIDR}
            statusMeta={k.statusMeta}
          />
        )}

        {k.view === 'profile' && (
          <ProfileView
            currentCustomer={k.currentCustomer}
            customerInitials={k.customerInitials}
            registerCustomer={k.registerCustomer}
            saveProfile={k.saveProfile}
            logoutCustomer={k.logoutCustomer}
            setView={k.setView}
            cartCount={k.cartCount}
            customerOrders={k.customerOrders}
          />
        )}
      </div>

      <footer className="katalog-footer-links">
        {!sessionUser ? (
          <Link to="/">← Login</Link>
        ) : isCustomerSession ? (
          <Link to="/">← Keluar / ganti akun</Link>
        ) : staffHome ? (
          <Link to={staffHome}>← Kembali ke dashboard {sessionUser.role}</Link>
        ) : null}
        {sessionUser?.role === 'owner' ? (
          <>
            {' · '}
            <span className="katalog-footer-preview">Mode pratinjau katalog (owner)</span>
          </>
        ) : null}
      </footer>

      {k.toast ? <div className="katalog-toast">{k.toast}</div> : null}
    </div>
  );
}
