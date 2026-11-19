import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

interface MapFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  totalFiltered: number;
  totalAll: number;
  onReset: () => void;
}

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalFiltered,
  totalAll,
  onReset,
}) => {
  const filterButtons = [
    { id: 'All', label: 'Semua', dotColor: null },
    { id: 'Rumah', label: 'Rumah', dotColor: 'bg-[#34C759]' },
    { id: 'Kost', label: 'Kost', dotColor: 'bg-[#007AFF]' },
    { id: 'Kontrakan', label: 'Kontrakan', dotColor: 'bg-[#FF9500]' },
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';

  return (
    <div className="apple-glass rounded-2xl md:rounded-full px-3 py-2 md:px-4 md:py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 transition-all w-full shadow-lg">
      {/* Apple iOS Search Field */}
      <div className="relative w-full md:w-48 lg:w-64 xl:w-72 shrink-0 flex items-center">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8E8E93] absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama mahasiswa..."
          className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 rounded-full text-xs sm:text-sm bg-black/[0.04] border border-black/[0.04] focus:border-white focus:bg-white text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-0.5 rounded-full text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-black/5"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="hidden md:block h-5 w-px bg-black/[0.08] shrink-0" />

      {/* Apple iOS Segmented Control Category Filter */}
      <div className="flex items-center justify-between w-full md:w-auto gap-2 overflow-hidden">
        <div className="apple-segmented-track flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-nowrap shrink-0">
          {filterButtons.map((btn) => {
            const isActive = selectedCategory === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onCategoryChange(btn.id)}
                className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'apple-segmented-active'
                    : 'apple-segmented-inactive font-medium'
                }`}
              >
                {btn.dotColor && (
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${btn.dotColor} shrink-0 ring-1 ring-white/50`} />
                )}
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Counter Badge & Reset Button for Mobile (< 768px) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0 ml-auto">
          <span className="text-[#8E8E93] font-medium px-2 py-0.5 bg-white/70 rounded-full text-[11px] whitespace-nowrap shadow-sm border border-black/[0.04]">
            <strong className="text-[#1D1D1F] font-bold">{totalFiltered}</strong>/{totalAll}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-0.5 px-2 py-0.5 text-[11px] text-[#007AFF] hover:text-[#0051A8] font-semibold rounded-full transition-colors"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Counter & Reset for Tablet & Desktop (md: >= 768px) */}
      <div className="hidden md:flex items-center md:ml-auto gap-2 text-xs shrink-0">
        <span className="text-[#8E8E93] font-medium px-3 py-1 bg-black/[0.04] rounded-full border border-black/[0.04] text-xs whitespace-nowrap shrink-0">
          {/* Full text on lg screens, compact on md screens */}
          <span className="hidden lg:inline">
            <strong className="text-[#1D1D1F] font-bold">{totalFiltered}</strong> dari {totalAll} mahasiswa
          </span>
          <span className="inline lg:hidden">
            <strong className="text-[#1D1D1F] font-bold">{totalFiltered}</strong>/{totalAll} mhs
          </span>
        </span>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#007AFF] hover:text-[#0051A8] font-semibold rounded-full hover:bg-blue-50/50 transition-colors shrink-0"
            title="Reset semua filter"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
