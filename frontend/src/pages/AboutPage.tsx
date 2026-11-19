import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Home,
  Building2,
  Key,
  GraduationCap,
  Lock,
  Users,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-charcoal-800">
            <GraduationCap className="w-4 h-4 text-[#FF9500]" />
            <span>Teknik Geomatika • Institut Teknologi Sumatera</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight">
            Tentang GeoResidence
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed font-normal">
            Sistem Informasi Geografis (Web GIS) interaktif untuk memetakan dan menganalisis sebaran tempat tinggal mahasiswa Teknik Geomatika ITERA dengan mengedepankan etika privasi data spasial.
          </p>
        </div>

        {/* 1. LATAR BELAKANG & TUJUAN PROYEK */}
        <section className="space-y-4 pt-6 border-t border-black/[0.06]">
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2.5">
            <span className="text-[#FF9500] font-extrabold">#</span>
            <span>Latar Belakang & Tujuan</span>
          </h2>
          <div className="prose prose-slate text-charcoal-600 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              <strong>GeoResidence</strong> lahir dari inisiatif akademis di lingkungan Program Studi Teknik Geomatika, Jurusan Teknologi Infrastruktur dan Kewilayahan, Institut Teknologi Sumatera (ITERA). Sebagai disiplin ilmu yang berfokus pada pengumpulan, pemodelan, analisis, dan pengelolaan data spasial, pemetaan sebaran residensial mahasiswa merupakan implementasi nyata penerapan teknologi Web GIS untuk memecahkan persoalan kewilayahan kampus.
            </p>
            <p>
              Tujuan utama dari platform ini mencakup:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Visualisasi Spasial Mahasiswa:</strong> Memberikan representasi visual interaktif mengenai pola persebaran hunian 137 mahasiswa angkatan di sekitar kampus ITERA dan wilayah aglomerasi Bandar Lampung - Lampung Selatan.
              </li>
              <li>
                <strong>Analisis Aksesibilitas & Mobilitas:</strong> Menyediakan data dasar untuk menganalisis jarak tempuh, koridor transportasi mahasiswa, dan konsentrasi hunian di sekitar fasilitas kampus.
              </li>
              <li>
                <strong>Penerapan Etika Data Spasial:</strong> Mendemonstrasikan bagaimana data geospasial personal dapat dipublikasikan untuk keperluan analisis tanpa mengorbankan keamanan dan privasi subjek data.
              </li>
            </ul>
          </div>
        </section>

        {/* 2. KLASIFIKASI KATEGORI RESIDENSIAL */}
        <section className="space-y-6 pt-6 border-t border-black/[0.06]">
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[#FF9500]" />
            <span>Tiga Kategori Residensial</span>
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Data tempat tinggal mahasiswa diklasifikasikan ke dalam tiga jenis hunian utama yang merepresentasikan karakteristik gaya hidup dan mobilitas mahasiswa ITERA:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rumah */}
            <div className="apple-glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#34C759] font-bold text-lg">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#34C759]">
                  <Home className="w-4 h-4" />
                </div>
                <span>1. Rumah</span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Hunian permanen milik keluarga atau orang tua. Mahasiswa berstatus <em>commuter</em> harian dari tempat tinggal keluarga menuju kampus ITERA.
              </p>
              <div className="text-[11px] font-semibold text-[#34C759] bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                Marker Hijau (#34C759)
              </div>
            </div>

            {/* Kost */}
            <div className="apple-glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#007AFF] font-bold text-lg">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#007AFF]">
                  <Building2 className="w-4 h-4" />
                </div>
                <span>2. Kost</span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Sewa kamar perorangan pada rumah tinggal atau bangunan kos khusus mahasiswa. Umumnya berada pada radius 1–5 km dari gerbang kampus.
              </p>
              <div className="text-[11px] font-semibold text-[#007AFF] bg-blue-500/10 px-2.5 py-1 rounded-full w-fit">
                Marker Biru (#007AFF)
              </div>
            </div>

            {/* Kontrakan */}
            <div className="apple-glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#FF9500] font-bold text-lg">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#FF9500]">
                  <Key className="w-4 h-4" />
                </div>
                <span>3. Kontrakan</span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Sewa satu unit rumah secara kolektif (kelompok mahasiswa) atau mandiri, umumnya dilengkapi fasilitas ruang bersama dan dapur.
              </p>
              <div className="text-[11px] font-semibold text-[#FF9500] bg-orange-500/10 px-2.5 py-1 rounded-full w-fit">
                Marker Oranye (#FF9500)
              </div>
            </div>
          </div>
        </section>

        {/* 3. PERSETUJUAN PUBLIKASI & PEMETAAN HUNIAN BERSAMA */}
        <section className="space-y-6 pt-6 border-t border-black/[0.06]">
          <div className="flex items-center gap-2.5 text-charcoal-900">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF9500] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Kebijakan Data & Persetujuan Publikasi</h2>
              <p className="text-xs text-charcoal-500 font-medium">Transparansi dan Perlindungan Data Mahasiswa</p>
            </div>
          </div>

          <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-3 text-sm sm:text-base text-charcoal-700 leading-relaxed">
              <p>
                GeoResidence memetakan sebaran tempat tinggal mahasiswa Teknik Geomatika ITERA secara akurat sesuai lokasi tempat tinggal sebenarnya (Rumah, Kost, atau Kontrakan). Setiap data yang ditampilkan telah melalui konfirmasi dan persetujuan publikasi secara sukarela.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-2xl p-5 border border-black/[0.05] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-charcoal-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-[#FF9500]" />
                  <span>Pengelompokan Hunian Bersama</span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Bagi mahasiswa yang tinggal di lokasi yang sama (seperti kost atau kontrakan bersama), sistem menyatukan titik lokasi tersebut menjadi satu pin marker dengan daftar nama seluruh penghuni yang tinggal di tempat tersebut.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-5 border border-black/[0.05] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-charcoal-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-[#FF9500]" />
                  <span>Kendali Penuh Administrator</span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Administrator memiliki kewenangan penuh untuk mengelola, memperbarui data koordinat, dan menonaktifkan status publikasi mahasiswa sewaktu-waktu sesuai kebutuhan privasi.
                </p>
              </div>
            </div>

            <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20 text-xs text-orange-950 leading-relaxed">
              <strong>Catatan:</strong> Informasi publik yang disajikan terbatas pada nama mahasiswa dan kategori tempat tinggal. Koordinat peta ditampilkan secara akurat guna mendukung analisis geospasial sebaran komunitas civitas akademika Teknik Geomatika ITERA.
            </div>
          </div>
        </section>

        {/* CTA TO MAP */}
        <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-charcoal-900">Ingin melihat visualisasi peta?</h3>
            <p className="text-xs text-charcoal-500">Buka peta interaktif dan jelajahi sebaran tempat tinggal mahasiswa.</p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#FF9500] hover:bg-[#EA580C] text-white font-semibold text-sm shadow-[0_4px_16px_rgba(255,149,0,0.3)] transition-all"
          >
            <span>Buka Peta Interaktif</span>
            <ArrowRight className="w-4 h-4 text-orange-100" />
          </Link>
        </div>
      </div>
    </div>
  );
};
