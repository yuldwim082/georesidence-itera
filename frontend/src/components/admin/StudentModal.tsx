import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { StudentAdmin, ResidenceType } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nim: string;
    name: string;
    residence_type: ResidenceType;
    latitude: number;
    longitude: number;
    consent_publication: boolean;
    is_published: boolean;
  }) => Promise<void>;
  studentToEdit?: StudentAdmin | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit,
}) => {
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [residenceType, setResidenceType] = useState<ResidenceType>('Kost');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [consentPublication, setConsentPublication] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setNim(studentToEdit.nim);
      setName(studentToEdit.name);
      setResidenceType(studentToEdit.residence_type);
      setLatitude(String(studentToEdit.latitude));
      setLongitude(String(studentToEdit.longitude));
      setConsentPublication(studentToEdit.consent_publication);
      setIsPublished(studentToEdit.is_published);
    } else {
      setNim('');
      setName('');
      setResidenceType('Kost');
      setLatitude('-5.358241');
      setLongitude('105.312984');
      setConsentPublication(true);
      setIsPublished(true);
    }
    setError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Latitude harus berupa angka antara -90 dan 90');
      return;
    }

    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setError('Longitude harus berupa angka antara -180 dan 180');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        nim: nim.trim(),
        name: name.trim(),
        residence_type: residenceType,
        latitude: latNum,
        longitude: lonNum,
        consent_publication: consentPublication,
        is_published: isPublished,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan data mahasiswa');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-float border border-cream-300 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200 mb-6">
          <div>
            <h3 className="text-xl font-bold text-charcoal-900">
              {studentToEdit ? 'Ubah Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
            </h3>
            <p className="text-xs text-charcoal-500">
              Informasi residensial & koordinat geospasial
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-orange-600 hover:bg-cream-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                NIM
              </label>
              <input
                type="text"
                required
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 121110001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Kategori Hunian
              </label>
              <select
                value={residenceType}
                onChange={(e) => setResidenceType(e.target.value as ResidenceType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 focus:outline-none transition-all"
              >
                <option value="Rumah">Rumah (Tinggal Bersama Keluarga)</option>
                <option value="Kost">Kost (Sewa Kamar Individu)</option>
                <option value="Kontrakan">Kontrakan (Sewa Rumah Bersama)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Nama Lengkap Mahasiswa
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Farhan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Latitude (Garis Lintang)
              </label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-5.358241"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 font-mono focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Longitude (Garis Bujur)
              </label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="105.312984"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 font-mono focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-3 bg-cream-100 rounded-2xl text-[11px] text-charcoal-600 leading-relaxed border border-cream-300">
            ℹ️ Sistem akan menggeneralisasi koordinat publik (~120–280 meter) secara otomatis untuk melindungi privasi lokasi asli mahasiswa di peta publik.
          </div>

          {/* Privacy & Publication Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPublication}
                onChange={(e) => setConsentPublication(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <span className="text-xs font-semibold text-charcoal-800">
                Persetujuan Publikasi Data (Consent Granted)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <span className="text-xs font-semibold text-charcoal-800">
                Publikasikan ke Peta Interaktif (Status: Aktif)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 hover:bg-cream-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{studentToEdit ? 'Simpan Perubahan' : 'Tambahkan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
