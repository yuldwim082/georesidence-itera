import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { StudentPublic, ResidenceType } from '../../types';
import { Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export interface LocationGroup {
  key: string;
  lat: number;
  lng: number;
  residence_type: ResidenceType;
  students: StudentPublic[];
}

interface LeafletMapContainerProps {
  students: StudentPublic[];
  selectedLocationKey: string | null;
  onSelectLocation: (group: LocationGroup | null) => void;
}

// Center on Geomatics Engineering ITERA region
const DEFAULT_CENTER: L.LatLngExpression = [-5.358241, 105.312984];

// Apple iOS Colors & SVG templates for categories
const CATEGORY_STYLES: Record<ResidenceType, { fill: string; stroke: string; label: string }> = {
  Rumah: { fill: '#34C759', stroke: '#248A3D', label: 'Rumah' },
  Kost: { fill: '#007AFF', stroke: '#0051A8', label: 'Kost' },
  Kontrakan: { fill: '#FF9500', stroke: '#C97500', label: 'Kontrakan' },
};

function createPinIcon(type: ResidenceType, isSelected: boolean = false, count: number = 1) {
  const style = CATEGORY_STYLES[type] || CATEGORY_STYLES.Rumah;
  const pinWidth = isSelected ? 40 : count > 1 ? 36 : 32;
  const pinHeight = isSelected ? 50 : count > 1 ? 46 : 42;

  const svgHtml = `
    <div style="position: relative; width: ${pinWidth}px; height: ${pinHeight}px; pointer-events: auto;">
      ${
        isSelected
          ? `<div style="position: absolute; top: -1px; left: ${(pinWidth - 30) / 2}px; width: 30px; height: 30px; border-radius: 9999px; background: ${style.fill}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="${pinWidth}" height="${pinHeight}" style="overflow: visible; display: block;">
        <defs>
          <filter id="shadow-${type}-${isSelected}-${count > 1 ? 'm' : 's'}" x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M 18 42 C 18 42, 5 26, 5 15 A 13 13 0 1 1 31 15 C 31 26, 18 42, 18 42 Z" 
              fill="${style.fill}" 
              stroke="#FFFFFF" 
              stroke-width="${isSelected ? '2.5' : '2'}" 
              stroke-linejoin="round"
              filter="url(#shadow-${type}-${isSelected}-${count > 1 ? 'm' : 's'})"/>
        ${
          count > 1
            ? `<circle cx="18" cy="15" r="8" fill="rgba(0, 0, 0, 0.25)"/>
               <text x="18" y="18.5" text-anchor="middle" fill="#FFFFFF" font-size="10" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${count}</text>`
            : `<circle cx="18" cy="15" r="4.5" fill="#FFFFFF"/>`
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-pin-marker',
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
  });
}

// 100% Free Tile Layers: OpenStreetMap and Citra Satelit (NO API KEY REQUIRED)
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Citra Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    maxZoom: 19,
  },
};

type TileLayerKey = keyof typeof TILE_LAYERS;

export const LeafletMapContainer: React.FC<LeafletMapContainerProps> = ({
  students,
  selectedLocationKey,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<TileLayerKey>('osm');
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);

  // Group students by exact spatial coordinate key
  const locationGroups = useMemo<LocationGroup[]>(() => {
    const groupMap = new Map<string, LocationGroup>();

    students.forEach((student) => {
      const lat = student.public_latitude;
      const lng = student.public_longitude;
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;

      if (groupMap.has(key)) {
        groupMap.get(key)!.students.push(student);
      } else {
        groupMap.set(key, {
          key,
          lat,
          lng,
          residence_type: student.residence_type,
          students: [student],
        });
      }
    });

    return Array.from(groupMap.values());
  }, [students]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    const tile = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxZoom: TILE_LAYERS[activeLayer].maxZoom,
    }).addTo(map);

    tileLayerRef.current = tile;

    L.control
      .attribution({
        position: 'bottomright',
        prefix: false,
      })
      .addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 36,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 17,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizeClass = 'w-9 h-9 text-xs';
        if (count >= 50) sizeClass = 'w-12 h-12 text-sm';
        else if (count >= 10) sizeClass = 'w-10 h-10 text-xs';

        return L.divIcon({
          html: `<div class="${sizeClass} custom-cluster-marker">${count}</div>`,
          className: 'cluster-wrapper',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      },
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.custom-pin-marker') && !target.closest('.cluster-wrapper')) {
        onSelectLocation(null);
      }
    });

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxZoom: TILE_LAYERS[activeLayer].maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Update Markers with real coordinates and multi-student grouping
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();

    if (locationGroups.length === 0) return;

    const markers: L.Marker[] = [];
    const bounds = L.latLngBounds([]);

    locationGroups.forEach((group) => {
      const isSelected = selectedLocationKey === group.key;
      const count = group.students.length;
      const icon = createPinIcon(group.residence_type, isSelected, count);

      const marker = L.marker([group.lat, group.lng], {
        icon,
        title: count > 1 ? `${group.residence_type} (${count} Mahasiswa)` : group.students[0].name,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(group);
      });

      markers.push(marker);
      bounds.extend([group.lat, group.lng]);
    });

    clusterGroup.addLayers(markers);

    if (markers.length > 0 && !selectedLocationKey) {
      if (markers.length === 1) {
        map.setView([locationGroups[0].lat, locationGroups[0].lng], 16);
      } else {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    }
  }, [locationGroups, selectedLocationKey, onSelectLocation]);

  // Pan when selected location key changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocationKey) return;

    const selectedGroup = locationGroups.find((g) => g.key === selectedLocationKey);
    if (selectedGroup) {
      map.panTo([selectedGroup.lat, selectedGroup.lng], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [selectedLocationKey, locationGroups]);

  // Control Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (locationGroups.length > 0) {
      const bounds = L.latLngBounds(locationGroups.map((g) => [g.lat, g.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
    } else {
      mapInstanceRef.current.setView(DEFAULT_CENTER, 14);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#EEF2F6] overflow-hidden select-none">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Switcher Pill — Aligned with the left edge of Header / Filter Bar (max-w-7xl mx-auto) */}
      <div className="fixed top-[184px] md:top-[168px] left-3 sm:left-6 right-3 sm:right-6 max-w-7xl md:mx-auto pointer-events-none z-20">
        <div className="pointer-events-auto inline-block relative">
          <button
            onClick={() => setLayerMenuOpen(!layerMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full apple-glass-pill text-[11px] sm:text-xs font-semibold text-[#1D1D1F] hover:bg-white transition-all active:scale-95 shadow-md"
            title="Ganti Lapisan Peta"
          >
            <Layers className="w-3.5 h-3.5 text-[#1D1D1F]" />
            <span className="hidden sm:inline">Peta: </span>
            <span>{TILE_LAYERS[activeLayer].name}</span>
          </button>

          {layerMenuOpen && (
            <div className="absolute top-full left-0 mt-2 apple-glass-card rounded-2xl p-1.5 min-w-[160px] space-y-1 animate-in fade-in zoom-in-95 shadow-xl">
              {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map((key) => {
                const config = TILE_LAYERS[key];
                const isActive = activeLayer === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLayer(key);
                      setLayerMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-black/10 text-[#1D1D1F] font-semibold'
                        : 'text-slate-700 hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>{config.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Map Navigation Controls (Floating Bottom Right) — Aligned with max-w-7xl mx-auto */}
      <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-3 sm:left-6 right-3 sm:right-6 max-w-7xl md:mx-auto pointer-events-none z-20 flex justify-end">
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="apple-glass-card rounded-2xl p-1 flex flex-col shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 text-[#1D1D1F] hover:bg-black/5 rounded-xl transition-colors"
              title="Perbesar Peta"
              aria-label="Perbesar Peta"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="h-px w-full bg-black/[0.06] my-0.5" />
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 text-[#1D1D1F] hover:bg-black/5 rounded-xl transition-colors"
              title="Perkecil Peta"
              aria-label="Perkecil Peta"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <button
            onClick={handleResetView}
            className="p-2 sm:p-2.5 apple-glass-card rounded-2xl text-[#1D1D1F] hover:bg-white transition-colors flex items-center justify-center active:scale-95 shadow-lg"
            title="Pusatkan ke Seluruh Mahasiswa"
            aria-label="Pusatkan ke Seluruh Mahasiswa"
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
