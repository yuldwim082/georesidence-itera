import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { ResidenceType } from '../../types';

interface MapLegendProps {
  counts: {
    Rumah: number;
    Kost: number;
    Kontrakan: number;
    Total: number;
  };
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  counts,
  selectedCategory,
  onSelectCategory,
}) => {
  // Start collapsed by default on screens < 768px (mobile & tablet portrait)
  const [collapsed, setCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const categories: { type: ResidenceType; label: string; dotColor: string }[] = [
    { type: 'Rumah', label: 'Rumah', dotColor: 'bg-[#34C759]' },
    { type: 'Kost', label: 'Kost', dotColor: 'bg-[#007AFF]' },
    { type: 'Kontrakan', label: 'Kontrakan', dotColor: 'bg-[#FF9500]' },
  ];

  return (
    <div className="fixed top-[184px] md:top-[168px] left-3 sm:left-6 right-3 sm:right-6 max-w-7xl md:mx-auto pointer-events-none z-20 flex justify-end">
      <div className="pointer-events-auto transition-all">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full apple-glass-pill text-[11px] sm:text-xs font-semibold text-[#1D1D1F] hover:bg-white transition-all active:scale-95 shadow-md"
            title="Buka Legenda Kategori"
            aria-label="Buka Legenda Kategori"
          >
            <Layers className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span>Legenda</span>
            <ChevronDown className="w-3 h-3 text-[#8E8E93]" />
          </button>
        ) : (
          <div className="apple-glass-card rounded-[22px] sm:rounded-[24px] p-3 sm:p-3.5 transition-all text-[#1D1D1F] w-48 sm:w-56 shadow-xl border border-white/90 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1D1D1F]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                  Kategori Hunian
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="text-[#8E8E93] hover:text-[#1D1D1F] p-0.5 rounded-full hover:bg-black/5"
                aria-label="Tutup Legenda"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.type;
                const count = counts[cat.type] || 0;
                return (
                  <button
                    key={cat.type}
                    onClick={() => onSelectCategory(isSelected ? 'All' : cat.type)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-black/10 text-[#1D1D1F] font-semibold shadow-inner'
                        : 'text-slate-700 hover:bg-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cat.dotColor} shrink-0 ring-1 ring-white/80 shadow-sm`} />
                      <span>{cat.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-black/[0.05] text-[#1D1D1F]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-1.5 border-t border-black/[0.06] flex items-center justify-between text-[9px] sm:text-[10px] text-[#8E8E93]">
              <span>Presisi Hunian Kolektif</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
