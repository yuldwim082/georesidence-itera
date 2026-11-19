# Panduan Instalasi & Menjalankan GeoResidence

Dokumen ini menjelaskan langkah-langkah menyiapkan dan menjalankan aplikasi **GeoResidence** di lingkungan pengembangan lokal (*local development*).

---

## 1. Prasyarat Sistem (*Prerequisites*)

Sebelum memulai, pastikan perangkat Anda memiliki:

- **Python**: Versi 3.10 atau lebih baru (disarankan 3.11 / 3.12 / 3.14)
- **Node.js**: Versi LTS 18.x atau 20.x ke atas
- **NPM** atau **PNPM / Yarn**
- **Git**
- Peramban web modern (*Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari*)

---

## 2. Struktur Proyek

```
georesidence/
├── backend/                # Server API FastAPI & Basis Data SQLite
│   ├── app/
│   │   ├── api/            # Router API Public & Admin
│   │   ├── core/           # Konfigurasi & Keamanan JWT/Bcrypt
│   │   ├── database/       # Koneksi SQLite & Skrip Inisialisasi
│   │   ├── models/         # Model Data SQLAlchemy
│   │   ├── schemas/        # Validasi Skema Pydantic
│   │   └── services/       # Layanan Privasi Spasial & Impor Berkas
│   ├── tests/              # Pengujian Otomatis Pytest
│   ├── requirements.txt    # Dependensi Python
│   └── .env.example
├── frontend/               # Antarmuka Pengguna React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Komponen UI Peta, Navigasi, & Admin
│   │   ├── pages/          # Halaman Beranda, Peta, Tentang, & Admin
│   │   ├── services/       # Integrasi API & Otentikasi
│   │   └── types/          # Definisi Tipe TypeScript
│   ├── package.json
│   └── .env.example
├── data/
│   └── templates/          # Template Resmi Impor (.CSV & .XLSX)
├── docs/                   # Dokumentasi Teknis
└── README.md
```

---

## 3. Konfigurasi Backend (FastAPI + SQLite)

### Langkah 3.1: Buat Virtual Environment
Buka terminal dan masuk ke direktori backend:
```bash
cd backend
python3 -m venv venv
```

Aktifkan virtual environment:
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```
- **Windows (Command Prompt)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Windows (PowerShell)**:
  ```powershell
  venv\Scripts\Activate.ps1
  ```

### Langkah 3.2: Instal Dependensi
```bash
pip install -r requirements.txt
```

### Langkah 3.3: Konfigurasi Environment File
Salin file template `.env.example`:
```bash
cp .env.example .env
```
Isi konfigurasi pada file `.env`:
```ini
PROJECT_NAME=GeoResidence
DATABASE_URL=sqlite:///./georesidence.db
SECRET_KEY=kunci-rahasia-keamanan-jwt-minimal-32-karakter
ADMIN_INITIAL_USERNAME=admin
ADMIN_INITIAL_PASSWORD=admin123
PRIVACY_MIN_DISPLACEMENT_METERS=120.0
PRIVACY_MAX_DISPLACEMENT_METERS=280.0
```

### Langkah 3.4: Inisialisasi Basis Data & Akun Admin
Jalankan skrip inisialisasi untuk membuat tabel SQLite dan akun admin bawaan:
```bash
python -m app.database.init_db
```
*(Opsional)* Untuk mengisi 10 data simulasi mahasiswa di sekitar kampus ITERA selama masa pengembangan:
```bash
python -m app.database.seed_dev
```

### Langkah 3.5: Jalankan Server Backend
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Akses dokumentasi interaktif Swagger UI di: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 4. Konfigurasi Frontend (React + Vite + Tailwind CSS)

Buka jendela terminal baru:

### Langkah 4.1: Instal Dependensi Node.js
```bash
cd frontend
npm install
```

### Langkah 4.2: Konfigurasi Environment File
Salin file template `.env.example`:
```bash
cp .env.example .env
```
Isi konfigurasi pada file `.env`:
```ini
# Kunci Google Maps JavaScript API (opsional saat pengujian simulasi)
VITE_GOOGLE_MAPS_API_KEY=
```
> **Catatan:** Jika Anda belum memiliki API Key Google Maps, aplikasi secara cerdas akan mengaktifkan **Mode Pratinjau Web GIS Interaktif (Vektor Spasial)** dengan rendering titik hunian mahasiswa, legenda, pencarian, dan kartu info mahasiswa tanpa eror.

### Langkah 4.3: Jalankan Server Pengembangan Frontend
```bash
npm run dev
```
Akses aplikasi melalui peramban: [http://localhost:5173/](http://localhost:5173/)

---

## 5. Menjalankan Pengujian Otomatis (*Automated Testing*)

Jalankan rangkaian pengujian backend untuk memastikan integritas skema data, perlindungan privasi koordinat, otentikasi admin, dan logika impor:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## 6. Kredensial Administrator Bawaan

- **URL Login**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

*(Sangat disarankan untuk mengubah kata sandi atau variabel lingkungan saat rilis produksi)*
