export const CANCEL_REASONS = [
  { code: 'wrong_address', label: 'Alamat pengiriman salah' },
  { code: 'wrong_checkout', label: 'Salah checkout / salah pesan barang' },
  { code: 'change_mind', label: 'Ingin mengubah jumlah atau item pesanan' },
  { code: 'duplicate', label: 'Pesanan terduplikasi' },
  { code: 'slow_process', label: 'Terlalu lama menunggu konfirmasi' },
  { code: 'other', label: 'Lainnya' },
];

export function getCancelReasonLabel(code) {
  return CANCEL_REASONS.find((r) => r.code === code)?.label || code || '—';
}
