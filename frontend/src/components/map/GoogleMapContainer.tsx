import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { StudentPublic, ResidenceType } from '../../types';
import { ZoomIn, ZoomOut, Compass, Info } from 'lucide-react';

interface GoogleMapContainerProps {
  students: StudentPublic[];
  selectedStudent: StudentPublic | null;
  onSelectStudent: (student: StudentPublic | null) => void;
}

// Category Marker Colors
const CATEGORY_COLORS: Record<ResidenceType, { fill: string; stroke: string; label: string }> = {
  Rumah: { fill: '#10B981', stroke: '#065F46', label: 'Rumah' },
  Kost: { fill: '#3B82F6', stroke: '#1E40AF', label: 'Kost' },
  Kontrakan: { fill: '#F97316', stroke: '#9A3412', label: 'Kontrakan' },
};

// ITERA Default Center
const ITERA_CENTER = { lat: -5.358241, lng: 105.312984 };

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [clustererInstance, setClustererInstance] = useState<MarkerClusterer | null>(null);
  const [markersList, setMarkersList] = useState<google.maps.Marker[]>([]);
  const [, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingGoogleMaps, setIsUsingGoogleMaps] = useState<boolean>(false);

  // SVG Fallback Interactive Map State (used when API key is missing or testing offline)
  const [svgZoom, setSvgZoom] = useState<number>(1);
  const [svgPan, setSvgPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Initialize Google Maps API
  useEffect(() => {
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
      setIsLoading(false);
      setIsUsingGoogleMaps(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .importLibrary('maps')
      .then(() => {
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: ITERA_CENTER,
          zoom: 14,
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ lightness: 100 }, { visibility: 'simplified' }],
            },
          ],
        });

        setMapInstance(map);
        setIsUsingGoogleMaps(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Google Maps load error:', err);
        setLoadError(err.message || 'Gagal memuat Google Maps API');
        setIsUsingGoogleMaps(false);
        setIsLoading(false);
      });
  }, [apiKey]);

  // Update Markers & Clusters in Google Maps
  useEffect(() => {
    if (!isUsingGoogleMaps || !mapInstance) return;

    // Clear existing markers
    if (clustererInstance) {
      clustererInstance.clearMarkers();
    }
    markersList.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    students.forEach((student) => {
      const position = {
        lat: student.public_latitude,
        lng: student.public_longitude,
      };

      bounds.extend(position);

      const theme = CATEGORY_COLORS[student.residence_type] || CATEGORY_COLORS.Rumah;

      // Custom SVG Pin Icon
      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
          <defs>
            <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26s16-15.5 16-26c0-8.837-7.163-16-16-16z" 
                fill="${theme.fill}" filter="url(#shadow)" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
        </svg>
      `;

      const marker = new google.maps.Marker({
        position,
        title: student.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new google.maps.Size(32, 42),
          anchor: new google.maps.Point(16, 42),
        },
      });

      marker.addListener('click', () => {
        onSelectStudent(student);
        mapInstance.panTo(position);
      });

      newMarkers.push(marker);
    });

    setMarkersList(newMarkers);

    // Initialize or update MarkerClusterer
    const clusterer = new MarkerClusterer({
      map: mapInstance,
      markers: newMarkers,
    });
    setClustererInstance(clusterer);

    // Fit bounds if we have points
    if (students.length > 0) {
      if (students.length === 1) {
        mapInstance.setCenter({
          lat: students[0].public_latitude,
          lng: students[0].public_longitude,
        });
        mapInstance.setZoom(16);
      } else {
        mapInstance.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      }
    } else {
      mapInstance.setCenter(ITERA_CENTER);
      mapInstance.setZoom(14);
    }

    return () => {
      newMarkers.forEach((m) => m.setMap(null));
      clusterer.clearMarkers();
    };
  }, [isUsingGoogleMaps, mapInstance, students]);

  // Center on selected student
  useEffect(() => {
    if (isUsingGoogleMaps && mapInstance && selectedStudent) {
      mapInstance.panTo({
        lat: selectedStudent.public_latitude,
        lng: selectedStudent.public_longitude,
      });
      if (mapInstance.getZoom()! < 15) {
        mapInstance.setZoom(15);
      }
    }
  }, [selectedStudent, mapInstance, isUsingGoogleMaps]);

  // --- SVG INTERACTIVE FALLBACK MAP HANDLERS ---
  // Calculates relative coordinate mapping for SVG canvas based on coordinates around ITERA
  const svgBounds = useMemo(() => {
    if (students.length === 0) {
      return { minLat: -5.39, maxLat: -5.33, minLng: 105.27, maxLng: 105.34 };
    }
    const lats = students.map((s) => s.public_latitude);
    const lngs = students.map((s) => s.public_longitude);
    const minLat = Math.min(...lats, ITERA_CENTER.lat - 0.02);
    const maxLat = Math.max(...lats, ITERA_CENTER.lat + 0.02);
    const minLng = Math.min(...lngs, ITERA_CENTER.lng - 0.02);
    const maxLng = Math.max(...lngs, ITERA_CENTER.lng + 0.02);
    return { minLat, maxLat, minLng, maxLng };
  }, [students]);

  const projectToSvg = (lat: number, lng: number, width: number, height: number) => {
    const latSpan = svgBounds.maxLat - svgBounds.minLat || 0.05;
    const lngSpan = svgBounds.maxLng - svgBounds.minLng || 0.05;
    const x = ((lng - svgBounds.minLng) / lngSpan) * (width - 100) + 50;
    const y = ((svgBounds.maxLat - lat) / latSpan) * (height - 100) + 50;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - svgPan.x, y: e.clientY - svgPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setSvgPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-surface-100 overflow-hidden select-none">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-charcoal-700">Menyiapkan peta interaktif...</p>
        </div>
      )}

      {/* Google Maps Container */}
      <div
        ref={mapRef}
        className={`w-full h-full transition-opacity duration-300 ${
          isUsingGoogleMaps ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'
        }`}
      />

      {/* Fallback Interactive Vector Web GIS Canvas when Google Maps Key is not provided */}
      {!isUsingGoogleMaps && !isLoading && (
        <div
          className="relative w-full h-full bg-[#f8fafc] cursor-grab active:cursor-grabbing flex flex-col justify-between"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Top Info Banner for Google Maps API Key */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-card border border-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-charcoal-700">
              <span className="font-bold text-charcoal-900 block">Mode Pratinjau Web GIS Aktif</span>
              Peta interaktif berjalan dalam mode simulasi vektor spasial. Tambahkan{' '}
              <code className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono text-[11px] border border-amber-200">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              di file <span className="font-semibold">.env</span> untuk memuat Google Maps JavaScript API asli.
            </div>
          </div>

          {/* SVG Vector Canvas */}
          <svg
            className="w-full h-full min-h-[550px]"
            viewBox="0 0 1000 700"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
              </pattern>
            </defs>

            <g transform={`translate(${svgPan.x}, ${svgPan.y}) scale(${svgZoom})`}>
              <rect width="1000" height="700" fill="url(#grid)" />

              {/* ITERA Campus Area Outline Representation */}
              <g opacity="0.6">
                <rect x="420" y="260" width="160" height="180" rx="16" fill="#D1FAE5" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                <text x="500" y="355" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="700">
                  Kampus ITERA
                </text>
                <text x="500" y="372" textAnchor="middle" fill="#065F46" fontSize="10">
                  Teknik Geomatika
                </text>
              </g>

              {/* Major Roads representation */}
              <path d="M 100 350 L 900 350" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
              <text x="220" y="342" fill="#64748B" fontSize="10" fontWeight="600">Jl. Terusan Ryacudu</text>
              <path d="M 500 50 L 500 650" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />

              {/* Student Residential Markers */}
              {students.map((student) => {
                const { x, y } = projectToSvg(student.public_latitude, student.public_longitude, 1000, 700);
                const theme = CATEGORY_COLORS[student.residence_type] || CATEGORY_COLORS.Rumah;
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <g
                    key={student.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStudent(student);
                    }}
                  >
                    {/* Ripple on selected */}
                    {isSelected && (
                      <circle cx="0" cy="-16" r="24" fill={theme.fill} opacity="0.2" className="animate-ping" />
                    )}

                    {/* Pin Shadow */}
                    <ellipse cx="0" cy="0" rx="7" ry="3" fill="#000000" opacity="0.25" />

                    {/* Pin Body */}
                    <path
                      d="M 0 -30 C -8 -30 -14 -24 -14 -16 C -14 -6 0 0 0 0 C 0 0 14 -6 14 -16 C 14 -24 8 -30 0 -30 Z"
                      fill={theme.fill}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="-16" r="4.5" fill="#FFFFFF" />

                    {/* Label */}
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize="9"
                      fontWeight="600"
                      className="pointer-events-none drop-shadow"
                    >
                      {student.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* SVG Canvas Controls (Zoom In, Zoom Out, Reset Pan) */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-white rounded-2xl shadow-card border border-gray-200/80 p-1.5">
            <button
              onClick={() => setSvgZoom((prev) => Math.min(prev + 0.25, 3))}
              className="p-2 rounded-xl hover:bg-surface-100 text-charcoal-700 transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSvgZoom((prev) => Math.max(prev - 0.25, 0.5))}
              className="p-2 rounded-xl hover:bg-surface-100 text-charcoal-700 transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSvgZoom(1);
                setSvgPan({ x: 0, y: 0 });
              }}
              className="p-2 rounded-xl hover:bg-surface-100 text-charcoal-700 transition-colors"
              title="Reset Tampilan"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
