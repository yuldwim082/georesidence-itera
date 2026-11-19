import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  LogOut,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { authService } from '../../services/auth';
import { apiService } from '../../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = authService.getUsername() || 'Admin';

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch {
      // Continue cleanup
    } finally {
      authService.clearAuth();
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Data Mahasiswa', path: '/admin/students', icon: Users },
    { label: 'Import CSV / Excel', path: '/admin/import', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION — Apple Glass iOS */}
      <aside className="w-full md:w-64 bg-white/80 backdrop-blur-xl border-r border-black/[0.06] flex flex-col justify-between shrink-0">
        <div>
          {/* Pure typography brand */}
          <div className="h-20 flex items-center px-6 border-b border-black/[0.05]">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-charcoal-900">
                Geo<span className="text-[#FF9500]">Residence</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-700 px-2 py-0.5 rounded-full border border-orange-500/20">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF9500] text-white shadow-[0_4px_14px_rgba(255,149,0,0.28)]'
                      : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-charcoal-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-black/[0.05] space-y-2">
          {/* View Public Map link */}
          <Link
            to="/map"
            target="_blank"
            className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 hover:bg-black/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF9500]" />
              <span>Lihat Peta Publik</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
          </Link>

          {/* Admin user info & Logout */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05]">
            <div className="truncate pr-2">
              <span className="text-[10px] uppercase font-bold text-charcoal-500 block">Masuk Sebagai</span>
              <span className="text-xs font-bold text-charcoal-900 truncate block">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
              title="Keluar"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#F8F9FA]">
        {children}
      </main>
    </div>
  );
};
