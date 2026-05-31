import OnlineOrdersSPA from '../components/OnlineOrdersSPA.jsx';

export function OwnerOrdersTab({
  orders,
  ownerUpdateOrderStatus,
  ownerVerifyPayment,
  ownerCancelOnlineOrder,
}) {
  return (
    <div className="tab-content owner-pos-online-page active">
      <div className="page-section">
        <div>
          <h3>Pesanan online</h3>
          <p className="page-section-desc">
            Kelola verifikasi pembayaran dan seluruh tahapan pesanan dalam satu halaman — pilih kartu
            pesanan untuk melihat detail lengkap.
          </p>
        </div>
      </div>
      <OnlineOrdersSPA
        orders={orders}
        canVerifyPayment
        onVerifyPayment={ownerVerifyPayment}
        onUpdateStatus={ownerUpdateOrderStatus}
        onCancel={ownerCancelOnlineOrder}
      />
    </div>
  );
}
