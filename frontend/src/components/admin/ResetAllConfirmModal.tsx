import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ResetAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  totalCount: number;
}

export const ResetAllConfirmModal: React.FC<ResetAllConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalCount,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-float border border-cream-300 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-red-600">
            Reset / Hapus Semua Data?
          </h3>
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="font-bold text-charcoal-900">SELURUH DATA MAHASISWA ({totalCount} data)</strong> dari basis data?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-800 leading-relaxed font-medium">
            ⚠️ <strong>Peringatan Penting:</strong> Tindakan ini akan mengosongkan seluruh data mahasiswa secara permanen untuk persiapan impor data baru. Tindakan ini tidak dapat dibatalkan!
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-cream-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 hover:bg-cream-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
