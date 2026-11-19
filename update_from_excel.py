#!/usr/bin/env python3
"""
Skrip Pembantu GeoResidence: Memperbarui Data Titik dari Berkas Excel (.xlsx) atau CSV (.csv).
Cara penggunaan:
    python3 update_from_excel.py data_mahasiswa_baru.xlsx
    atau
    python3 update_from_excel.py data_mahasiswa_baru.csv
"""

import sys
import os
import json
import pandas as pd

def update_students_data(file_path: str):
    if not os.path.isfile(file_path):
        print(f"Error: Berkas '{file_path}' tidak ditemukan.")
        sys.exit(1)

    print(f">> Membaca berkas: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.xlsx', '.xls']:
        df = pd.read_excel(file_path)
    elif ext == '.csv':
        df = pd.read_csv(file_path)
    else:
        print("Error: Format berkas harus .xlsx, .xls, atau .csv")
        sys.exit(1)

    # Normalisasi nama kolom
    col_map = {}
    for col in df.columns:
        c_lower = str(col).strip().lower()
        if 'nim' in c_lower:
            col_map['nim'] = col
        elif 'nama' in c_lower or 'name' in c_lower:
            col_map['name'] = col
        elif 'kategori' in c_lower or 'residence' in c_lower or 'tipe' in c_lower:
            col_map['residence_type'] = col
        elif 'lat' in c_lower:
            col_map['latitude'] = col
        elif 'lon' in c_lower or 'lng' in c_lower:
            col_map['longitude'] = col

    required = ['nim', 'name', 'residence_type', 'latitude', 'longitude']
    missing = [r for r in required if r not in col_map]
    if missing:
        print(f"Error: Kolom berikut tidak ditemukan di berkas Anda: {missing}")
        print("Pastikan berkas memiliki kolom: NIM, Nama, Kategori, Latitude, Longitude")
        sys.exit(1)

    students = []
    for _, row in df.iterrows():
        cat = str(row[col_map['residence_type']]).strip().capitalize()
        if cat not in ['Rumah', 'Kost', 'Kontrakan']:
            cat = 'Kost'

        try:
            lat = float(row[col_map['latitude']])
            lon = float(row[col_map['longitude']])
        except (ValueError, TypeError):
            continue

        nim = str(row[col_map['nim']]).strip()
        name = str(row[col_map['name']]).strip()

        students.append({
            "nim": nim,
            "name": name,
            "residence_type": cat,
            "latitude": lat,
            "longitude": lon,
            "public_latitude": lat,
            "public_longitude": lon,
            "consent_publication": 1,
            "is_published": 1
        })

    print(f">> Berhasil memproses {len(students)} data mahasiswa.")

    # Simpan ke frontend data fallback (yang dibaca GitHub Pages)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(base_dir, "frontend", "src", "data", "studentsFallback.json")
    backend_path = os.path.join(base_dir, "backend", "app", "database", "initial_students.json")

    os.makedirs(os.path.dirname(frontend_path), exist_ok=True)
    with open(frontend_path, "w", encoding="utf-8") as f:
        json.dump(students, f, indent=2, ensure_ascii=False)
    print(f">> Tersimpan ke: {frontend_path}")

    os.makedirs(os.path.dirname(backend_path), exist_ok=True)
    with open(backend_path, "w", encoding="utf-8") as f:
        json.dump(students, f, indent=2, ensure_ascii=False)
    print(f">> Tersimpan ke: {backend_path}")

    print("\nSelesai! Langkah selanjutnya untuk mengunggah ke GitHub:")
    print("    git add .")
    print('    git commit -m "update: pembaruan data titik mahasiswa"')
    print("    git push origin main")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Penggunaan: python3 update_from_excel.py <nama_file.xlsx / .csv>")
        sys.exit(1)
    update_students_data(sys.argv[1])
