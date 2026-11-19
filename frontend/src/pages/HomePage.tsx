import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users,
  Home,
  Building2,
  Key,
  ChevronRight,
  Check,
} from 'lucide-react';
import { apiService } from '../services/api';
import { PublicStatistics } from '../types';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<PublicStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .getPublicStatistics()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.warn('Failed to load public statistics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      {/* HERO SECTION — Apple Glass iOS Style */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-white via-[#F8F9FA] to-[#F8F9FA] border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Apple Glass Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-charcoal-800 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse" />
              <span>Teknik Geomatika ITERA • Web GIS Interaktif</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-charcoal-900 leading-[1.12]">
              Discover Where <br className="hidden sm:inline" />
              <span className="text-[#FF9500]">
                We Live.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-charcoal-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Explore the residential distribution of Geomatics Engineering students through an interactive map.
              Visualisasi sebaran spasial tempat tinggal mahasiswa angkatan dengan perlindungan privasi geospasial.
            </p>

            {/* Action Buttons — iOS Style */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[#FF9500] hover:bg-[#EA580C] text-white shadow-[0_4px_16px_rgba(255,149,0,0.32)] transition-all duration-200 group active:scale-[0.98]"
              >
                <MapPin className="w-4 h-4 text-orange-100" />
                <span>Jelajahi Peta Interaktif</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-medium apple-glass-pill text-charcoal-700 hover:text-charcoal-950 hover:bg-white transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF9500]" />
                <span>Pelajari Privasi & Metodologi</span>
              </Link>
            </div>
          </div>

          {/* DYNAMIC STATISTICS CARDS — Apple Glass Cards */}
          <div className="mt-16 md:mt-24">
            <div className="text-center mb-8">
              <h2 className="text-[11px] uppercase tracking-widest font-bold text-charcoal-400">
                Statistik Distribusi Tempat Tinggal Mahasiswa
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Mahasiswa */}
              <div className="apple-glass-card rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    Total Mahasiswa
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-black/5 flex items-center justify-center text-charcoal-800">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
                  {loading ? (
                    <div className="h-9 w-16 bg-black/5 animate-pulse rounded-lg" />
                  ) : (
                    stats?.total_students ?? 0
                  )}
                </div>
                <p className="text-xs text-charcoal-500 mt-2 font-medium">
                  Terdaftar & terverifikasi
                </p>
              </div>

              {/* Rumah */}
              <div className="apple-glass-card rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#34C759]">
                    Rumah
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#34C759]">
                    <Home className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#34C759] tracking-tight">
                  {loading ? (
                    <div className="h-9 w-16 bg-emerald-500/10 animate-pulse rounded-lg" />
                  ) : (
                    stats?.rumah_count ?? 0
                  )}
                </div>
                <p className="text-xs text-charcoal-500 mt-2 font-medium">
                  Tinggal bersama keluarga
                </p>
              </div>

              {/* Kost */}
              <div className="apple-glass-card rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#007AFF]">
                    Kost
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#007AFF]">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#007AFF] tracking-tight">
                  {loading ? (
                    <div className="h-9 w-16 bg-blue-500/10 animate-pulse rounded-lg" />
                  ) : (
                    stats?.kost_count ?? 0
                  )}
                </div>
                <p className="text-xs text-charcoal-500 mt-2 font-medium">
                  Sewa kamar individu
                </p>
              </div>

              {/* Kontrakan */}
              <div className="apple-glass-card rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF9500]">
                    Kontrakan
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#FF9500]">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9500] tracking-tight">
                  {loading ? (
                    <div className="h-9 w-16 bg-orange-500/10 animate-pulse rounded-lg" />
                  ) : (
                    stats?.kontrakan_count ?? 0
                  )}
                </div>
                <p className="text-xs text-charcoal-500 mt-2 font-medium">
                  Sewa rumah bersama
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE RESIDENTIAL CATEGORIES SECTION — Apple Glass */}
      <section className="py-20 bg-white/60 border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF9500]">
              Klasifikasi Residensial
            </span>
            <h2 className="text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
              Tiga Kategori Tempat Tinggal
            </h2>
            <p className="text-charcoal-600 text-sm mt-2">
              Setiap kategori divisualisasikan dengan penanda warna spesifik untuk memudahkan analisis geospasial sebaran mahasiswa di sekitar kampus ITERA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card Rumah */}
            <div className="apple-glass-card rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#34C759]">
                  <Home className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#34C759]" />
                  <h3 className="text-xl font-bold text-charcoal-900">Rumah</h3>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Mahasiswa yang berdomisili menetap bersama orang tua atau keluarga di rumah pribadi, umumnya tersebar di area Kota Bandar Lampung dan sekitarnya.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-semibold text-[#34C759]">
                <span>Marker: Hijau Zamrud</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10">Kategori 1</span>
              </div>
            </div>

            {/* Card Kost */}
            <div className="apple-glass-card rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#007AFF]">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#007AFF]" />
                  <h3 className="text-xl font-bold text-charcoal-900">Kost</h3>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Hunian sewa kamar mandiri oleh perorangan, terletak strategis dalam koridor akses kampus ITERA di kawasan Way Huwi, Jatimulyo, dan sekitarnya.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-semibold text-[#007AFF]">
                <span>Marker: Biru Safir</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10">Kategori 2</span>
              </div>
            </div>

            {/* Card Kontrakan */}
            <div className="apple-glass-card rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF9500]">
                  <Key className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF9500]" />
                  <h3 className="text-xl font-bold text-charcoal-900">Kontrakan</h3>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Hunian satu unit rumah sewa kolektif yang dihuni beberapa mahasiswa secara bersama, memiliki fasilitas ruang bersama dan dapur komunal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-semibold text-[#FF9500]">
                <span>Marker: Oranye Hangat</span>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/10">Kategori 3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION — Apple Inset Layout */}
      <section className="py-20 bg-white/40 border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full apple-glass-pill text-xs font-semibold text-charcoal-700">
                <span>Inovasi Web GIS ITERA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
                Pemetaan Presisi & <br />
                Persetujuan Publikasi Mandiri.
              </h2>
              <p className="text-charcoal-600 text-base leading-relaxed">
                GeoResidence memvisualisasikan data spasial tempat tinggal mahasiswa Teknik Geomatika ITERA
                secara akurat. Mahasiswa yang tinggal di lokasi yang sama (seperti kost atau kontrakan bersama)
                secara otomatis dikelompokkan pada satu titik peta dengan daftar nama penghuni yang transparan.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-[#FF9500] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Pengelompokan Hunian Kolektif</h4>
                    <p className="text-xs text-charcoal-600">Sistem mendeteksi koordinat identik untuk menampilkan seluruh penghuni yang berada dalam satu kost atau kontrakan bersama.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-[#FF9500] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Persetujuan & Kendali Publikasi</h4>
                    <p className="text-xs text-charcoal-600">Hanya mahasiswa yang memberikan persetujuan (consent) dan diaktifkan oleh admin yang muncul pada peta publik.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF9500] hover:text-orange-700 hover:underline"
                >
                  <span>Baca dokumentasi lengkap tentang privasi</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Callout Card — Apple Frosted Dark Slate */}
            <div className="relative">
              <div className="bg-[#1C1C1E] rounded-4xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Siap Menjelajahi Sebaran Residensial Mahasiswa?
                  </h3>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    Lihat peta interaktif berbasis Leaflet & OpenStreetMap sekarang juga tanpa instalasi tambahan.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/map"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-md active:scale-95"
                    >
                      <MapPin className="w-4 h-4 text-[#FF9500]" />
                      <span>Buka Peta Interaktif</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
