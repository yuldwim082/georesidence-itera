import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone
import pandas as pd

from app.database.session import get_db
from app.models.student import Student
from app.models.admin import Admin
from app.models.audit_log import AuditLog
from app.schemas.student import (
    StudentAdmin, StudentCreate, StudentUpdate, StudentPaginatedResponse
)
from app.schemas.admin import (
    AdminLogin, TokenResponse, AdminProfile, AdminDashboardStatistics,
    AuditLogResponse, ImportPreviewResponse, ImportConfirmRequest, ImportConfirmResponse
)
from app.core.security import verify_password, create_access_token, decode_access_token, oauth2_scheme
from app.services.privacy_service import calculate_public_coordinates
from app.services.import_service import parse_file_to_dataframe, preview_import_data, confirm_and_save_import

router = APIRouter(prefix="/api/admin", tags=["Administrator"])

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autentikasi gagal atau sesi telah berakhir",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    return admin

# --- AUTHENTICATION ---

@router.post("/login", response_model=TokenResponse)
def login(login_data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah"
        )
    
    access_token = create_access_token(data={"sub": admin.username, "admin_id": admin.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=admin.username
    )

@router.post("/logout")
def logout(current_admin: Admin = Depends(get_current_admin)):
    return {"message": "Berhasil keluar"}

@router.get("/me", response_model=AdminProfile)
def get_admin_profile(current_admin: Admin = Depends(get_current_admin)):
    return current_admin

# --- DASHBOARD ---

@router.get("/dashboard", response_model=AdminDashboardStatistics)
def get_dashboard_statistics(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total = db.query(Student).count()
    rumah = db.query(Student).filter(Student.residence_type == "Rumah").count()
    kost = db.query(Student).filter(Student.residence_type == "Kost").count()
    kontrakan = db.query(Student).filter(Student.residence_type == "Kontrakan").count()
    
    published = db.query(Student).filter(
        Student.consent_publication.is_(True),
        Student.is_published.is_(True)
    ).count()
    unpublished = total - published

    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()

    return AdminDashboardStatistics(
        total_students=total,
        rumah_count=rumah,
        kost_count=kost,
        kontrakan_count=kontrakan,
        published_count=published,
        unpublished_count=unpublished,
        recent_audit_logs=[
            AuditLogResponse(
                id=log.id,
                admin_id=log.admin_id,
                action=log.action,
                student_id=log.student_id,
                created_at=log.created_at
            ) for log in recent_logs
        ]
    )

# --- STUDENT CRUD ---

@router.get("/students", response_model=StudentPaginatedResponse)
def list_students(
    search: Optional[str] = Query(None, description="Cari nama atau NIM"),
    residence_type: Optional[str] = Query(None, description="Filter kategori"),
    is_published: Optional[bool] = Query(None, description="Filter status publikasi"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=200),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter((Student.name.ilike(term)) | (Student.nim.ilike(term)))

    if residence_type and residence_type.lower() != "all":
        query = query.filter(Student.residence_type == residence_type)

    if is_published is not None:
        query = query.filter(Student.is_published == is_published)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = query.order_by(Student.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return StudentPaginatedResponse(
        items=[StudentAdmin.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("/students", response_model=StudentAdmin, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Check duplicate NIM
    existing = db.query(Student).filter(Student.nim == student_in.nim).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"NIM '{student_in.nim}' sudah terdaftar dalam sistem"
        )

    # Compute generalized coordinates
    pub_lat, pub_lon = calculate_public_coordinates(
        student_in.latitude,
        student_in.longitude,
        seed_identifier=student_in.nim
    )

    new_student = Student(
        nim=student_in.nim.strip(),
        name=student_in.name.strip(),
        residence_type=student_in.residence_type,
        latitude=student_in.latitude,
        longitude=student_in.longitude,
        public_latitude=pub_lat,
        public_longitude=pub_lon,
        consent_publication=student_in.consent_publication,
        is_published=student_in.is_published,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Audit log
    audit = AuditLog(
        admin_id=current_admin.id,
        action=f"Menambahkan mahasiswa: {new_student.name} ({new_student.nim})",
        student_id=new_student.id
    )
    db.add(audit)
    db.commit()

    return StudentAdmin.model_validate(new_student)

@router.get("/students/{id}", response_model=StudentAdmin)
def get_student(
    id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Data mahasiswa tidak ditemukan")
    return StudentAdmin.model_validate(student)

@router.put("/students/{id}", response_model=StudentAdmin)
def update_student(
    id: int,
    student_in: StudentUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Data mahasiswa tidak ditemukan")

    # If updating NIM, ensure uniqueness
    if student_in.nim and student_in.nim != student.nim:
        existing = db.query(Student).filter(Student.nim == student_in.nim).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"NIM '{student_in.nim}' sudah digunakan mahasiswa lain"
            )
        student.nim = student_in.nim.strip()

    if student_in.name is not None:
        student.name = student_in.name.strip()
    if student_in.residence_type is not None:
        student.residence_type = student_in.residence_type
    
    # Check if coordinates updated
    coords_changed = False
    if student_in.latitude is not None:
        student.latitude = student_in.latitude
        coords_changed = True
    if student_in.longitude is not None:
        student.longitude = student_in.longitude
        coords_changed = True

    if coords_changed or student_in.nim:
        pub_lat, pub_lon = calculate_public_coordinates(
            student.latitude,
            student.longitude,
            seed_identifier=student.nim
        )
        student.public_latitude = pub_lat
        student.public_longitude = pub_lon

    if student_in.consent_publication is not None:
        student.consent_publication = student_in.consent_publication
    if student_in.is_published is not None:
        student.is_published = student_in.is_published

    student.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(student)

    # Audit log
    audit = AuditLog(
        admin_id=current_admin.id,
        action=f"Memperbarui data mahasiswa: {student.name} ({student.nim})",
        student_id=student.id
    )
    db.add(audit)
    db.commit()

    return StudentAdmin.model_validate(student)

@router.delete("/students/reset-all")
def reset_all_students(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Deletes ALL student records from the database.
    Used for resetting test data before importing real cohort records.
    """
    count = db.query(Student).count()
    db.query(Student).delete()

    # Audit log
    audit = AuditLog(
        admin_id=current_admin.id,
        action=f"Reset seluruh data mahasiswa: {count} data berhasil dihapus",
        student_id=None
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Berhasil mereset seluruh data mahasiswa ({count} data dihapus)",
        "deleted_count": count
    }

@router.delete("/students/{id}")
def delete_student(
    id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Data mahasiswa tidak ditemukan")

    name = student.name
    nim = student.nim

    db.delete(student)
    db.commit()

    # Audit log
    audit = AuditLog(
        admin_id=current_admin.id,
        action=f"Menghapus data mahasiswa: {name} ({nim})",
        student_id=None
    )
    db.add(audit)
    db.commit()

    return {"message": f"Data mahasiswa {name} ({nim}) berhasil dihapus"}

# --- IMPORT WORKFLOW ---

@router.post("/import/preview", response_model=ImportPreviewResponse)
async def import_preview(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    try:
        df = parse_file_to_dataframe(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    preview_result = preview_import_data(df, db)
    return ImportPreviewResponse(**preview_result)

@router.post("/import/confirm", response_model=ImportConfirmResponse)
def import_confirm(
    request: ImportConfirmRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        result = confirm_and_save_import(
            rows=request.rows,
            skip_duplicates=request.skip_duplicates,
            admin_id=current_admin.id,
            db=db
        )
        return ImportConfirmResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan import: {str(e)}")

# --- TEMPLATES & EXPORTS ---

@router.get("/export/template")
def download_template(format: str = Query("csv", pattern="^(csv|xlsx)$")):
    """
    Downloads standardized blank template for student data import.
    """
    sample_data = [
        {"NIM": "121110001", "Nama": "Contoh Mahasiswa 1", "Kategori": "Kost", "Latitude": -5.358241, "Longitude": 105.312984},
        {"NIM": "121110002", "Nama": "Contoh Mahasiswa 2", "Kategori": "Rumah", "Latitude": -5.372105, "Longitude": 105.289123},
        {"NIM": "121110003", "Nama": "Contoh Mahasiswa 3", "Kategori": "Kontrakan", "Latitude": -5.361902, "Longitude": 105.321456},
    ]
    df = pd.DataFrame(sample_data)

    if format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=template_georesidence.csv"}
        )
    else:
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name="Data Mahasiswa")
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=template_georesidence.xlsx"}
        )

@router.get("/export/students")
def export_students(
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    students = db.query(Student).order_by(Student.id.asc()).all()
    data = []
    for s in students:
        data.append({
            "ID": s.id,
            "NIM": s.nim,
            "Nama": s.name,
            "Kategori": s.residence_type,
            "Latitude": s.latitude,
            "Longitude": s.longitude,
            "Public_Latitude": s.public_latitude,
            "Public_Longitude": s.public_longitude,
            "Persetujuan_Publikasi": "Ya" if s.consent_publication else "Tidak",
            "Status_Publikasi": "Dipublikasikan" if s.is_published else "Draft",
            "Dibuat": s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    df = pd.DataFrame(data)

    if format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=data_mahasiswa_georesidence.csv"}
        )
    else:
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name="Data Mahasiswa")
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=data_mahasiswa_georesidence.xlsx"}
        )
