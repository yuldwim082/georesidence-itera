import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { StudentAdmin } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  student: StudentAdmin | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !student) return null;

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
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-float border border-gray-200/80 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-charcoal-900">
            Hapus Data Mahasiswa?
          </h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus data mahasiswa{' '}
            <strong className="text-charcoal-900 font-bold">{student.name}</strong> (NIM:{' '}
            <span className="font-mono">{student.nim}</span>)? Tindakan ini akan menghapus data koordinat dari sistem secara permanen.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 hover:bg-surface-100 transition-colors"
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
                <span>Hapus Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
