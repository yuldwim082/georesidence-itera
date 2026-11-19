from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoResidence"
    DATABASE_URL: str = "sqlite:///./georesidence.db"
    SECRET_KEY: str = "georesidence-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Default initial admin setup
    ADMIN_INITIAL_USERNAME: str = "admin"
    ADMIN_INITIAL_PASSWORD: str = "admin123"
    
    # Privacy spatial displacement in meters (100 to 250 meters)
    PRIVACY_MIN_DISPLACEMENT_METERS: float = 120.0
    PRIVACY_MAX_DISPLACEMENT_METERS: float = 280.0
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
