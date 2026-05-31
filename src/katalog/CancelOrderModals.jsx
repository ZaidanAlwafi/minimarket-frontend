import { useState, useEffect } from 'react';
import { CANCEL_REASONS } from './cancelReasons.js';

export function CancelReasonModal({ order, onClose, onProceed }) {
  const [reasonCode, setReasonCode] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setReasonCode('');
    setNote('');
  }, [order?.id]);

  if (!order) return null;

  const handleProceed = () => {
    if (!reasonCode) return;
    const preset = CANCEL_REASONS.find((r) => r.code === reasonCode);
    const trimmed = note.trim();
    if (reasonCode === 'other' && !trimmed) return;
    onProceed({
      reasonCode,
      reasonLabel: preset?.label || reasonCode,
      reasonNote: trimmed,
    });
  };

  return (
    <div className="katalog-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="katalog-modal katalog-modal--cancel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-reason-title"
      >
        <div className="katalog-modal__header">
          <div>
            <h3 id="cancel-reason-title">Alasan pembatalan</h3>
            <p className="mm-muted">Pesanan {order.orderId}</p>
          </div>
          <button type="button" className="katalog-modal__close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        <div className="katalog-modal__body">
          <p className="katalog-cancel-intro">
            Mohon pilih alasan pembatalan agar kami dapat meningkatkan layanan.
          </p>
          <div className="katalog-cancel-reasons">
            {CANCEL_REASONS.map((r) => (
              <label
                key={r.code}
                className={`katalog-cancel-reason${reasonCode === r.code ? ' is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={r.code}
                  checked={reasonCode === r.code}
                  onChange={() => setReasonCode(r.code)}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <div className="katalog-cancel-note">
            <label htmlFor="cancel-note">
              {reasonCode === 'other' ? 'Jelaskan alasan Anda *' : 'Keterangan tambahan (opsional)'}
            </label>
            <textarea
              id="cancel-note"
              className="mm-input"
              rows={3}
              placeholder={
                reasonCode === 'other'
                  ? 'Tulis alasan pembatalan secara singkat...'
                  : 'Contoh: ingin ganti alamat ke ...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="katalog-modal__footer">
          <button type="button" className="mm-btn mm-btn-secondary" onClick={onClose}>
            Kembali
          </button>
          <button
            type="button"
            className="mm-btn mm-btn-danger"
            onClick={handleProceed}
            disabled={!reasonCode || (reasonCode === 'other' && !note.trim())}
          >
            Lanjutkan pembatalan
          </button>
        </div>
      </div>
    </div>
  );
}

export function CancelConfirmModal({ order, reasonSummary, onClose, onConfirm }) {
  if (!order) return null;

  return (
    <div className="katalog-modal-overlay katalog-modal-overlay--confirm" role="presentation">
      <div
        className="katalog-modal katalog-modal--confirm"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-confirm-title"
      >
        <div className="katalog-confirm-icon">
          <i className="fas fa-exclamation-triangle" />
        </div>
        <h3 id="cancel-confirm-title">Batalkan pesanan?</h3>
        <p className="katalog-confirm-text">
          Apakah Anda yakin ingin membatalkan pesanan <strong>{order.orderId}</strong>? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        {reasonSummary ? (
          <div className="katalog-confirm-reason">
            <span className="mm-muted">Alasan:</span>
            <p>{reasonSummary}</p>
          </div>
        ) : null}
        <div className="katalog-modal__footer katalog-modal__footer--center">
          <button type="button" className="mm-btn mm-btn-secondary" onClick={onClose}>
            Tidak, kembali
          </button>
          <button type="button" className="mm-btn mm-btn-danger" onClick={onConfirm}>
            Ya, batalkan pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
