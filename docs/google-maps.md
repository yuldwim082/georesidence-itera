# Panduan Konfigurasi Google Maps JavaScript API

GeoResidence mengintegrasikan **Google Maps JavaScript API** dengan pustaka `@googlemaps/js-api-loader` dan `@googlemaps/markerclusterer` untuk menyajikan visualisasi geospasial kelas industri.

---

## 1. Persiapan Kunci API di Google Cloud Console

Ikuti langkah-langkah berikut untuk mendapatkan API Key resmi:

1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru (*New Project*) atau pilih proyek yang sudah ada (contoh: `GeoResidence-ITERA`).
3. Buka menu **APIs & Services** > **Library**.
4. Cari dan aktifkan:
   - **Maps JavaScript API** (*Wajib*)
   - **Places API** (*Opsional/Rekomendasi*)
   - **Geocoding API** (*Opsional*)
5. Buka menu **APIs & Services** > **Credentials**.
6. Klik **+ Create Credentials** lalu pilih **API Key**. Salin string kunci yang dihasilkan.

---

## 2. Pengamanan Kunci API (*Security Restrictions*)

Untuk mencegah penyalahgunaan kuota atau penggunaan API Key oleh pihak tidak berwenang:

### A. Pembatasan Aplikasi (*Application Restrictions*)
1. Pada halaman detail API Key di Google Cloud Console, pilih **Set an application restriction** > **Websites**.
2. Masukkan URL referrer yang diizinkan:
   - Untuk pengembangan lokal:
     - `http://localhost:5173/*`
     - `http://127.0.0.1:5173/*`
     - `http://localhost:3000/*`
   - Untuk *production* domain ITERA (sesuaikan):
     - `https://georesidence.itera.ac.id/*`
     - `https://*.itera.ac.id/*`

### B. Pembatasan API (*API Restrictions*)
1. Pada bagian **API restrictions**, pilih **Restrict key**.
2. Centang hanya **Maps JavaScript API**.
3. Klik **Save**.

---

## 3. Penerapan di GeoResidence

Tambahkan API Key ke file `.env` di direktori `frontend/`:

```ini
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Setelah menyimpan file `.env`, jalankan ulang server pengembangan Vite jika diperlukan:
```bash
npm run dev
```

---

## 4. Fitur Khusus pada Peta GeoResidence

- **Marker Kategori Khusus (Custom Vector Pin):**
  - **Rumah:** Pin Hijau Zamrud (`#10B981`)
  - **Kost:** Pin Biru Safir (`#3B82F6`)
  - **Kontrakan:** Pin Oranye Jingga (`#F97316`)
- **Marker Clustering:** Otomatis mengelompokkan pin berdekatan untuk performa rendering optimal saat skala peta diperkecil (*zoom out*).
- **Auto-Fit Bounds:** Kamera peta secara cerdas menyesuaikan batas wilayah (*viewport*) agar seluruh marker yang memenuhi kriteria pencarian dan filter terlihat dengan jelas.
- **Mode Cadangan Interaktif (*Graceful Fallback*):** Jika kunci API belum dimasukkan atau kuota Google Cloud sedang terhenti, antarmuka otomatis beralih ke kanvas vektor Web GIS yang tetap interaktif tanpa menyebabkan galat (*crash*).
