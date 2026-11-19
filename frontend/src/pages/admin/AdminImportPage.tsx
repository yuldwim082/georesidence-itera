import React, { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { ImportPreviewResponse, ImportConfirmResponse } from '../../types';

export const AdminImportPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview & validation state
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [errorPreview, setErrorPreview] = useState<string | null>(null);

  // Import commit state
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportConfirmResponse | null>(null);

  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setErrorPreview('Format file tidak didukung. Harap pilih file .csv atau .xlsx');
      return;
    }
    setSelectedFile(file);
    setErrorPreview(null);
    setPreviewData(null);
    setImportResult(null);

    // Auto-generate preview
    generatePreview(file);
  };

  const generatePreview = async (file: File) => {
    setLoadingPreview(true);
    setErrorPreview(null);
    try {
      const data = await apiService.previewImport(file);
      setPreviewData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorPreview(err.message);
      } else {
        setErrorPreview('Gagal memproses dan memvalidasi file');
      }
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || previewData.preview.length === 0) return;

    setImporting(true);
    try {
      const rowsToImport = previewData.preview
        .filter((r) => r.is_valid || (r.is_duplicate && skipDuplicates))
        .map((r) => ({
          row_number: r.row_number,
          nim: r.nim,
          name: r.name,
          residence_type: r.residence_type,
          latitude: r.latitude,
          longitude: r.longitude,
        }));

      const res = await apiService.confirmImport(rowsToImport, skipDuplicates);
      setImportResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorPreview(`Gagal menyimpan data: ${err.message}`);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setErrorPreview(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-cream-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Import Data Mahasiswa (CSV & Excel)
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium mt-1">
            Unggah berkas data sebaran residensial mahasiswa (kapasitas 137+ mahasiswa)
          </p>
        </div>

        {/* Download Template Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={apiService.getTemplateUrl('csv')}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-300 text-charcoal-700 hover:bg-cream-200 hover:text-orange-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span>Template .CSV</span>
          </a>
          <a
            href={apiService.getTemplateUrl('xlsx')}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-300 text-charcoal-700 hover:bg-cream-200 hover:text-orange-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span>Template .XLSX</span>
          </a>
        </div>
      </div>

      {/* SUCCESS RESULT MODAL / BANNER */}
      {importResult && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 sm:p-8 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-950">
                Proses Impor Berhasil Diselesaikan!
              </h3>
              <p className="text-xs text-orange-800">
                Transaksi basis data berhasil dikomit secara aman.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-cream-50 p-4 rounded-2xl border border-orange-200">
              <span className="text-[11px] font-bold uppercase text-orange-800 block">Berhasil Diimpor</span>
              <span className="text-2xl font-extrabold text-orange-900">{importResult.imported_count}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-300">
              <span className="text-[11px] font-bold uppercase text-charcoal-600 block">Dilewati (Duplikat)</span>
              <span className="text-2xl font-extrabold text-charcoal-800">{importResult.skipped_count}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-300">
              <span className="text-[11px] font-bold uppercase text-red-700 block">Gagal / Ditolak</span>
              <span className="text-2xl font-extrabold text-red-900">{importResult.failed_count}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm"
            >
              Impor File Baru
            </button>
            <a
              href="/admin/students"
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-orange-900 bg-orange-100 hover:bg-orange-200 transition-colors"
            >
              Lihat Daftar Mahasiswa →
            </a>
          </div>
        </div>
      )}

      {/* STEP 1: FILE UPLOAD DRAG & DROP ZONE */}
      {!importResult && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-50'
                : 'border-cream-300 hover:border-orange-500 bg-cream-50 hover:bg-cream-100'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cream-200 mx-auto flex items-center justify-center text-charcoal-800 shadow-soft">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900">
                  {selectedFile ? selectedFile.name : 'Tarik & Letakkan Berkas atau Klik untuk Memilih'}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1">
                  Mendukung format file <strong className="text-charcoal-800">.CSV</strong> dan{' '}
                  <strong className="text-charcoal-800">.XLSX</strong>. Kolom otomatis terdeteksi: NIM, Nama, Kategori, Latitude, Longitude.
                </p>
              </div>

              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold border border-orange-200">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </div>

          {errorPreview && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorPreview}</span>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION SUMMARY */}
          {loadingPreview && (
            <div className="bg-cream-50 rounded-3xl p-12 text-center border border-cream-300 shadow-soft">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-charcoal-700">Menganalisis dan memvalidasi baris data...</p>
            </div>
          )}

          {previewData && !loadingPreview && (
            <div className="space-y-6 animate-in fade-in">
              {/* Validation Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-cream-50 p-4 rounded-2xl border border-cream-300 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">Total Baris</span>
                  <span className="text-2xl font-extrabold text-charcoal-900">{previewData.total_rows}</span>
                </div>
                <div className="bg-cream-50 p-4 rounded-2xl border border-emerald-200 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Baris Valid</span>
                  <span className="text-2xl font-extrabold text-emerald-700">{previewData.valid_rows}</span>
                </div>
                <div className="bg-cream-50 p-4 rounded-2xl border border-orange-200 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block">NIM Duplikat</span>
                  <span className="text-2xl font-extrabold text-orange-700">{previewData.duplicate_rows}</span>
                </div>
                <div className="bg-cream-50 p-4 rounded-2xl border border-red-200 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">Baris Error</span>
                  <span className="text-2xl font-extrabold text-red-700">{previewData.invalid_rows}</span>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              <div className="bg-cream-50 p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 mt-0.5 sm:mt-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Lewati Rekaman dengan NIM Duplikat (Skip duplicates)
                    </span>
                    <span className="text-[11px] text-charcoal-500 block">
                      Jika dicentang, baris dengan NIM yang sudah ada dalam basis data tidak akan ditimpa ataupun menggagalkan transaksi.
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal-600 hover:bg-cream-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing || (previewData.valid_rows === 0 && !skipDuplicates)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm disabled:opacity-50"
                  >
                    {importing ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Konfirmasi & Simpan Impor</span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-200" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-cream-50 rounded-3xl border border-cream-300 shadow-soft overflow-hidden">
                <div className="p-4 border-b border-cream-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                    Pratinjau Validasi Baris Data
                  </h3>
                  <span className="text-xs text-charcoal-500">
                    Menampilkan seluruh baris dari file yang diunggah
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-cream-100 border-b border-cream-300">
                      <tr className="text-charcoal-700 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">NIM</th>
                        <th className="py-2.5 px-3">Nama</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Latitude</th>
                        <th className="py-2.5 px-3">Longitude</th>
                        <th className="py-2.5 px-3">Catatan / Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {previewData.preview.map((row) => (
                        <tr
                          key={row.row_number}
                          className={`transition-colors ${
                            !row.is_valid
                              ? 'bg-red-50/50'
                              : row.is_duplicate
                              ? 'bg-orange-50/40'
                              : 'hover:bg-cream-100'
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-[11px] text-charcoal-500">
                            {row.row_number}
                          </td>
                          <td className="py-2 px-3">
                            {row.is_valid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <span>Error</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-charcoal-900">
                            {row.nim || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-charcoal-900">
                            {row.name || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-charcoal-800">
                              {row.residence_type || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-charcoal-600">
                            {row.latitude !== null ? row.latitude.toFixed(6) : '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-charcoal-600">
                            {row.longitude !== null ? row.longitude.toFixed(6) : '-'}
                          </td>
                          <td className="py-2 px-3">
                            {row.errors.length > 0 ? (
                              <div className="space-y-0.5">
                                {row.errors.map((err, i) => (
                                  <span
                                    key={i}
                                    className="block text-[11px] text-red-600 font-medium"
                                  >
                                    • {err}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-medium">Siap diimpor</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
