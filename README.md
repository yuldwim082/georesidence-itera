# GeoResidence — Pemetaan Interaktif Residensial Mahasiswa
### Program Studi Teknik Geomatika — Institut Teknologi Sumatera (ITERA)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite)](https://www.sqlite.org)
[![OpenStreetMap](https://img.shields.io/badge/GIS-Leaflet_%26_OpenStreetMap-77AC39?style=flat&logo=openstreetmap)](https://leafletjs.com)

**GeoResidence** adalah aplikasi **Web GIS (Sistem Informasi Geografis Berbasis Web)** interaktif yang dirancang untuk memvisualisasikan, menganalisis, dan mengelola sebaran spasial tempat tinggal **137 mahasiswa Teknik Geomatika ITERA**.

Aplikasi ini **100% bebas biaya (Zero-Cost / Open Source)**, berjalan langsung tanpa memerlukan kartu kredit atau langganan cloud berbayar. Peta menggunakan **Leaflet + OpenStreetMap & CartoDB Minimalis & Esri World Satelit** (serta tetap kompatibel dengan Google Maps jika ingin diaktifkan di kemudian hari).

---

## 🌟 Fitur Utama Aplikasi

### 1. Website Publik (Desain Minimalis Modern — Brickwise Style)
- **Beranda (`/`):**
  - Hero section bertajuk *"Discover Where We Live."*
  - Kartu statistik dinamis (Total Mahasiswa, Rumah, Kost, Kontrakan) yang terhubung langsung ke basis data lokal.
  - Kartu edukasi penjelasan 3 kategori tempat tinggal.
- **Peta Interaktif Web GIS (`/map`):**
  - **100% Gratis Tanpa API Key:** Menggunakan Leaflet dengan pilihan lapisan peta:
    - 🗺️ **Minimalis (CartoDB Positron):** Tampilan ultra-bersih modern monokrom.
    - 🌐 **OpenStreetMap:** Peta jalan raya standar dunia.
    - 🛰️ **Citra Satelit (Esri World Imagery):** Tampilan citra satelit resolusi tinggi.
  - **Penanda Kategori Khusus (Custom SVG Pins):**
    - 🟢 **Rumah:** Pin Hijau Zamrud (`#10B981`)
    - 🔵 **Kost:** Pin Biru Safir (`#3B82F6`)
    - 🟠 **Kontrakan:** Pin Oranye Jingga (`#F97316`)
  - **Marker Clustering (@googlemaps/markerclusterer & Leaflet.markercluster):** Mengelompokkan pin secara dinamis saat skala peta diperkecil (*zoom out*).
  - **Pencarian Nama:** Pencarian instan nama mahasiswa (*partial match*).
  - **Penyaringan Kategori Dinamis:** Filter cepat Rumah, Kost, Kontrakan, atau Semua.
  - **Kartu Informasi Mahasiswa (Popup Card):** Muncul saat marker diklik (menampilkan nama, kategori hunian, dan notifikasi jaminan koordinat tergeneralisasi).
  - **Titik Kampus ITERA:** Penanda orientasi letak kampus ITERA di Jl. Terusan Ryacudu.
- **Tentang & Kebijakan Privasi Spasial (`/about`):**
  - Profil akademis Teknik Geomatika ITERA.
  - Penjelasan komprehensif mengenai metode perlindungan privasi spasial (*annular displacement* ~120–280 m).

### 2. Portal Administrator Terproteksi
- **Otentikasi Aman (`/admin/login`):**
  - Login berbasis token **JWT** dan hashing password **Bcrypt** (12 *salt rounds*).
  - Tidak ada registrasi akun publik; sesi otomatis terlindungi.
- **Dashboard Ringkasan (`/admin/dashboard`):**
  - Statistik dinamis: Total Mahasiswa, Rumah, Kost, Kontrakan, Publikasi Aktif, dan Status Draft.
  - Log audit aktivitas pembaruan basis data terbaru.
  - Pintasan cepat manajemen data dan impor berkas.
- **Manajemen Data Mahasiswa CRUD (`/admin/students`):**
  - Tabel data lengkap dengan paginasi, pencarian, dan penyaringan multi-kategori.
  - Tambah mahasiswa baru secara manual dengan validasi rentang koordinat (-90° s/d 90° lintang, -180° s/d 180° bujur).
  - Ubah data & koordinat mahasiswa (otomatis menghitung ulang titik publik yang tergeneralisasi).
  - Hapus data dengan modal konfirmasi keamanan.
  - Ekspor seluruh basis data ke format **.CSV** dan **.XLSX**.
- **Impor Massal CSV & Excel (`/admin/import`):**
  - Mendukung berkas data **.csv** dan **.xlsx**.
  - Deteksi otomatis sinonim nama kolom (NIM, Nama, Kategori/Residence Type, Latitude/Lat, Longitude/Lon).
  - Pratinjau tabel validasi sebelum penyimpanan (*row-by-row validation*).
  - Deteksi otomatis NIM duplikat dengan opsi lewati (*skip duplicates*).
  - Eksekusi transaksi basis data (*database transactions*) untuk integritas data.
  - Ringkasan hasil impor (berhasil, dilewati, gagal).
  - Tersedia template resmi yang dapat diunduh langsung.

---

## 🛡️ Perlindungan Privasi Spasial (*Spatial Privacy*)

Sebagai sistem Web GIS publik, GeoResidence mematuhi etika data geospasial:
1. **Koordinat Asli Terisolasi:** Garis lintang dan bujur presisi tempat tinggal mahasiswa disimpan secara aman di basis data lokal dan **hanya dapat diakses oleh administrator**.
2. **Generalisasi Koordinat Publik:** Endpoint publik (`/api/public/students`) hanya mengirimkan `public_latitude` dan `public_longitude` yang telah digeser secara deterministik dalam radius **120 hingga 280 meter** menggunakan algoritma pergeseran annular berbasis hash NIM.
3. **Kendali Izin Publikasi:** Mahasiswa hanya tampil di peta publik jika `consent_publication = true` dan `is_published = true`.

---

## 🚀 Panduan Menjalankan & Deploy Aplikasi

### A. Deploy Produksi Cepat dengan Docker (Direkomendasikan)
GeoResidence telah dilengkapi dengan konfigurasi multi-stage build `Dockerfile` dan `docker-compose.yml`. Seluruh frontend dan backend terintegrasi dalam satu container mandiri.

```bash
cd georesidence
docker compose up --build -d
```
Aplikasi langsung berjalan di port 8000:
- Web App & Peta Interaktif: `http://localhost:8000/`
- Dokumentasi API Swagger: `http://localhost:8000/docs`
- 137 data mahasiswa otomatis terpasang saat pertama kali dijalankan.

---

### B. Deploy Produksi di Linux VPS (Tanpa Docker)
Jalankan skrip siap pakai:
```bash
cd georesidence
./start-production.sh
```
Skrip akan otomatis:
1. Membangun aset frontend produksi (`npm run build`).
2. Menyiapkan Python virtualenv dan menginstal `requirements.txt`.
3. Menjalankan server produksi Uvicorn pada port 8000 (dapat diatur lewat variabel env `PORT`).

---

### C. Deploy Cloud PaaS (Railway, Render, Fly.io, Koyeb)
1. Unggah repositori ini ke GitHub / GitLab.
2. Hubungkan ke platform pilihan Anda (misal Railway atau Render).
3. Pilih mode **Dockerfile**.
4. Set variabel environment:
   - `PORT=8000` (atau biarkan otomatis sesuai platform)
   - `SECRET_KEY=kunci-rahasia-produksi-anda`
   - `ADMIN_INITIAL_PASSWORD=password-admin-anda`
5. Aplikasi akan otomatis ter-build dan online dalam 1-2 menit.

---

### D. Deploy Terpisah (Frontend di Vercel/Netlify + Backend di Cloud)
Jika ingin memisahkan hosting:
- **Frontend**: Arahkan folder `frontend` ke Vercel atau Netlify. Telah disediakan `vercel.json` dan `_redirects` untuk penanganan SPA routing. Atur environment variable `VITE_API_URL=https://url-backend-anda.com`.
- **Backend**: Deploy folder `backend` menggunakan `backend/Dockerfile` atau direktori backend ke Render/Railway/VPS.

---

### E. Mode Pengembangan Lokal (Development)

#### 1. Menjalankan Backend (FastAPI + SQLite)
```bash
cd georesidence/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Endpoint: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Dokumentasi Interaktif Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Menjalankan Frontend (React + Vite)
```bash
cd georesidence/frontend
npm run dev
```
- Buka di browser: [http://localhost:5173/](http://localhost:5173/)

---

## 🔑 Kredensial Administrator Bawaan

| URL Portal | Username | Password |
| :--- | :--- | :--- |
| `http://localhost:5173/admin/login` | `admin` | `admin123` |

---

## 📂 Format & Template Impor 137 Mahasiswa

Aplikasi siap menerima impor berkas data 137 mahasiswa Teknik Geomatika ITERA. Anda dapat mengunduh berkas template di `data/templates/template_georesidence.csv` atau `data/templates/template_georesidence.xlsx`.

Format kolom yang dikenali secara otomatis:

| NIM | Nama | Kategori | Latitude | Longitude |
| :--- | :--- | :--- | :--- | :--- |
| 121110001 | Budi Santoso | Kost | -5.358241 | 105.312984 |
| 121110002 | Siti Rahma | Rumah | -5.372105 | 105.289123 |
| 121110003 | Ahmad Fauzi | Kontrakan | -5.361902 | 105.321456 |

---

## 🧪 Pengujian Otomatis (*Automated Tests*)

Untuk menjalankan pengujian otomatis backend:
```bash
cd /home/yuldwim/.gemini/antigravity/scratch/georesidence/backend
source venv/bin/activate
pytest tests/ -v
```

Uji pengujian memverifikasi:
- Algoritma perpindahan privasi spasial (rentang 120–280 m).
- Keamanan otentikasi admin JWT & Bcrypt.
- Sanitasi endpoint publik (memastikan koordinat asli & NIM tidak bocor).
- Validasi berkas CSV dan pencegahan duplikasi data NIM.

---
© 2026 Program Studi Teknik Geomatika — Institut Teknologi Sumatera (ITERA).
