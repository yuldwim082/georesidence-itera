import os
import json
from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.admin import Admin
from app.models.student import Student
from app.models.audit_log import AuditLog
from app.core.security import get_password_hash
from app.core.config import settings

def init_db(db: Session):
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Check and create initial administrator
    existing_admin = db.query(Admin).filter(Admin.username == settings.ADMIN_INITIAL_USERNAME).first()
    if not existing_admin:
        admin = Admin(
            username=settings.ADMIN_INITIAL_USERNAME,
            password_hash=get_password_hash(settings.ADMIN_INITIAL_PASSWORD)
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"[Init DB] Administrator initialized: {admin.username}")
    else:
        print(f"[Init DB] Administrator '{existing_admin.username}' already exists.")

    # Check and populate initial student data if database is empty
    student_count = db.query(Student).count()
    if student_count == 0:
        json_path = os.path.join(os.path.dirname(__file__), "initial_students.json")
        if os.path.isfile(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    students_data = json.load(f)
                for item in students_data:
                    student = Student(
                        nim=item["nim"],
                        name=item["name"],
                        residence_type=item["residence_type"],
                        latitude=item["latitude"],
                        longitude=item["longitude"],
                        public_latitude=item.get("public_latitude"),
                        public_longitude=item.get("public_longitude"),
                        consent_publication=item.get("consent_publication", True),
                        is_published=item.get("is_published", True)
                    )
                    db.add(student)
                db.commit()
                print(f"[Init DB] Successfully seeded {len(students_data)} initial student records.")
            except Exception as e:
                db.rollback()
                print(f"[Init DB] Warning: Failed to auto-seed students: {e}")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
