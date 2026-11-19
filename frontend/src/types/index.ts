export type ResidenceType = 'Rumah' | 'Kost' | 'Kontrakan';

export interface StudentPublic {
  id: number;
  name: string;
  residence_type: ResidenceType;
  public_latitude: number;
  public_longitude: number;
}

export interface PublicStatistics {
  total_students: number;
  rumah_count: number;
  kost_count: number;
  kontrakan_count: number;
  updated_at: string;
}

export interface StudentAdmin {
  id: number;
  nim: string;
  name: string;
  residence_type: ResidenceType;
  latitude: number;
  longitude: number;
  public_latitude?: number;
  public_longitude?: number;
  consent_publication: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentPaginatedResponse {
  items: StudentAdmin[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  action: string;
  student_id?: number | null;
  created_at: string;
}

export interface AdminDashboardStatistics {
  total_students: number;
  rumah_count: number;
  kost_count: number;
  kontrakan_count: number;
  published_count: number;
  unpublished_count: number;
  recent_audit_logs: AuditLog[];
}

export interface ImportRowPreview {
  row_number: number;
  nim: string;
  name: string;
  residence_type: string;
  latitude: number | null;
  longitude: number | null;
  is_valid: boolean;
  errors: string[];
  is_duplicate: boolean;
}

export interface ImportPreviewResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  preview: ImportRowPreview[];
  columns_found: string[];
}

export interface ImportConfirmResponse {
  imported_count: number;
  skipped_count: number;
  failed_count: number;
  errors: string[];
}
