import { useMemo, useState } from 'react';

const STATUS_META = {
  pending: { cls: 'status-pending', label: 'Menunggu' },
  processing: { cls: 'status-processing', label: 'Diproses' },
  shipped: { cls: 'status-shipped', label: 'Dikirim' },
  delivered: { cls: 'status-delivered', label: 'Selesai' },
  cancelled: { cls: 'status-cancelled', label: 'Dibatalkan' },
};

const PAYMENT_META = {
  pending: { cls: 'pay-pending', label: 'Bayar belum diverifikasi' },
  verified: { cls: 'pay-verified', label: 'Pembayaran OK' },
  rejected: { cls: 'pay-rejected', label: 'Pembayaran ditolak' },
};

function formatIdr(n) {
  return `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`;
}

export default function OnlineOrdersSPA({
  orders = [],
  onVerifyPayment,
  onUpdateStatus,
  onCancel,
  canVerifyPayment = true,
}) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const sorted = useMemo(
    () => [...orders].sort((a, b) => Number(b.id) - Number(a.id)),
    [orders]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted;
    if (filter === 'payment')
      return sorted.filter((o) => o.status === 'pending' && o.paymentStatus === 'pending');
    if (filter === 'processing') return sorted.filter((o) => o.status === 'processing');
    if (filter === 'shipped') return sorted.filter((o) => o.status === 'shipped');
    if (filter === 'done') return sorted.filter((o) => o.status === 'delivered');
    if (filter === 'pending') return sorted.filter((o) => o.status === 'pending');
    return sorted;
  }, [sorted, filter]);

  const selected =
    filtered.find((o) => Number(o.id) === Number(selectedId)) ||
    sorted.find((o) => Number(o.id) === Number(selectedId)) ||
    null;

  const selectOrder = (id) => setSelectedId(id);

  return (
    <div className="orders-spa">
      <div className="orders-spa__toolbar">
        {[
          ['all', 'Semua'],
          ['payment', 'Verifikasi bayar'],
          ['pending', 'Menunggu'],
          ['processing', 'Diproses'],
          ['shipped', 'Dikirim'],
          ['done', 'Selesai'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`orders-spa__filter${filter === key ? ' is-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="orders-spa__layout">
        <div className="orders-spa__list-wrap">
          <div className="orders-spa__list" role="list">
            {filtered.length === 0 ? (
              <p className="orders-spa__empty">Tidak ada pesanan pada filter ini.</p>
            ) : (
              filtered.map((o) => {
                const st = STATUS_META[o.status] || STATUS_META.pending;
                const pay = PAYMENT_META[o.paymentStatus] || PAYMENT_META.pending;
                const active = Number(selectedId) === Number(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="listitem"
                    className={`orders-spa__card-h${active ? ' is-selected' : ''}`}
                    onClick={() => selectOrder(o.id)}
                  >
                    <div className="orders-spa__card-h-top">
                      <strong>{o.orderId}</strong>
                      <span className={`order-status ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="orders-spa__card-h-mid">{o.customer || '—'}</div>
                    <div className="orders-spa__card-h-bot">
                      <span className={`orders-spa__pay ${pay.cls}`}>{pay.label}</span>
                      <span>{formatIdr(o.total)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="orders-spa__detail">
          {!selected ? (
            <div className="orders-spa__detail-empty">
              <i className="fas fa-receipt" />
              <p>Pilih pesanan untuk melihat detail dan memproses transaksi.</p>
            </div>
          ) : (
            <OrderDetailPanel
              order={selected}
              canVerifyPayment={canVerifyPayment}
              onVerifyPayment={onVerifyPayment}
              onUpdateStatus={onUpdateStatus}
              onCancel={onCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailPanel({
  order,
  canVerifyPayment,
  onVerifyPayment,
  onUpdateStatus,
  onCancel,
}) {
  const st = STATUS_META[order.status] || STATUS_META.pending;
  const pay = PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending;
  const items = Array.isArray(order.items) ? order.items : [];
  const paymentOk = order.paymentStatus === 'verified';
  const paymentPending = order.paymentStatus === 'pending';

  return (
    <div className="orders-spa__panel">
      <div className="orders-spa__panel-head">
        <div>
          <h3>{order.orderId}</h3>
          <p className="orders-spa__muted">{order.date}</p>
        </div>
        <div className="orders-spa__badges">
          <span className={`order-status ${st.cls}`}>{st.label}</span>
          <span className={`orders-spa__pay ${pay.cls}`}>{pay.label}</span>
        </div>
      </div>

      <section className="orders-spa__section">
        <h4>Pelanggan</h4>
        <p>
          <strong>{order.customer}</strong>
        </p>
        <p className="orders-spa__muted">{order.phone}</p>
        <p className="orders-spa__muted">{order.address}</p>
      </section>

      <section className="orders-spa__section">
        <h4>Pembayaran</h4>
        <p>Metode: {order.paymentMethod || 'manual'}</p>
        <p>Status: {order.paymentLabel || pay.label}</p>
      </section>

      <section className="orders-spa__section">
        <h4>Item pesanan</h4>
        <table className="data-table orders-spa__items-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{formatIdr(i.price)}</td>
                <td>{formatIdr(Number(i.price) * Number(i.qty))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="orders-spa__total">Total: {formatIdr(order.total)}</p>
      </section>

      <section className="orders-spa__section orders-spa__steps">
        <h4>Proses pesanan (satu halaman)</h4>
        <ol className="orders-spa__step-list">
          <li className={paymentOk ? 'done' : paymentPending ? 'active' : ''}>
            Verifikasi pembayaran oleh Admin
          </li>
          <li className={order.status !== 'pending' && paymentOk ? 'done' : ''}>Terima & proses pesanan</li>
          <li className={order.status === 'shipped' || order.status === 'delivered' ? 'done' : ''}>
            Kirim ke pelanggan
          </li>
          <li className={order.status === 'delivered' ? 'done' : ''}>Pesanan sampai / selesai</li>
        </ol>
      </section>

      <div className="orders-spa__actions">
        {canVerifyPayment && paymentPending && order.status === 'pending' && (
          <>
            <button
              type="button"
              className="btn-success"
              onClick={() => onVerifyPayment(order.id, 'verify')}
            >
              <i className="fas fa-check-circle" /> Verifikasi pembayaran
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => onVerifyPayment(order.id, 'reject')}
            >
              Tolak pembayaran
            </button>
          </>
        )}
        {order.status === 'pending' && paymentOk && (
          <button type="button" className="btn-success" onClick={() => onUpdateStatus(order.id, 'processing')}>
            Terima / Proses
          </button>
        )}
        {order.status === 'pending' && paymentPending && !canVerifyPayment && (
          <p className="orders-spa__hint">Menunggu Admin memverifikasi pembayaran.</p>
        )}
        {order.status === 'processing' && (
          <button type="button" className="btn-primary" onClick={() => onUpdateStatus(order.id, 'shipped')}>
            Tandai dikirim
          </button>
        )}
        {order.status === 'shipped' && (
          <button type="button" className="btn-success" onClick={() => onUpdateStatus(order.id, 'delivered')}>
            Selesai / sampai
          </button>
        )}
        {order.status === 'pending' && (
          <button type="button" className="btn-secondary" onClick={() => onCancel(order.id)}>
            Batalkan pesanan
          </button>
        )}
      </div>
    </div>
  );
}
