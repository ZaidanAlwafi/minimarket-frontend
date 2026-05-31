import { useState } from 'react';
import { paymentLabel } from './productImage.js';
import { CancelReasonModal, CancelConfirmModal } from './CancelOrderModals.jsx';

function buildReasonSummary({ reasonLabel, reasonNote }) {
  if (!reasonLabel) return '';
  if (reasonNote) return `${reasonLabel} — ${reasonNote}`;
  return reasonLabel;
}

function statusIcon(status) {
  if (status === 'pending') return 'fa-clock';
  if (status === 'cancelled') return 'fa-ban';
  if (status === 'delivered' || status === 'completed') return 'fa-check-circle';
  return 'fa-truck';
}

export default function OrdersView({
  currentCustomer,
  setView,
  customerOrders,
  cancelOrder,
  formatIDR,
  statusMeta,
}) {
  const [cancelTarget, setCancelTarget] = useState(null);
  const [pendingReason, setPendingReason] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const closeCancelFlow = () => {
    setCancelTarget(null);
    setPendingReason(null);
    setShowConfirm(false);
  };

  const handleProceedReason = (reason) => {
    setPendingReason(reason);
    setShowConfirm(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget || !pendingReason) return;
    cancelOrder(cancelTarget.id, pendingReason);
    closeCancelFlow();
  };

  const backToReasonForm = () => {
    setShowConfirm(false);
  };

  if (!currentCustomer) {
    return (
      <div className="customer-main">
        <header className="katalog-orders-header">
          <h2 className="katalog-page-title">Pesanan Saya</h2>
        </header>
        <div className="katalog-orders-empty">
          <i className="fas fa-user-lock" />
          <p>Login customer untuk melihat pesanan.</p>
          <button type="button" className="mm-btn mm-btn-primary" onClick={() => setView('profile')}>
            Masuk / daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-main katalog-orders-page">
      <header className="katalog-orders-header">
        <div>
          <h2 className="katalog-page-title">
            <i className="fas fa-box-open" /> Pesanan Saya
          </h2>
          <p className="katalog-orders-subtitle">
            Lacak status pesanan Anda. Pesanan baru berstatus <strong>menunggu diproses</strong> hingga
            dikonfirmasi toko.
          </p>
        </div>
        {customerOrders.length > 0 ? (
          <span className="katalog-orders-count">{customerOrders.length} pesanan</span>
        ) : null}
      </header>

      {customerOrders.length === 0 ? (
        <div className="katalog-orders-empty">
          <i className="fas fa-shopping-bag" />
          <h3>Belum ada pesanan</h3>
          <p className="mm-muted">Yuk mulai belanja dan checkout dari keranjang.</p>
          <button type="button" className="katalog-btn-cta" onClick={() => setView('market')}>
            <i className="fas fa-store" /> Belanja sekarang
          </button>
        </div>
      ) : (
        <div className="katalog-orders-list">
          {customerOrders.map((o) => {
            const st = statusMeta(o.status);
            const pay = o.paymentLabel || paymentLabel(o.paymentMethod);
            const canCancel = o.status === 'pending';
            return (
              <article
                key={o.id}
                className={`katalog-order-card katalog-order-card--${o.status || 'pending'}`}
              >
                <div className={`katalog-order-card__accent is-${o.status || 'pending'}`} aria-hidden />
                <div className="katalog-order-card__head">
                  <div className="katalog-order-card__id">
                    <span className={`katalog-order-status-icon is-${o.status || 'pending'}`}>
                      <i className={`fas ${statusIcon(o.status)}`} />
                    </span>
                    <div>
                      <strong>{o.orderId}</strong>
                      <p className="mm-muted">{o.date}</p>
                    </div>
                  </div>
                  <span className={`mm-order-status ${st.cls}`}>{st.label}</span>
                </div>

                <div className="katalog-order-card__meta">
                  <span>
                    <i className="fas fa-credit-card" />
                    {pay}
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt" />
                    {o.address || '—'}
                  </span>
                  {o.phone ? (
                    <span>
                      <i className="fas fa-phone" />
                      {o.phone}
                    </span>
                  ) : null}
                </div>

                <ul className="katalog-order-items">
                  {o.items.map((it, idx) => (
                    <li key={idx}>
                      <span className="katalog-order-item-name">{it.name}</span>
                      <span className="katalog-order-item-qty">×{it.qty}</span>
                      <span className="katalog-order-item-price">
                        {formatIDR((Number(it.price) || 0) * (Number(it.qty) || 0))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="katalog-order-card__foot">
                  <p className="katalog-order-total">
                    Total <span>{formatIDR(o.total)}</span>
                  </p>
                  {o.status === 'cancelled' && (o.cancelReasonLabel || o.cancelReasonNote) ? (
                    <div className="katalog-order-cancel-info">
                      <i className="fas fa-info-circle" />
                      <div>
                        <strong>Alasan pembatalan</strong>
                        <p>
                          {buildReasonSummary({
                            reasonLabel: o.cancelReasonLabel,
                            reasonNote: o.cancelReasonNote,
                          })}
                        </p>
                        {o.cancelledAt ? <small className="mm-muted">Dibatalkan: {o.cancelledAt}</small> : null}
                      </div>
                    </div>
                  ) : null}
                  {canCancel ? (
                    <button
                      type="button"
                      className="mm-btn mm-btn-danger katalog-order-cancel-btn"
                      onClick={() => {
                        setCancelTarget(o);
                        setPendingReason(null);
                        setShowConfirm(false);
                      }}
                    >
                      <i className="fas fa-times-circle" /> Batalkan pesanan
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!showConfirm && cancelTarget ? (
        <CancelReasonModal
          order={cancelTarget}
          onClose={closeCancelFlow}
          onProceed={handleProceedReason}
        />
      ) : null}

      {showConfirm && cancelTarget && pendingReason ? (
        <CancelConfirmModal
          order={cancelTarget}
          reasonSummary={buildReasonSummary(pendingReason)}
          onClose={backToReasonForm}
          onConfirm={handleConfirmCancel}
        />
      ) : null}
    </div>
  );
}
