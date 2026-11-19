import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/70 backdrop-blur-md border-t border-black/[0.06] pt-14 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-black/[0.06]">
          {/* Brand & Purpose — Clean typography without logos */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-charcoal-900">
                Geo<span className="text-[#FF9500]">Residence</span>
              </span>
              <p className="text-xs text-charcoal-500 font-medium">Geomatika ITERA 2025</p>
            </div>
            <p className="text-sm text-charcoal-600 leading-relaxed max-w-md">
              Platform Web GIS pemetaan spasial sebaran tempat tinggal mahasiswa program studi Teknik Geomatika,
              Institut Teknologi Sumatera (ITERA). Memanfaatkan teknologi geospasial modern dan visualisasi interaktif untuk mendukung analisis sebaran hunian kampus.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 apple-glass-pill w-fit px-3 py-1.5 rounded-full">
              <span>Pemetaan Presisi & Persetujuan Publikasi Mandiri</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-charcoal-600 hover:text-[#FF9500] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-charcoal-600 hover:text-[#FF9500] transition-colors">
                  Peta Interaktif
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-charcoal-600 hover:text-[#FF9500] transition-colors">
                  Tentang Proyek & Privasi
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-charcoal-600 hover:text-[#FF9500] transition-colors">
                  Login Administrator
                </Link>
              </li>
            </ul>
          </div>

          {/* Institution Info */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-4">Institusi</h4>
            <p className="text-sm text-charcoal-600 mb-2 font-medium">Program Studi Teknik Geomatika</p>
            <p className="text-xs text-charcoal-500 leading-relaxed mb-3">
              Jurusan Teknologi Infrastruktur dan Kewilayahan<br />
              Institut Teknologi Sumatera (ITERA)<br />
              Jl. Terusan Ryacudu, Way Hui, Jati Agung, Lampung Selatan 35365
            </p>
            <a
              href="https://itera.ac.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF9500] hover:text-orange-700 hover:underline"
            >
              <span>Situs Resmi ITERA</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>© {new Date().getFullYear()} GeoResidence — Teknik Geomatika ITERA. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-1 font-medium">
            <span>Web GIS Interaktif OpenStreetMap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
