import React, { useEffect, useState, useMemo } from 'react';
import { LeafletMapContainer, LocationGroup } from '../components/map/LeafletMapContainer';
import { MapFilterBar } from '../components/map/MapFilterBar';
import { MapLegend } from '../components/map/MapLegend';
import { StudentInfoCard } from '../components/map/StudentInfoCard';
import { apiService } from '../services/api';
import { StudentPublic, ResidenceType } from '../types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [allStudents, setAllStudents] = useState<StudentPublic[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);

  // Fetch public students (with exact real coordinates)
  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    apiService
      .getPublicStudents()
      .then((data) => {
        setAllStudents(data);
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
        setError('Gagal memuat data sebaran mahasiswa. Pastikan server backend berjalan.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Compute category counts from total available
  const categoryCounts = useMemo(() => {
    const counts = {
      Rumah: 0,
      Kost: 0,
      Kontrakan: 0,
      Total: allStudents.length,
    };
    allStudents.forEach((s) => {
      if (s.residence_type in counts) {
        counts[s.residence_type as ResidenceType]++;
      }
    });
    return counts;
  }, [allStudents]);

  // Client-side filtering for ultra-fast, responsive UI
  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      // Category filter
      if (selectedCategory !== 'All' && student.residence_type !== selectedCategory) {
        return false;
      }
      // Name search
      if (searchQuery.trim() !== '') {
        const queryLower = searchQuery.toLowerCase().trim();
        return student.name.toLowerCase().includes(queryLower);
      }
      return true;
    });
  }, [allStudents, selectedCategory, searchQuery]);

  // Find all students at the selected location
  const selectedLocationStudents = useMemo(() => {
    if (!selectedLocationKey) return null;
    const matched = allStudents.filter(
      (s) => `${s.public_latitude.toFixed(6)},${s.public_longitude.toFixed(6)}` === selectedLocationKey
    );
    return matched.length > 0 ? matched : null;
  }, [selectedLocationKey, allStudents]);

  // Highlight specific student if search query uniquely matches
  const highlightedStudentId = useMemo(() => {
    if (searchQuery.trim() !== '' && filteredStudents.length === 1) {
      return filteredStudents[0].id;
    }
    return null;
  }, [searchQuery, filteredStudents]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocationKey(null);
  };

  const handleSelectLocation = (group: LocationGroup | null) => {
    setSelectedLocationKey(group ? group.key : null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Top Floating Filter Bar — Inset below floating island Navbar */}
      <div className="fixed top-[76px] md:top-[96px] left-3 sm:left-6 right-3 sm:right-6 z-30 max-w-7xl md:mx-auto">
        <MapFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setSelectedLocationKey(null);
          }}
          totalFiltered={filteredStudents.length}
          totalAll={allStudents.length}
          onReset={handleResetFilters}
        />
      </div>

      {/* Floating Legend */}
      <MapLegend
        counts={categoryCounts}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedLocationKey(null);
        }}
      />

      {/* Error notification banner if any */}
      {error && (
        <div className="fixed top-24 left-4 right-4 z-40 max-w-md mx-auto apple-glass-card border border-red-500/20 text-red-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStudents}
            className="flex items-center gap-1 font-semibold text-red-700 hover:text-red-900 underline"
          >
            <RefreshCw className="w-3 h-3" /> Coba Lagi
          </button>
        </div>
      )}

      {/* Main Map Canvas (Absolute Inset-0, full bleed) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LeafletMapContainer
          students={filteredStudents}
          selectedLocationKey={selectedLocationKey}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Selected Location / Residence Information Card */}
      <StudentInfoCard
        students={selectedLocationStudents}
        onClose={() => setSelectedLocationKey(null)}
        highlightedStudentId={highlightedStudentId}
      />
    </div>
  );
};
