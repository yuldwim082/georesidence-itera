from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.database.session import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nim = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), index=True, nullable=False)
    residence_type = Column(String(32), index=True, nullable=False)  # 'Rumah', 'Kost', 'Kontrakan'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    public_latitude = Column(Float, nullable=True)
    public_longitude = Column(Float, nullable=True)
    consent_publication = Column(Boolean, default=True, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
