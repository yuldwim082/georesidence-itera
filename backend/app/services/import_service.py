import io
import pandas as pd
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.audit_log import AuditLog
from app.services.privacy_service import calculate_public_coordinates

# Mapping known headers to canonical keys
COLUMN_SYNONYMS = {
    "nim": ["nim", "nomor induk mahasiswa", "student_id", "id_mahasiswa"],
    "name": ["nama", "name", "nama mahasiswa", "student_name", "nama_lengkap", "nama lengkap"],
    "residence_type": ["kategori", "category", "residence_type", "jenis tempat tinggal", "jenis_tempat_tinggal", "tipe", "tempat tinggal", "status_tempat_tinggal"],
    "latitude": ["latitude", "lat", "lintang", "y", "garis lintang"],
    "longitude": ["longitude", "lon", "lng", "long", "bujur", "x", "garis bujur"],
}

def normalize_column_name(col: str) -> str:
    cleaned = str(col).strip().lower().replace("_", " ")
    for canonical, synonyms in COLUMN_SYNONYMS.items():
        for syn in synonyms:
            if cleaned == syn or cleaned == syn.replace(" ", "_"):
                return canonical
    return cleaned

def parse_file_to_dataframe(file_contents: bytes, filename: str) -> pd.DataFrame:
    filename_lower = filename.lower()
    if filename_lower.endswith(".csv"):
        # Attempt UTF-8, then latin-1 or auto-detected delimiter
        try:
            df = pd.read_csv(io.BytesIO(file_contents), encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(file_contents), encoding="latin-1")
    elif filename_lower.endswith(".xlsx") or filename_lower.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_contents))
    else:
        raise ValueError("Format file tidak didukung. Harap unggah file .csv atau .xlsx")
    return df

def preview_import_data(df: pd.DataFrame, db: Session) -> Dict[str, Any]:
    # Normalize headers
    mapped_columns = {}
    for col in df.columns:
        canonical = normalize_column_name(col)
        mapped_columns[col] = canonical

    df = df.rename(columns=mapped_columns)
    columns_found = list(df.columns)

    required_canonical = ["nim", "name", "residence_type", "latitude", "longitude"]
    missing_required = [col for col in required_canonical if col not in df.columns]

    # Pre-fetch existing NIMs from DB for fast duplicate detection
    existing_db_nims = set(row[0] for row in db.query(Student.nim).all())

    preview_rows = []
    seen_file_nims = set()
    valid_count = 0
    invalid_count = 0
    duplicate_count = 0

    for idx, row in df.iterrows():
        row_number = idx + 2  # 1-based index accounting for header row
        errors = []

        # NIM check
        raw_nim = row.get("nim")
        nim_str = str(raw_nim).strip() if pd.notna(raw_nim) else ""
        if not nim_str or nim_str == "nan":
            errors.append("NIM tidak boleh kosong")
        
        # Check duplicate
        is_duplicate = False
        if nim_str:
            if nim_str in seen_file_nims:
                errors.append(f"Duplikat NIM '{nim_str}' ditemukan dalam file")
                is_duplicate = True
            elif nim_str in existing_db_nims:
                errors.append(f"NIM '{nim_str}' sudah terdaftar dalam basis data")
                is_duplicate = True
            seen_file_nims.add(nim_str)

        # Name check
        raw_name = row.get("name")
        name_str = str(raw_name).strip() if pd.notna(raw_name) else ""
        if not name_str or name_str == "nan":
            errors.append("Nama mahasiswa tidak boleh kosong")

        # Residence type check
        raw_type = row.get("residence_type")
        type_str = str(raw_type).strip().capitalize() if pd.notna(raw_type) else ""
        if type_str in ["Kost", "Kos"]:
            normalized_type = "Kost"
        elif type_str in ["Kontrakan", "Kontrak"]:
            normalized_type = "Kontrakan"
        elif type_str in ["Rumah"]:
            normalized_type = "Rumah"
        else:
            errors.append(f"Kategori '{type_str}' tidak valid (pilihan: Rumah, Kost, Kontrakan)")
            normalized_type = type_str

        # Coordinates check
        lat_val = None
        lon_val = None
        try:
            raw_lat = row.get("latitude")
            if pd.isna(raw_lat) or str(raw_lat).strip() == "":
                errors.append("Latitude tidak boleh kosong")
            else:
                lat_val = float(str(raw_lat).replace(",", "."))
                if not (-90.0 <= lat_val <= 90.0):
                    errors.append(f"Latitude ({lat_val}) di luar batas valid (-90 s/d 90)")
        except (ValueError, TypeError):
            errors.append("Latitude harus berupa angka numerik valid")

        try:
            raw_lon = row.get("longitude")
            if pd.isna(raw_lon) or str(raw_lon).strip() == "":
                errors.append("Longitude tidak boleh kosong")
            else:
                lon_val = float(str(raw_lon).replace(",", "."))
                if not (-180.0 <= lon_val <= 180.0):
                    errors.append(f"Longitude ({lon_val}) di luar batas valid (-180 s/d 180)")
        except (ValueError, TypeError):
            errors.append("Longitude harus berupa angka numerik valid")

        is_valid = len(errors) == 0

        if is_duplicate:
            duplicate_count += 1
        if is_valid:
            valid_count += 1
        else:
            invalid_count += 1

        preview_rows.append({
            "row_number": row_number,
            "nim": nim_str,
            "name": name_str,
            "residence_type": normalized_type,
            "latitude": lat_val,
            "longitude": lon_val,
            "is_valid": is_valid,
            "errors": errors,
            "is_duplicate": is_duplicate,
        })

    return {
        "total_rows": len(df),
        "valid_rows": valid_count,
        "invalid_rows": invalid_count,
        "duplicate_rows": duplicate_count,
        "columns_found": columns_found,
        "missing_required_columns": missing_required,
        "preview": preview_rows,
    }

def confirm_and_save_import(
    rows: List[Dict[str, Any]],
    skip_duplicates: bool,
    admin_id: int,
    db: Session
) -> Dict[str, Any]:
    """
    Executes database transaction to import validated rows.
    """
    existing_db_nims = set(row[0] for row in db.query(Student.nim).all())
    seen_import_nims = set()
    
    imported_count = 0
    skipped_count = 0
    failed_count = 0
    errors = []

    try:
        with db.begin_nested():
            for item in rows:
                nim = str(item.get("nim", "")).strip()
                name = str(item.get("name", "")).strip()
                res_type = str(item.get("residence_type", "")).strip()
                lat = item.get("latitude")
                lon = item.get("longitude")
                row_no = item.get("row_number", "?")

                # Basic validation
                if not nim or not name or not res_type or lat is None or lon is None:
                    failed_count += 1
                    errors.append(f"Baris {row_no}: Field wajib tidak lengkap")
                    continue

                # Check duplicate
                if nim in existing_db_nims or nim in seen_import_nims:
                    if skip_duplicates:
                        skipped_count += 1
                        continue
                    else:
                        failed_count += 1
                        errors.append(f"Baris {row_no}: Duplikat NIM '{nim}'")
                        continue

                # Calculate generalized public coordinates
                pub_lat, pub_lon = calculate_public_coordinates(lat, lon, seed_identifier=nim)

                student = Student(
                    nim=nim,
                    name=name,
                    residence_type=res_type,
                    latitude=lat,
                    longitude=lon,
                    public_latitude=pub_lat,
                    public_longitude=pub_lon,
                    consent_publication=True,
                    is_published=True
                )
                db.add(student)
                seen_import_nims.add(nim)
                existing_db_nims.add(nim)
                imported_count += 1

            # Log audit entry
            audit = AuditLog(
                admin_id=admin_id,
                action=f"Bulk Import: {imported_count} imported, {skipped_count} skipped, {failed_count} failed."
            )
            db.add(audit)

        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {
        "imported_count": imported_count,
        "skipped_count": skipped_count,
        "failed_count": failed_count,
        "errors": errors,
    }
