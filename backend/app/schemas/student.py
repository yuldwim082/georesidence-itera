from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

# PUBLIC SCHEMAS — strictly sanitized
class StudentPublic(BaseModel):
    id: int
    name: str
    residence_type: str
    public_latitude: float
    public_longitude: float

    model_config = ConfigDict(from_attributes=True)

class PublicStatistics(BaseModel):
    total_students: int
    rumah_count: int
    kost_count: int
    kontrakan_count: int
    updated_at: datetime

# ADMIN SCHEMAS
class StudentBase(BaseModel):
    nim: str = Field(..., min_length=2, max_length=32, description="Nomor Induk Mahasiswa")
    name: str = Field(..., min_length=1, max_length=128, description="Nama Mahasiswa")
    residence_type: str = Field(..., description="Rumah, Kost, atau Kontrakan")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Garis Lintang")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Garis Bujur")
    consent_publication: bool = True
    is_published: bool = True

    @field_validator("residence_type")
    @classmethod
    def validate_residence_type(cls, v: str) -> str:
        normalized = v.strip().capitalize()
        if normalized in ["Kost", "Kos"]:
            return "Kost"
        elif normalized in ["Kontrakan", "Kontrak"]:
            return "Kontrakan"
        elif normalized in ["Rumah"]:
            return "Rumah"
        raise ValueError("Kategori tempat tinggal harus berupa: Rumah, Kost, atau Kontrakan")

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    nim: Optional[str] = Field(None, min_length=2, max_length=32)
    name: Optional[str] = Field(None, min_length=1, max_length=128)
    residence_type: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    consent_publication: Optional[bool] = None
    is_published: Optional[bool] = None

    @field_validator("residence_type")
    @classmethod
    def validate_residence_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        normalized = v.strip().capitalize()
        if normalized in ["Kost", "Kos"]:
            return "Kost"
        elif normalized in ["Kontrakan", "Kontrak"]:
            return "Kontrakan"
        elif normalized in ["Rumah"]:
            return "Rumah"
        raise ValueError("Kategori tempat tinggal harus berupa: Rumah, Kost, atau Kontrakan")

class StudentAdmin(StudentBase):
    id: int
    public_latitude: Optional[float] = None
    public_longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentPaginatedResponse(BaseModel):
    items: List[StudentAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int
