import { useEffect, useState } from 'react';
import { getMinStock, LOW_STOCK_THRESHOLD } from '../hooks/useOwnerDashboard.js';
import { api } from '../api/client.js';
import { productImgUrl, readImageFileAsDataUrl } from '../katalog/productImage.js';
import ProductImg from '../katalog/ProductImg.jsx';

const REASONS = ['Kadaluarsa', 'Rusak / cacat', 'Salah kirim', 'Tidak sesuai pesanan', 'Lainnya'];

function ModalShell({ title, children, onClose }) {
  return (
    <div
      className="modal active"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function OwnerModals({
  modal,
  closeModal,
  categories,
  products,
  suppliers,
  saveKategori,
  saveProduk,
  saveSupplier,
  savePesanStok,
  saveBarangMasuk,
  saveRetur,
}) {
  const [draft, setDraft] = useState({});
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!modal) return;
    if (modal.type === 'kategori' && modal.mode === 'edit') {
      const c = categories.find((x) => Number(x.id) === Number(modal.id));
      if (c) {
        setDraft({
          name: c.name || '',
          description: c.description || '',
          status: c.status === 'nonaktif' ? 'nonaktif' : 'aktif',
        });
      }
      return;
    }
    if (modal.type === 'kategori' && modal.mode === 'add') {
      setDraft({ name: '', description: '', status: 'aktif' });
      return;
    }
    if (modal.type === 'produk' && modal.mode === 'edit') {
      const p = products.find((x) => Number(x.id) === Number(modal.id));
      if (p) {
        setDraft({
          name: p.name || '',
          category: p.category || '',
          price: String(p.price ?? ''),
          buyPrice: String(p.buyPrice ?? p.hargaBeli ?? ''),
          stock: String(p.stock ?? ''),
          minStock: String(getMinStock(p)),
          supplierId: p.supplierId != null ? String(p.supplierId) : '',
          description: p.description || '',
          sku: p.sku || '',
          image: p.image || '',
        });
      }
      return;
    }
    if (modal.type === 'produk' && modal.mode === 'add') {
      setDraft({
        name: '',
        category: '',
        price: '',
        buyPrice: '',
        stock: '',
        minStock: String(LOW_STOCK_THRESHOLD),
        supplierId: '',
        description: '',
        sku: '',
        image: '',
      });
      return;
    }
    if (modal.type === 'supplier' && modal.mode === 'edit') {
      const s = suppliers.find((x) => Number(x.id) === Number(modal.id));
      if (s) {
        setDraft({
          code: s.code || '',
          name: s.name || '',
          contactPerson: s.contactPerson || '',
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          status: s.status === 'nonaktif' ? 'nonaktif' : 'aktif',
          note: s.note || '',
        });
      }
      return;
    }
    if (modal.type === 'supplier' && modal.mode === 'add') {
      setDraft({
        code: '',
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        status: 'aktif',
        note: '',
      });
      return;
    }
    if (modal.type === 'pesan-stok') {
      const p = products.find((x) => Number(x.id) === Number(modal.productId));
      setDraft({
        productId: p?.id ?? modal.productId,
        qty: '1',
        unit: 'pcs',
        supplierId: suppliers[0]?.id ?? '',
        expectedDate: '',
        note: '',
      });
      return;
    }
    if (modal.type === 'barang-masuk') {
      const today = new Date().toISOString().slice(0, 10);
      setDraft({
        date: today,
        supplierId: suppliers[0]?.id ?? '',
        productId: products[0]?.id ?? '',
        qty: '',
        unit: 'pcs',
        receivedBy: '',
        referencePo: '',
        note: '',
      });
      return;
    }
    if (modal.type === 'retur') {
      const today = new Date().toISOString().slice(0, 10);
      setDraft({
        date: today,
        supplierId: suppliers[0]?.id ?? '',
        productId: products[0]?.id ?? '',
        qty: '',
        unit: 'pcs',
        reason: REASONS[0],
        note: '',
        adjustStock: true,
      });
    }
  }, [modal, categories, products, suppliers]);

  if (!modal) return null;

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      const res = await api.uploadProductImage(dataUrl, draft.name || file.name);
      set('image', res.image);
      set('imagePreview', res.url);
    } catch (err) {
      window.alert(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  if (modal.type === 'kategori') {
    return (
      <ModalShell title={modal.mode === 'edit' ? 'Edit kategori' : 'Tambah kategori'} onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          <div className="form-group">
            <label>Nama kategori *</label>
            <input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Contoh: Sembako" />
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea rows={3} value={draft.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Keterangan singkat kategori" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={draft.status || 'aktif'} onChange={(e) => set('status', e.target.value)}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => saveKategori(draft, modal.mode === 'edit' ? modal.id : null)}
          >
            Simpan
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === 'produk') {
    return (
      <ModalShell title={modal.mode === 'edit' ? 'Edit produk' : 'Tambah produk'} onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          <div className="form-group">
            <label>Nama produk *</label>
            <input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Nama barang di rak" />
          </div>
          <div className="form-group">
            <label>Kategori *</label>
            <input
              list="owner-produk-kategori"
              value={draft.category || ''}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Pilih atau ketik nama kategori"
            />
            <datalist id="owner-produk-kategori">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label>SKU / kode internal</label>
            <input value={draft.sku || ''} onChange={(e) => set('sku', e.target.value)} placeholder="Opsional, untuk barcode / kode toko" />
          </div>
          <div className="form-group">
            <label>Harga beli (Rp) *</label>
            <input type="number" min={0} step={1} value={draft.buyPrice || ''} onChange={(e) => set('buyPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Harga jual (Rp) *</label>
            <input type="number" min={0} step={1} value={draft.price || ''} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Supplier</label>
            <select value={draft.supplierId || ''} onChange={(e) => set('supplierId', e.target.value)}>
              <option value="">— Pilih supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Stok saat ini *</label>
            <input type="number" min={0} step={1} value={draft.stock || ''} onChange={(e) => set('stock', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Stok minimum (peringatan) *</label>
            <input type="number" min={0} step={1} value={draft.minStock || ''} onChange={(e) => set('minStock', e.target.value)} />
            <small style={{ color: '#6b7280', display: 'block', marginTop: 6 }}>Jika stok di bawah nilai ini, status inventaris = menipis.</small>
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea rows={2} value={draft.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Tampil di halaman detail katalog" />
          </div>
          <div className="form-group">
            <label>Gambar produk</label>
            <div className="owner-product-image-field">
              {(draft.image || draft.imagePreview) && (
                <div className="owner-product-image-preview">
                  <img
                    src={
                      draft.imagePreview ||
                      productImgUrl(draft.name, 200, { name: draft.name, image: draft.image })
                    }
                    alt="Preview"
                  />
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageFile} disabled={imageUploading} />
              <small style={{ color: '#6b7280', display: 'block', marginTop: 6 }}>
                {imageUploading
                  ? 'Mengunggah...'
                  : 'Format JPG/PNG/WebP, maks. 3 MB. Gambar tampil di katalog dan keranjang.'}
              </small>
              <input
                type="text"
                value={draft.image || ''}
                onChange={(e) => set('image', e.target.value)}
                placeholder="Atau nama file di server (contoh: chitato.jpg)"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={imageUploading}
            onClick={() => saveProduk(draft, modal.mode === 'edit' ? modal.id : null)}
          >
            Simpan
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === 'supplier') {
    return (
      <ModalShell title={modal.mode === 'edit' ? 'Edit supplier' : 'Tambah supplier'} onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          {modal.mode === 'add' ? (
            <div className="form-group">
              <label>Kode supplier</label>
              <input value={draft.code || ''} onChange={(e) => set('code', e.target.value)} placeholder="Kosongkan untuk diisi otomatis (SUP00x)" />
            </div>
          ) : (
            <div className="form-group">
              <label>Kode</label>
              <input value={draft.code || ''} disabled style={{ opacity: 0.7 }} />
            </div>
          )}
          <div className="form-group">
            <label>Nama perusahaan / supplier *</label>
            <input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Kontak person</label>
            <input value={draft.contactPerson || ''} onChange={(e) => set('contactPerson', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Telepon</label>
            <input value={draft.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="021-xxx / 08xx" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={draft.email || ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Alamat</label>
            <textarea rows={2} value={draft.address || ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={draft.status || 'aktif'} onChange={(e) => set('status', e.target.value)}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="form-group">
            <label>Catatan</label>
            <textarea rows={2} value={draft.note || ''} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => saveSupplier(draft, modal.mode === 'edit' ? modal.id : null)}
          >
            Simpan
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === 'pesan-stok') {
    const p = products.find((x) => Number(x.id) === Number(draft.productId));
    return (
      <ModalShell title="Pesan stok ke supplier" onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          <div className="form-group">
            <label>Produk</label>
            <select value={draft.productId ?? ''} onChange={(e) => set('productId', e.target.value ? Number(e.target.value) : '')}>
              {products.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name} (stok: {pr.stock})
                </option>
              ))}
            </select>
          </div>
          {p ? (
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '-8px 0 12px' }}>
              Stok sekarang: <strong>{p.stock}</strong> · Min. disarankan: <strong>{getMinStock(p)}</strong>
            </p>
          ) : null}
          <div className="form-group">
            <label>Jumlah dipesan *</label>
            <input type="number" min={1} step={1} value={draft.qty || ''} onChange={(e) => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Satuan</label>
            <select value={draft.unit || 'pcs'} onChange={(e) => set('unit', e.target.value)}>
              <option value="pcs">pcs</option>
              <option value="dus">dus</option>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
            </select>
          </div>
          <div className="form-group">
            <label>Supplier (opsional)</label>
            <select
              value={draft.supplierId === '' || draft.supplierId == null ? '' : String(draft.supplierId)}
              onChange={(e) => set('supplierId', e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Pilih —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal diharapkan tiba</label>
            <input type="date" value={draft.expectedDate || ''} onChange={(e) => set('expectedDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Catatan pemesanan</label>
            <textarea rows={2} value={draft.note || ''} onChange={(e) => set('note', e.target.value)} placeholder="Nomor referensi, instruksi khusus, dll." />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={() => savePesanStok(draft)}>
            Kirim permintaan
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === 'barang-masuk') {
    return (
      <ModalShell title="Tambah barang masuk" onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 12 }}>
            Catat penerimaan barang dari supplier. Stok produk akan <strong>bertambah</strong> setelah disimpan.
          </p>
          <div className="form-group">
            <label>Tanggal penerimaan *</label>
            <input type="date" value={draft.date || ''} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Supplier *</label>
            <select value={draft.supplierId ?? ''} onChange={(e) => set('supplierId', Number(e.target.value))}>
              <option value="">— Pilih supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Produk *</label>
            <select value={draft.productId ?? ''} onChange={(e) => set('productId', Number(e.target.value))}>
              <option value="">— Pilih produk —</option>
              {products.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Jumlah masuk *</label>
            <input type="number" min={1} step={1} value={draft.qty || ''} onChange={(e) => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Satuan</label>
            <select value={draft.unit || 'pcs'} onChange={(e) => set('unit', e.target.value)}>
              <option value="pcs">pcs</option>
              <option value="dus">dus</option>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
            </select>
          </div>
          <div className="form-group">
            <label>No. referensi PO / faktur</label>
            <input value={draft.referencePo || ''} onChange={(e) => set('referencePo', e.target.value)} placeholder="Opsional" />
          </div>
          <div className="form-group">
            <label>Diterima oleh</label>
            <input value={draft.receivedBy || ''} onChange={(e) => set('receivedBy', e.target.value)} placeholder="Nama petugas gudang" />
          </div>
          <div className="form-group">
            <label>Catatan</label>
            <textarea rows={2} value={draft.note || ''} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={() => saveBarangMasuk(draft)}>
            Simpan &amp; tambah stok
          </button>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === 'retur') {
    return (
      <ModalShell title="Tambah retur barang" onClose={closeModal}>
        <div className="modal-body" style={{ padding: '0 4px 8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 12 }}>
            Retur ke supplier. Centang &quot;Kurangi stok&quot; jika barang sudah keluar dari toko.
          </p>
          <div className="form-group">
            <label>Tanggal retur *</label>
            <input type="date" value={draft.date || ''} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Supplier *</label>
            <select value={draft.supplierId ?? ''} onChange={(e) => set('supplierId', Number(e.target.value))}>
              <option value="">— Pilih —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Produk *</label>
            <select value={draft.productId ?? ''} onChange={(e) => set('productId', Number(e.target.value))}>
              <option value="">— Pilih —</option>
              {products.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name} (stok {pr.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Jumlah retur *</label>
            <input type="number" min={1} step={1} value={draft.qty || ''} onChange={(e) => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Satuan</label>
            <select value={draft.unit || 'pcs'} onChange={(e) => set('unit', e.target.value)}>
              <option value="pcs">pcs</option>
              <option value="dus">dus</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <div className="form-group">
            <label>Alasan *</label>
            <select value={draft.reason || REASONS[0]} onChange={(e) => set('reason', e.target.value)}>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Catatan</label>
            <textarea rows={2} value={draft.note || ''} onChange={(e) => set('note', e.target.value)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="retur-adjust"
              checked={!!draft.adjustStock}
              onChange={(e) => set('adjustStock', e.target.checked)}
            />
            <label htmlFor="retur-adjust" style={{ margin: 0, cursor: 'pointer' }}>
              Kurangi stok di aplikasi
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={() => saveRetur(draft)}>
            Simpan retur
          </button>
        </div>
      </ModalShell>
    );
  }

  return null;
}
