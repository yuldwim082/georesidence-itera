from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.student import Student
from app.schemas.student import StudentPublic, PublicStatistics

router = APIRouter(prefix="/api/public", tags=["Public"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GeoResidence Web GIS API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/students", response_model=List[StudentPublic])
def get_public_students(
    search: Optional[str] = Query(None, description="Cari nama mahasiswa"),
    category: Optional[str] = Query(None, description="Filter kategori: Rumah, Kost, Kontrakan"),
    db: Session = Depends(get_db)
):
    """
    Returns sanitized public student residence locations.
    Only students with consent_publication=True and is_published=True are returned.
    Exposes ONLY generalized public_latitude and public_longitude.
    """
    query = db.query(Student).filter(
        Student.consent_publication.is_(True),
        Student.is_published.is_(True)
    )

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(Student.name.ilike(search_term))

    if category and category.strip().lower() != "all" and category.strip().lower() != "semua":
        cat_norm = category.strip().capitalize()
        query = query.filter(Student.residence_type == cat_norm)

    students = query.order_by(Student.name.asc()).all()

    # Output actual coordinates directly for accurate map placement
    sanitized = []
    for s in students:
        actual_lat = round(s.latitude, 6)
        actual_lon = round(s.longitude, 6)
        sanitized.append(StudentPublic(
            id=s.id,
            name=s.name,
            residence_type=s.residence_type,
            public_latitude=actual_lat,
            public_longitude=actual_lon
        ))
    return sanitized

@router.get("/statistics", response_model=PublicStatistics)
def get_public_statistics(db: Session = Depends(get_db)):
    """
    Returns dynamically computed residential category statistics for published records.
    """
    base_query = db.query(Student).filter(
        Student.consent_publication.is_(True),
        Student.is_published.is_(True)
    )

    total = base_query.count()
    rumah = base_query.filter(Student.residence_type == "Rumah").count()
    kost = base_query.filter(Student.residence_type == "Kost").count()
    kontrakan = base_query.filter(Student.residence_type == "Kontrakan").count()

    latest_student = base_query.order_by(Student.updated_at.desc()).first()
    updated_at = latest_student.updated_at if latest_student else datetime.now(timezone.utc)

    return PublicStatistics(
        total_students=total,
        rumah_count=rumah,
        kost_count=kost,
        kontrakan_count=kontrakan,
        updated_at=updated_at
    )
