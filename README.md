# Minimarket Pro — aplikasi React (Vite)

## Apa ini?

Ini titik masuk berbasis **React Router** untuk seluruh alur Anda:

- **Login, Daftar, Lupa Password** — komponen React murni, tampilan memakai `public/css/style.css` yang sama dengan proyek HTML asli.
- **POS Kasir** — **React murni** (`src/pages/PosKasirPage.jsx` + `src/pos/`): tampilan memakai CSS yang sama (`src/styles/pos-kasir.css`), semua tab, modal, pesanan online, kasir offline, barang masuk, update stok, aktivitas dashboard — data **`mm_*` di `localStorage`** sama seperti versi HTML.
- **Dashboard Owner, Katalog Online** — masih **`public/*.html`** lewat `<iframe>` (bisa dimigrasi bertahap seperti POS).

`iframe` tidak memutus fitur; ini satu origin (`localhost`), jadi data toko bersama antara modul tetap bisa dibaca/hal yang sama seperti membuka berkas `.html` langsung.

## Menjalankan

```bash
cd react-app
npm install
npm run dev
```

- Buka `http://localhost:5173/` — Login React.
- Setelah login (tanpa backend, formulir langsung mengarah ke `/owner`) atau gunakan pintasan dari halaman login: **POS Kasir**, **Katalog**.

Logout dari Owner/Katalog (iframe) memakai `window.top.location.href = '/'`. Logout dari POS React memakai React Router ke `/`.

## Build produksi

```bash
npm run build
npm run preview
```

## Port penuh ke komponen React (tanpa iframe)

Memindahkan ~2.000+ baris markup + state POS/Owner/Katalog ke komponen React murni **bisa** dilakukan bertahap (satu tab/hari), dengan mempertahankan utilitas `localStorage` yang sama. Struktur di `src/styles/pos-kasir.css` (ekstrak dari HTML) bisa dipakai sebagai dasar gaya saat komponen React mulai menggantikan iframe.
