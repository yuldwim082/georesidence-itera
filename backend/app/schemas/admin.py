from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class AdminProfile(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    student_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AdminDashboardStatistics(BaseModel):
    total_students: int
    rumah_count: int
    kost_count: int
    kontrakan_count: int
    published_count: int
    unpublished_count: int
    recent_audit_logs: List[AuditLogResponse]

class ImportRowPreview(BaseModel):
    row_number: int
    nim: str
    name: str
    residence_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_valid: bool
    errors: List[str]
    is_duplicate: bool

class ImportPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    preview: List[ImportRowPreview]
    columns_found: List[str]

class ImportConfirmRequest(BaseModel):
    skip_duplicates: bool = True
    rows: List[dict]

class ImportConfirmResponse(BaseModel):
    imported_count: int
    skipped_count: int
    failed_count: int
    errors: List[str]
