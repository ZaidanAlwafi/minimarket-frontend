const PRODUCT_FILES = {
  'indomie-goreng': '/images/products/indomie-goreng.jpg',
  'telur-1kg': '/images/products/telur-1kg.jpg',
  'minyak-goreng': '/images/products/minyak-goreng.jpg',
  'beras-5kg': '/images/products/beras-5kg.jpg',
  'gula-pasir': '/images/products/gula-pasir.jpg',
  'kopi-sachet': '/images/products/kopi-sachet.jpg',
  'teh-botol': '/images/products/teh-botol.jpg',
  'roti-tawar': '/images/products/roti-tawar.jpg',
  'susu-uht': '/images/products/susu-uht.jpg',
};

const KEYWORD_RULES = [
  { test: /indomie|mie\s*instan|mi\s*goreng|mie\s*goreng/i, file: 'indomie-goreng' },
  { test: /telur|egg/i, file: 'telur-1kg' },
  { test: /minyak/i, file: 'minyak-goreng' },
  { test: /beras/i, file: 'beras-5kg' },
  { test: /gula/i, file: 'gula-pasir' },
  { test: /kopi|coffee/i, file: 'kopi-sachet' },
  { test: /teh|tea|teh\s*botol/i, file: 'teh-botol' },
  { test: /roti|bread/i, file: 'roti-tawar' },
  { test: /susu|milk|uht/i, file: 'susu-uht' },
  { test: /chitato|keripik|snack/i, file: 'indomie-goreng' },
  { test: /sabun|deterjen|shampo/i, file: 'minyak-goreng' },
];

const CATEGORY_FALLBACK = {
  Makanan: 'indomie-goreng',
  Sembako: 'beras-5kg',
  Minuman: 'teh-botol',
  'Peralatan Rumah': 'minyak-goreng',
};

export function slugFromProductName(name) {
  return String(name || 'produk')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveFileKey(name, product) {
  if (product?.image) {
    const img = String(product.image).trim();
    if (img.startsWith('/') || img.startsWith('http')) return null;
    const slug = img.replace(/^images\/products\//, '').replace(/\.[a-z]+$/i, '');
    if (PRODUCT_FILES[slug] || PRODUCT_FILES[slugFromProductName(img)]) return slug;
  }

  const slug = slugFromProductName(name);
  if (PRODUCT_FILES[slug]) return slug;

  const n = String(name || '');
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(n)) return rule.file;
  }

  const cat = product?.category;
  if (cat && CATEGORY_FALLBACK[cat]) return CATEGORY_FALLBACK[cat];

  return null;
}

/** URL gambar produk — upload backend, path statis, atau fallback */
export function productImgUrl(name, size = 400, product = null) {
  if (product?.image) {
    const img = String(product.image).trim();
    if (!img) {
      /* fall through */
    } else if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    } else if (img.startsWith('/uploads/')) {
      return img;
    } else if (img.startsWith('/')) {
      return img;
    } else if (img.startsWith('uploads/')) {
      return `/${img}`;
    } else if (img.startsWith('images/')) {
      return `/${img}`;
    } else if (/^\d{10,}-/.test(img)) {
      return `/uploads/products/${img}`;
    }
    /* nama file lama di DB (mis. chitato.jpg) — pakai fallback kata kunci / placeholder */
  }

  const key = resolveFileKey(name, product);
  if (key && PRODUCT_FILES[key]) return PRODUCT_FILES[key];

  const label = encodeURIComponent(String(name || 'Produk').slice(0, 20));
  return `https://via.placeholder.com/${size}x${size}/e2e8f0/475569?text=${label}`;
}

export const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'COD', desc: 'Bayar di tempat saat barang sampai', icon: 'fa-money-bill-wave' },
  { id: 'qris', label: 'QRIS', desc: 'Scan QR saat pesanan dikonfirmasi', icon: 'fa-qrcode' },
  { id: 'transfer', label: 'Transfer Bank', desc: 'Transfer ke rekening toko', icon: 'fa-university' },
];

export function paymentLabel(method) {
  const m = PAYMENT_OPTIONS.find((p) => p.id === method);
  return m ? m.label : method || '—';
}

/** Baca file gambar sebagai data URL untuk upload */
export function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}
