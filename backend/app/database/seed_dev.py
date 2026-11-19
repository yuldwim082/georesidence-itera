"""
Development testing seed script.
Populates sample student records around ITERA (Institut Teknologi Sumatera), South Lampung.
FOR TESTING ONLY — do not use for production.
"""
from app.database.session import SessionLocal
from app.models.student import Student
from app.models.audit_log import AuditLog
from app.services.privacy_service import calculate_public_coordinates

SAMPLE_STUDENTS = [
    {"nim": "121110001", "name": "Ahmad Pratama", "residence_type": "Kost", "latitude": -5.358210, "longitude": 105.312940},
    {"nim": "121110002", "name": "Budi Santoso", "residence_type": "Rumah", "latitude": -5.372105, "longitude": 105.289123},
    {"nim": "121110003", "name": "Citra Lestari", "residence_type": "Kontrakan", "latitude": -5.361902, "longitude": 105.321456},
    {"nim": "121110004", "name": "Dewi Anggraini", "residence_type": "Kost", "latitude": -5.365400, "longitude": 105.315000},
    {"nim": "121110005", "name": "Eko Prasetyo", "residence_type": "Kost", "latitude": -5.354120, "longitude": 105.309870},
    {"nim": "121110006", "name": "Fajar Hidayat", "residence_type": "Rumah", "latitude": -5.385000, "longitude": 105.260000},
    {"nim": "121110007", "name": "Gita Maharani", "residence_type": "Kontrakan", "latitude": -5.368900, "longitude": 105.319500},
    {"nim": "121110008", "name": "Hendra Wijaya", "residence_type": "Kost", "latitude": -5.359800, "longitude": 105.311200},
    {"nim": "121110009", "name": "Indah Permata", "residence_type": "Rumah", "latitude": -5.391200, "longitude": 105.275000},
    {"nim": "121110010", "name": "Joko Susilo", "residence_type": "Kost", "latitude": -5.363200, "longitude": 105.314100},
]

def seed_sample_data():
    db = SessionLocal()
    try:
        count = 0
        for s in SAMPLE_STUDENTS:
            existing = db.query(Student).filter(Student.nim == s["nim"]).first()
            if not existing:
                pub_lat, pub_lon = calculate_public_coordinates(s["latitude"], s["longitude"], seed_identifier=s["nim"])
                student = Student(
                    nim=s["nim"],
                    name=s["name"],
                    residence_type=s["residence_type"],
                    latitude=s["latitude"],
                    longitude=s["longitude"],
                    public_latitude=pub_lat,
                    public_longitude=pub_lon,
                    consent_publication=True,
                    is_published=True
                )
                db.add(student)
                count += 1
        db.commit()
        print(f"[Seed Dev] Successfully added {count} sample student records.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_data()
