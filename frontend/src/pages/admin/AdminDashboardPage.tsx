import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Home,
  Building2,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  FileSpreadsheet,
  Download,
  Clock,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { AdminDashboardStatistics } from '../../types';
import { ResetAllConfirmModal } from '../../components/admin/ResetAllConfirmModal';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const fetchDashboardData = () => {
    setLoading(true);
    setError(null);
    apiService
      .getDashboardStatistics()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setError('Gagal memuat ringkasan data administrator');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-cream-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium mt-1">
            Pantau dan kelola sebaran residensial 137 mahasiswa Geomatika ITERA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-300 text-charcoal-700 hover:bg-cream-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>

          <button
            onClick={() => setIsResetModalOpen(true)}
            disabled={!stats?.total_students || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40"
            title="Reset / Kosongkan Seluruh Data Mahasiswa"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Reset Data</span>
          </button>

          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-orange-200" />
            <span>Kelola Mahasiswa</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DYNAMIC STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Total Mahasiswa
            </span>
            <div className="w-8 h-8 rounded-xl bg-cream-200 flex items-center justify-center text-charcoal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-charcoal-900">
            {loading ? '-' : stats?.total_students ?? 0}
          </div>
        </div>

        {/* Rumah */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-emerald-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Rumah
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
            {loading ? '-' : stats?.rumah_count ?? 0}
          </div>
        </div>

        {/* Kost */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-blue-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Kost
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
            {loading ? '-' : stats?.kost_count ?? 0}
          </div>
        </div>

        {/* Kontrakan */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-orange-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
              Kontrakan
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-orange-700">
            {loading ? '-' : stats?.kontrakan_count ?? 0}
          </div>
        </div>

        {/* Published */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600">
              Publikasi Aktif
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-charcoal-900">
            {loading ? '-' : stats?.published_count ?? 0}
          </div>
        </div>

        {/* Unpublished */}
        <div className="bg-cream-50 p-5 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600">
              Draft/Tertutup
            </span>
            <div className="w-8 h-8 rounded-xl bg-cream-200 flex items-center justify-center text-charcoal-600">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-charcoal-500">
            {loading ? '-' : stats?.unpublished_count ?? 0}
          </div>
        </div>
      </div>

      {/* SHORTCUT ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/students"
          className="bg-cream-50 p-6 rounded-3xl border border-cream-300 shadow-soft hover:shadow-card hover:border-orange-400 transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-charcoal-900 group-hover:text-orange-600 transition-colors">
              Kelola Data Mahasiswa
            </h3>
            <p className="text-xs text-charcoal-500">
              Tambah mahasiswa, ubah koordinat, perbarui persetujuan privasi, atau hapus data.
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-charcoal-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <Link
          to="/admin/import"
          className="bg-cream-50 p-6 rounded-3xl border border-cream-300 shadow-soft hover:shadow-card hover:border-orange-400 transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-charcoal-900 group-hover:text-orange-600 transition-colors">
              Import CSV / Excel (137 Mahasiswa)
            </h3>
            <p className="text-xs text-charcoal-500">
              Unggah file data angkatan dengan validasi otomatis koordinat dan deteksi NIM duplikat.
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-charcoal-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <div className="bg-cream-50 p-6 rounded-3xl border border-cream-300 shadow-soft flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cream-200 flex items-center justify-center text-charcoal-800">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-charcoal-900">
              Unduh Template Impor
            </h3>
            <p className="text-xs text-charcoal-500">
              Gunakan format tabel resmi yang telah dikonfigurasi untuk memudahkan impor data mahasiswa.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <a
              href={apiService.getTemplateUrl('csv')}
              download
              className="px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-semibold text-xs border border-cream-300 hover:border-orange-400 transition-colors"
            >
              Format .CSV
            </a>
            <a
              href={apiService.getTemplateUrl('xlsx')}
              download
              className="px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-semibold text-xs border border-cream-300 hover:border-orange-400 transition-colors"
            >
              Format .XLSX
            </a>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY AUDIT LOGS */}
      <div className="bg-cream-50 rounded-3xl border border-cream-300 shadow-soft p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Log Aktivitas & Audit Pembaruan Data
            </h3>
          </div>
          <span className="text-xs text-charcoal-400 font-medium">Histori Operasi Admin</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal-400">Memuat log aktivitas...</div>
          ) : stats?.recent_audit_logs && stats.recent_audit_logs.length > 0 ? (
            stats.recent_audit_logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-100 border border-cream-200 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-charcoal-900 block">{log.action}</span>
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    Admin ID: {log.admin_id}
                  </span>
                </div>
                <span className="text-[11px] text-charcoal-500 font-medium">
                  {new Date(log.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-charcoal-400">
              Belum ada aktivitas tercatat dalam sistem.
            </div>
          )}
        </div>
      </div>

      <ResetAllConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={async () => {
          await apiService.resetAllStudents();
          fetchDashboardData();
        }}
        totalCount={stats?.total_students ?? 0}
      />
    </div>
  );
};
