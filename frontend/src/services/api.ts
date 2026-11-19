import {
  StudentPublic,
  PublicStatistics,
  StudentPaginatedResponse,
  StudentAdmin,
  AdminDashboardStatistics,
  ImportPreviewResponse,
  ImportConfirmResponse,
} from '../types';
import { authService } from './auth';
import fallbackStudents from '../data/studentsFallback.json';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, '')}/api`
  : '/api';

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Terjadi kesalahan sistem';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || errorDetail;
    } catch {
      // Ignore JSON parse error
    }
    if (response.status === 401) {
      authService.clearAuth();
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  // Public
  async getPublicStudents(search?: string, category?: string): Promise<StudentPublic[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All' && category !== 'Semua') {
      params.append('category', category);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    
    try {
      return await fetchJSON<StudentPublic[]>(`${API_BASE}/public/students${query}`);
    } catch (err) {
      // Graceful fallback for static hosting (e.g. GitHub Pages without live backend)
      let students: StudentPublic[] = (fallbackStudents as Array<{
        name: string;
        residence_type: string;
        public_latitude: number;
        public_longitude: number;
      }>).map((s, idx) => ({
        id: idx + 1,
        name: s.name,
        residence_type: s.residence_type as any,
        public_latitude: s.public_latitude,
        public_longitude: s.public_longitude,
      }));

      if (category && category !== 'All' && category !== 'Semua') {
        students = students.filter((s) => s.residence_type === category);
      }
      if (search) {
        const q = search.trim().toLowerCase();
        students = students.filter((s) => s.name.toLowerCase().includes(q));
      }
      return students;
    }
  },

  async getPublicStatistics(): Promise<PublicStatistics> {
    try {
      return await fetchJSON<PublicStatistics>(`${API_BASE}/public/statistics`);
    } catch {
      // Graceful fallback calculated from 137 student records
      const raw = fallbackStudents as Array<{ residence_type: string }>;
      return {
        total_students: raw.length,
        rumah_count: raw.filter((s) => s.residence_type === 'Rumah').length,
        kost_count: raw.filter((s) => s.residence_type === 'Kost').length,
        kontrakan_count: raw.filter((s) => s.residence_type === 'Kontrakan').length,
        updated_at: new Date().toISOString(),
      };
    }
  },

  // Admin Auth
  async login(username: string, password: string):Promise<{ access_token: string; token_type: string; username: string }> {
    return fetchJSON<{ access_token: string; token_type: string; username: string }>(`${API_BASE}/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/admin/logout`, { method: 'POST' });
    } finally {
      authService.clearAuth();
    }
  },

  // Admin Dashboard
  async getDashboardStatistics(): Promise<AdminDashboardStatistics> {
    return fetchJSON<AdminDashboardStatistics>(`${API_BASE}/admin/dashboard`);
  },

  // Admin Student CRUD
  async getAdminStudents(params: {
    search?: string;
    residence_type?: string;
    is_published?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<StudentPaginatedResponse> {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.append('search', params.search);
    if (params.residence_type && params.residence_type !== 'All') {
      urlParams.append('residence_type', params.residence_type);
    }
    if (params.is_published !== undefined) {
      urlParams.append('is_published', String(params.is_published));
    }
    if (params.page) urlParams.append('page', String(params.page));
    if (params.page_size) urlParams.append('page_size', String(params.page_size));

    return fetchJSON<StudentPaginatedResponse>(`${API_BASE}/admin/students?${urlParams.toString()}`);
  },

  async createStudent(student: {
    nim: string;
    name: string;
    residence_type: string;
    latitude: number;
    longitude: number;
    consent_publication: boolean;
    is_published: boolean;
  }): Promise<StudentAdmin> {
    return fetchJSON<StudentAdmin>(`${API_BASE}/admin/students`, {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },

  async updateStudent(id: number, student: Partial<StudentAdmin>): Promise<StudentAdmin> {
    return fetchJSON<StudentAdmin>(`${API_BASE}/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  },

  async deleteStudent(id: number): Promise<{ message: string }> {
    return fetchJSON<{ message: string }>(`${API_BASE}/admin/students/${id}`, {
      method: 'DELETE',
    });
  },

  async resetAllStudents(): Promise<{ message: string; deleted_count: number }> {
    return fetchJSON<{ message: string; deleted_count: number }>(`${API_BASE}/admin/students/reset-all`, {
      method: 'DELETE',
    });
  },

  // Import
  async previewImport(file: File): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJSON<ImportPreviewResponse>(`${API_BASE}/admin/import/preview`, {
      method: 'POST',
      body: formData,
    });
  },

  async confirmImport(rows: unknown[], skipDuplicates: boolean): Promise<ImportConfirmResponse> {
    return fetchJSON<ImportConfirmResponse>(`${API_BASE}/admin/import/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        rows,
        skip_duplicates: skipDuplicates,
      }),
    });
  },

  // Export URLs
  getTemplateUrl(format: 'csv' | 'xlsx'): string {
    return `${API_BASE}/admin/export/template?format=${format}`;
  },

  getExportStudentsUrl(format: 'csv' | 'xlsx'): string {
    return `${API_BASE}/admin/export/students?format=${format}`;
  },
};
