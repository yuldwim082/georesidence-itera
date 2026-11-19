import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import SessionLocal
from app.database.init_db import init_db
from app.api.public import router as public_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and admin exist
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Web GIS / Interactive Residential Mapping untuk Mahasiswa Geomatika ITERA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware - allows frontend from other domains/ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes FIRST so they take precedence over SPA catch-all
app.include_router(public_router)
app.include_router(admin_router)

# Locate frontend static build directory if present
FRONTEND_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
)

if os.path.exists(FRONTEND_DIST) and os.path.isfile(os.path.join(FRONTEND_DIST, "index.html")):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "GeoResidence API",
            "documentation": "/docs",
            "public_api": "/api/public",
            "admin_api": "/api/admin"
        }
