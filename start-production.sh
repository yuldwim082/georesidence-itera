#!/usr/bin/env bash
# ==============================================================================
# GeoResidence Production Startup Script
# Menjalankan frontend build + backend FastAPI dalam satu proses server produksi
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== GeoResidence Production Setup & Launch ==="

# 1. Pastikan build frontend telah tersedia
if [ ! -d "frontend/dist" ] || [ ! -f "frontend/dist/index.html" ]; then
    echo ">> Membangun aset frontend produksi (npm run build)..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd "$SCRIPT_DIR"
else
    echo ">> Aset frontend produksi siap di frontend/dist."
fi

# 2. Setup backend environment
cd backend
if [ ! -d "venv" ]; then
    echo ">> Membuat virtualenv python..."
    python3 -m venv venv
    venv/bin/pip install --upgrade pip
    venv/bin/pip install -r requirements.txt
fi

# 3. Jalankan server produksi Uvicorn
PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

# Periksa apakah port sedang digunakan oleh proses lain
BUSY_PID=$(lsof -t -i:"$PORT" 2>/dev/null || true)
if [ -n "$BUSY_PID" ]; then
    echo ">> Port $PORT sedang digunakan oleh PID: $BUSY_PID. Menghentikan proses lama..."
    kill -9 $BUSY_PID 2>/dev/null || true
    sleep 1
fi

echo ">> Menjalankan GeoResidence pada http://${HOST}:${PORT} ..."
echo ">> Halaman Web & Peta: http://${HOST}:${PORT}/"
echo ">> Dokumentasi API: http://${HOST}:${PORT}/docs"
echo ">> Tekan Ctrl+C untuk menghentikan server."

exec venv/bin/uvicorn app.main:app --host "$HOST" --port "$PORT" --workers 2
