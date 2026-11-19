import React, { useState } from 'react';
import { X, Home, Building2, Key, Users, MapPin } from 'lucide-react';
import { StudentPublic, ResidenceType } from '../../types';

interface StudentInfoCardProps {
  students: StudentPublic[] | null;
  onClose: () => void;
  highlightedStudentId?: number | null;
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  students,
  onClose,
  highlightedStudentId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!students || students.length === 0) return null;

  const isMultiple = students.length > 1;
  const primaryCategory: ResidenceType = students[0].residence_type;

  const getCategoryTheme = (type: ResidenceType) => {
    switch (type) {
      case 'Rumah':
        return {
          pillBg: 'bg-[#34C759]',
          lightPill: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
          dot: 'bg-[#34C759]',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          expandBg: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50',
          icon: Home,
          label: 'Rumah Tinggal',
        };
      case 'Kost':
        return {
          pillBg: 'bg-[#007AFF]',
          lightPill: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
          dot: 'bg-[#007AFF]',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          expandBg: 'bg-blue-50/80 hover:bg-blue-100 text-blue-700 border-blue-200/50',
          icon: Building2,
          label: 'Kost Mahasiswa',
        };
      case 'Kontrakan':
        return {
          pillBg: 'bg-[#FF9500]',
          lightPill: 'bg-orange-500/10 text-orange-800 border-orange-500/20',
          dot: 'bg-[#FF9500]',
          badge: 'bg-orange-50 text-orange-800 border-orange-200',
          expandBg: 'bg-orange-50/80 hover:bg-orange-100 text-orange-700 border-orange-200/50',
          icon: Key,
          label: 'Kontrakan',
        };
      default:
        return {
          pillBg: 'bg-gray-500',
          lightPill: 'bg-black/5 text-slate-800 border-black/10',
          dot: 'bg-gray-500',
          badge: 'bg-gray-50 text-gray-800 border-gray-200',
          expandBg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: MapPin,
          label: type,
        };
    }
  };

  const theme = getCategoryTheme(primaryCategory);
  const IconComponent = isMultiple ? Users : theme.icon;

  // Show first 3 students if collapsed and > 3
  const displayedStudents = isMultiple && !isExpanded && students.length > 3
    ? students.slice(0, 3)
    : students;

  const remainingCount = students.length - 3;

  return (
    <div className="fixed bottom-0 sm:bottom-6 md:bottom-8 left-0 sm:left-6 right-0 sm:right-6 max-w-7xl md:mx-auto pointer-events-none z-30 flex sm:justify-end">
      <div className="pointer-events-auto w-full sm:w-[380px] md:w-[420px] max-w-full sm:max-w-[calc(100vw-32px)] max-h-[80vh] flex flex-col apple-glass-card rounded-t-[26px] sm:rounded-[28px] p-4 sm:p-5 shadow-2xl border-t sm:border border-white/95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        {/* Mobile iOS Drag Handle Indicator */}
        <div className="w-10 h-1 bg-black/20 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${theme.lightPill}`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${theme.dot}`} />
              {theme.label}
            </span>

            {isMultiple && (
              <span className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-sm ${theme.pillBg}`}>
                {students.length} Penghuni
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-2.5 sm:mb-3 shrink-0">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#1D1D1F] tracking-tight">
            {isMultiple ? `Hunian Bersama ${primaryCategory}` : students[0].name}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#8E8E93] mt-0.5">
            {isMultiple
              ? `Hunian Bersama · ${students.length} Mahasiswa Geomatika`
              : 'Mahasiswa Geomatika ITERA 2025'}
          </p>
        </div>

        {/* Content */}
        {!isMultiple ? (
          // Single Student View
          <div className="space-y-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${theme.lightPill}`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">
                    {students[0].name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#8E8E93]">
                    Teknik Geomatika ITERA 2025
                  </p>
                </div>
              </div>
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badge}`}>
                {students[0].residence_type}
              </span>
            </div>
          </div>
        ) : (
          // Multiple Students at Same Location — Apple Glass Grouped List
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 select-text scrollbar-none max-h-[44vh] sm:max-h-[48vh]">
              {displayedStudents.map((st, index) => {
                const isHighlight = highlightedStudentId === st.id;
                return (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between p-2 sm:p-2.5 md:p-3 rounded-2xl border transition-all ${
                      isHighlight
                        ? 'bg-orange-500/15 border-orange-500/40 ring-1 ring-orange-500/30'
                        : 'bg-white/75 hover:bg-white/95 border-white/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 ${theme.pillBg}`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate">
                          {st.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#8E8E93]">
                          Teknik Geomatika ITERA 2025
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${theme.badge}`}
                    >
                      {st.residence_type}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Expand / Collapse Button */}
            {students.length > 3 && (
              <div className="pt-2 shrink-0">
                {!isExpanded ? (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className={`w-full py-2 sm:py-2.5 rounded-2xl font-semibold text-xs text-center border transition-all active:scale-[0.99] shadow-sm ${theme.expandBg}`}
                  >
                    + {remainingCount} mahasiswa lainnya di tempat ini
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full py-1.5 sm:py-2 rounded-2xl bg-black/[0.04] hover:bg-black/[0.07] text-[#8E8E93] hover:text-[#1D1D1F] font-medium text-xs text-center transition-all"
                  >
                    Tampilkan lebih sedikit
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
