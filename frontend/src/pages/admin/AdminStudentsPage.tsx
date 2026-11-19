import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { StudentAdmin, ResidenceType } from '../../types';
import { StudentModal } from '../../components/admin/StudentModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { ResetAllConfirmModal } from '../../components/admin/ResetAllConfirmModal';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [residenceFilter, setResidenceFilter] = useState('All');
  const [publishedFilter, setPublishedFilter] = useState<'All' | 'true' | 'false'>('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentAdmin | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminStudents({
        search: search.trim() || undefined,
        residence_type: residenceFilter !== 'All' ? residenceFilter : undefined,
        is_published: publishedFilter === 'All' ? undefined : publishedFilter === 'true',
        page,
        page_size: pageSize,
      });
      setStudents(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [search, residenceFilter, publishedFilter, page, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateOrUpdate = async (data: {
    nim: string;
    name: string;
    residence_type: ResidenceType;
    latitude: number;
    longitude: number;
    consent_publication: boolean;
    is_published: boolean;
  }) => {
    if (studentToEdit) {
      await apiService.updateStudent(studentToEdit.id, data);
    } else {
      await apiService.createStudent(data);
    }
    fetchStudents();
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await apiService.deleteStudent(deleteTarget.id);
      fetchStudents();
    }
  };

  const handleResetAll = async () => {
    await apiService.resetAllStudents();
    fetchStudents();
  };

  const getCategoryBadge = (type: ResidenceType) => {
    switch (type) {
      case 'Rumah':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Kost':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Kontrakan':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-cream-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Manajemen Data Mahasiswa
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium mt-1">
            Total {total} mahasiswa terdaftar dalam basis data geospasial
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={apiService.getExportStudentsUrl('csv')}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-300 text-charcoal-700 hover:bg-cream-200 hover:text-orange-600 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </a>

          <a
            href={apiService.getExportStudentsUrl('xlsx')}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-300 text-charcoal-700 hover:bg-cream-200 hover:text-orange-600 transition-colors"
            title="Export Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor XLSX</span>
          </a>

          <button
            onClick={() => setIsResetModalOpen(true)}
            disabled={total === 0 || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40"
            title="Reset / Kosongkan Seluruh Data Mahasiswa"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Reset Semua Data</span>
          </button>

          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-orange-200" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-cream-50 p-4 rounded-3xl border border-cream-300 shadow-soft flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau NIM..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-cream-100 border border-cream-200 focus:border-orange-500 focus:bg-white text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs font-bold text-charcoal-500 whitespace-nowrap">Kategori:</span>
          <select
            value={residenceFilter}
            onChange={(e) => {
              setResidenceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-2xl bg-cream-100 border border-cream-200 focus:border-orange-500 text-xs font-medium text-charcoal-800 focus:outline-none"
          >
            <option value="All">Semua Kategori</option>
            <option value="Rumah">Rumah</option>
            <option value="Kost">Kost</option>
            <option value="Kontrakan">Kontrakan</option>
          </select>
        </div>

        {/* Publication Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs font-bold text-charcoal-500 whitespace-nowrap">Status:</span>
          <select
            value={publishedFilter}
            onChange={(e) => {
              setPublishedFilter(e.target.value as 'All' | 'true' | 'false');
              setPage(1);
            }}
            className="px-3 py-2 rounded-2xl bg-cream-100 border border-cream-200 focus:border-orange-500 text-xs font-medium text-charcoal-800 focus:outline-none"
          >
            <option value="All">Semua Status</option>
            <option value="true">Dipublikasikan</option>
            <option value="false">Draft / Nonaktif</option>
          </select>
        </div>

        <button
          onClick={fetchStudents}
          className="ml-auto p-2 rounded-xl text-charcoal-500 hover:text-orange-600 hover:bg-cream-200 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-cream-50 rounded-3xl border border-cream-300 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 border-b border-cream-300 text-charcoal-700 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">NIM</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Koordinat Asli</th>
                <th className="py-3.5 px-4">Koordinat Publik</th>
                <th className="py-3.5 px-4 text-center">Persetujuan</th>
                <th className="py-3.5 px-4 text-center">Publikasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data mahasiswa...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-400">
                    Tidak ada data mahasiswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-charcoal-900">
                      {student.nim}
                    </td>
                    <td className="py-3 px-4 font-bold text-charcoal-900">
                      {student.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadge(student.residence_type)}`}>
                        {student.residence_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-charcoal-600">
                      {student.latitude.toFixed(6)}, {student.longitude.toFixed(6)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 bg-emerald-50/50">
                      {student.public_latitude?.toFixed(6) ?? '-'}, {student.public_longitude?.toFixed(6) ?? '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {student.consent_publication ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ya</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>Tidak</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {student.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                          <Eye className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-charcoal-500 text-[11px] font-semibold">
                          <EyeOff className="w-3 h-3" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setStudentToEdit(student);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-gray-100 transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(student);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-charcoal-500">
          <div>
            Halaman <strong className="text-charcoal-900 font-bold">{page}</strong> dari {totalPages} ({total} Mahasiswa)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-xl border border-gray-200 text-charcoal-700 hover:bg-surface-100 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-xl border border-gray-200 text-charcoal-700 hover:bg-surface-100 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        studentToEdit={studentToEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        student={deleteTarget}
      />

      <ResetAllConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetAll}
        totalCount={total}
      />
    </div>
  );
};
