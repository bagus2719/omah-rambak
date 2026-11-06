# Omah Rambak - Website Penjualan Kerupuk Kulit Sapi Asli

Website profil bisnis dan katalog pemesanan online untuk **Omah Rambak**, produsen kerupuk kulit sapi asli berkualitas tinggi dengan resep tradisional turun-temurun khas Nusantara.

Website ini telah dimodernisasi dengan arsitektur kode yang bersih (pemisahan HTML, CSS, dan JS), penerapan optimasi mesin pencari (**Search Engine Optimization - SEO**) menyeluruh, serta peningkatan antarmuka pengguna (**UI/UX**) yang responsif, interaktif, dan ramah pengguna (*user-friendly*).

---

## 🌟 Fitur Utama & Peningkatan

### 1. Arsitektur Kode Bersih & Modular
- **Pemisahan Berkas:** Seluruh kode CSS inline dan JavaScript yang sebelumnya tertanam di dalam dokumen HTML telah dipisahkan ke dalam folder `assets/css/` dan `assets/js/`.
- **Modul JS Terstruktur:**
  - `main.js`: Logika global (sinkronisasi keranjang belanja di `localStorage`, notifikasi toast, menu responsif mobile, animasi *Intersection Observer*, dan navigasi aktif).
  - `home.js`: Pemutakhiran produk unggulan di beranda dan interaktivitas akordion FAQ.
  - `catalog.js`: Pengambilan data produk dinamis dari `products.json`, pencarian teks langsung (*live search*), filter kategori (*chips & checkboxes*), slider rentang harga, pengurutan produk, dan modal tinjauan cepat (*quick view*).
  - `cart.js`: Tampilan tabel keranjang belanja, pengatur kuantitas (+/-), modal konfirmasi penghapusan, formulir data pemesan, serta penyusun format pesanan otomatis ke WhatsApp.

### 2. Implementasi SEO Komprehensif
- **Meta Tag Standar:** Judul halaman unik (*title tag*), deskripsi meta informatif (*meta description*), kata kunci tertarget (*keywords*), dan *canonical link* pada setiap halaman.
- **Open Graph & Twitter Cards:** Tampilan pratinjau tautan yang menarik saat dibagikan ke media sosial (WhatsApp, Facebook, Twitter/X, Telegram).
- **Struktur Data Terstruktur (JSON-LD Schema.org):**
  - Schema `WebSite` & `SearchAction` pada beranda.
  - Schema `FoodEstablishment` / `LocalBusiness` untuk pengenalan profil bisnis dan toko lokal.
  - Schema `ItemList` & `Product` dinamis pada katalog produk untuk mendukung Google Rich Snippets (harga, ketersediaan, SKU, dan merek).
  - Schema `BreadcrumbList` pada halaman katalog dan tentang kami untuk hierarki pencarian yang rapi.
- **Pengaturan Crawling:**
  - Berkas `robots.txt` standar yang mengizinkan pengindeksan halaman publik sekaligus mengecualikan halaman sesi privat (`cart.html`).
  - Berkas `sitemap.xml` yang valid dan diperbarui untuk mempermudah perayapan oleh mesin pencari Google.

### 3. Tampilan Modern & Pengalaman Pengguna (UX) yang Lebih Baik
- **Palet Warna Hangat & Menggugah Selera:** Aksen oranye dan *amber* hangat yang dipadukan dengan kartu putih bersih, batas halus, serta bayangan lembut.
- **Pencarian Real-Time & Filter Fleksibel:** Pengunjung dapat mencari produk secara instan berdasarkan nama atau deskripsi, memilih filter cepat (*pills*), maupun menyetel batas maksimal harga.
- **Modal Quick View:** Calon pembeli dapat melihat foto produk besar, membaca deskripsi lengkap, serta menentukan jumlah yang ingin dibeli tanpa perlu meninggalkan halaman katalog.
- **Checkout WhatsApp Terstruktur:** Data produk di keranjang beserta nama dan alamat pengiriman dirangkum secara rapi ke format pesan WhatsApp siap kirim ke nomor admin penjual.
- **Tombol WhatsApp Mengambang (*Floating CTA*):** Akses cepat konsultasi bagi calon pembeli di pojok kanan bawah setiap halaman.
- **Akordion FAQ:** Menjawab pertanyaan umum (cara penyimpanan, keaslian bahan, tips menggoreng rambak mentah, dan pengiriman luar kota).

---

## 📁 Struktur Direktori Proyek

```plaintext
omah-rambak/
│
├── index.html              # Halaman Beranda (Hero, Keunggulan, Produk Unggulan, FAQ)
├── catalog.html            # Halaman Katalog (Live Search, Filter, Modal Quick View)
├── about.html              # Halaman Profil Bisnis (Sejarah, Visi, Misi, Tim)
├── cart.html               # Halaman Keranjang Belanja & Formulir Checkout WhatsApp
├── products.json           # Sumber data katalog produk (ID, Nama, Harga, Kategori, Foto)
├── robots.txt              # Panduan perayapan untuk mesin pencari
├── sitemap.xml             # Peta situs XML untuk SEO Google
├── README.md               # Dokumentasi lengkap proyek
│
└── assets/
    ├── css/
    │   └── style.css       # Berkas gaya CSS utama (Animasi, Modal, Toast, Komponen)
    │
    ├── js/
    │   ├── main.js         # Skrip global (Cart Storage, Toast, Navigasi, Animasi Scroll)
    │   ├── home.js         # Skrip khusus halaman beranda
    │   ├── catalog.js      # Skrip pencarian, filter, dan modal katalog
    │   └── cart.js         # Skrip manajemen keranjang dan pemesanan WhatsApp
    │
    └── images/             # Aset gambar produk, banner, dan favicon
        ├── favicon.svg
        ├── kerupuk-eceran.jpg
        ├── kerupuk-rambak-banner.jpeg
        ├── kerupuk-rambak-matang.jpeg
        ├── kerupuk-rambak-mentah.jpeg
        ├── proses-penjemuran-kerupuk-rambak.jpeg
        └── kerupuk rambak.png
```

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Karena proyek ini menggunakan berkas `products.json` yang dimuat menggunakan JavaScript `fetch()`, disarankan untuk membukanya menggunakan server lokal agar tidak terkena pembatasan CORS browser:

### Opsi 1: Menggunakan Ekstensi VS Code (Live Server)
1. Buka folder proyek di **Visual Studio Code**.
2. Pasang ekstensi **Live Server** (oleh Ritwick Dey).
3. Klik kanan pada berkas `index.html` lalu pilih **"Open with Live Server"**.

### Opsi 2: Menggunakan Python
Jika komputer Anda telah terpasang Python, jalankan perintah berikut di terminal:
```bash
# Python 3.x
python -m http.server 8000
```
Buka browser dan akses alamat: `http://localhost:8000`

### Opsi 3: Menggunakan Node.js / `npx serve`
```bash
npx serve .
```

---

## ⚙️ Panduan Kustomisasi

### 1. Mengubah Nomor WhatsApp Penjual
Nomor WhatsApp toko dikonfigurasi secara terpusat pada konstanta JavaScript:
- Buka berkas `assets/js/main.js` lalu ubah baris:
  ```javascript
  const STORE_PHONE = '6283111481327'; // Ganti dengan nomor WhatsApp Anda (diawali 62)
  ```
- Perbarui juga nomor pada tautan langsung di berkas HTML (`index.html`, `catalog.html`, `about.html`).

### 2. Menambah atau Mengubah Produk
Semua produk katalog tersimpan di berkas `products.json`. Contoh struktur item:
```json
{
  "id": "KSM004",
  "name": "Kerupuk Rambak Pedas Gurih 500 gr",
  "image": "assets/images/kerupuk-rambak-matang.jpeg",
  "description": "Varian kerupuk rambak dengan bumbu balado pedas manis yang renyah.",
  "price": "70.000",
  "category": "matang",
  "package_type": "kiloan"
}
```
> **Catatan Kategori:** Nilai `category` yang didukung adalah `"matang"`, `"mentah"`, atau `"eceran"`.

### 3. Mengatur Domain & Peta Situs (SEO)
Jika website dipindahkan ke domain kustom Anda (misal: `https://www.omahrambak.com`):
1. Perbarui nilai `DOMAIN` di baris atas `assets/js/catalog.js`.
2. Perbarui tautan `<link rel="canonical">` dan `og:url` di setiap berkas HTML.
3. Perbarui alamat URL di dalam `sitemap.xml` dan `robots.txt`.

---

## 🛠️ Teknologi yang Digunakan
- **HTML5:** Struktur semantik standar aksesibilitas dan SEO.
- **CSS3 & Tailwind CSS (CDN):** Utilitas responsif cepat, tata letak grid, dan flexbox.
- **JavaScript (Vanilla ES6+):** Logika keranjang belanja, manipulasi DOM, Fetch API, dan LocalStorage.
- **Font Awesome 6:** Ikonografi antarmuka.
- **Google Fonts (Inter):** Tipografi modern dan mudah dibaca.
- **Schema.org (JSON-LD):** Data terstruktur untuk optimalisasi mesin pencari Google.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta &copy; 2026 **Omah Rambak**. Seluruh hak dilindungi undang-undang.
Didedikasikan untuk pengembangan usaha kuliner tradisional Indonesia.

