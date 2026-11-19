import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { authService } from '../../services/auth';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  const isMap = location.pathname.startsWith('/map');

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Peta Interaktif', path: '/map' },
    { label: 'Tentang & Privasi', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`z-40 apple-glass transition-all duration-300 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-7xl mx-auto rounded-2xl sm:rounded-3xl ${
        isMap
          ? 'fixed top-3 md:top-4 left-3 sm:left-6 right-3 sm:right-6'
          : 'sticky top-3 md:top-4 mb-4'
      }`}
    >
      <div className="px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand — Pure Apple Typography without logos */}
          <Link to="/" className="flex items-center group select-none shrink-0 pr-2">
            <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-[#1D1D1F] group-hover:opacity-90 transition-opacity">
              GeoResidence
            </span>
          </Link>

          {/* Desktop Navigation Links — Only on Large Screens (lg: >= 1024px) */}
          <nav className="hidden lg:inline-flex apple-segmented-track shrink-0">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'apple-segmented-active'
                      : 'apple-segmented-inactive font-medium'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions for Large Desktop (lg: >= 1024px) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#FF9500] hover:bg-[#E08500] text-white shadow-[0_2px_10px_rgba(255,149,0,0.32)] transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <span>Buka Peta</span>
            </Link>

            <Link
              to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium apple-glass-pill text-[#1D1D1F] hover:bg-white transition-all border border-white/80 active:scale-[0.98] whitespace-nowrap"
              title="Portal Administrator"
            >
              <span>{isAuthenticated ? 'Admin Panel' : 'Masuk Admin'}</span>
            </Link>
          </div>

          {/* Tablet & Mobile Right Action Group (Shown when screen < 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Map CTA on Tablet (sm/md screens) */}
            {!isMap && (
              <Link
                to="/map"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500] hover:bg-[#E08500] text-white shadow-sm transition-all whitespace-nowrap"
              >
                Buka Peta
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full apple-glass-pill text-[#1D1D1F] hover:bg-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/60 px-4 pt-3 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="apple-segmented-track w-full flex flex-col gap-1 p-1.5 rounded-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'apple-segmented-active'
                    : 'apple-segmented-inactive'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#FF9500] text-white shadow-sm"
            >
              Buka Peta Interaktif
            </Link>
            <Link
              to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium apple-glass-pill text-[#1D1D1F]"
            >
              {isAuthenticated ? 'Admin Dashboard' : 'Masuk Admin'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
