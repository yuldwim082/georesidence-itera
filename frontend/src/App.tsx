import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminImportPage } from './pages/admin/AdminImportPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { authService } from './services/auth';

// Public Layout wrapper with Navbar and optional Footer
const PublicLayout: React.FC<{ withFooter?: boolean }> = ({ withFooter = true }) => {
  const location = useLocation();
  const isMap = location.pathname.startsWith('/map');

  if (isMap) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#F2F2F7]">
        <Navbar />
        <main className="w-full h-full relative">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {withFooter && <Footer />}
    </div>
  );
};

// Protected Admin Route wrapper
const ProtectedAdminRoute: React.FC = () => {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout withFooter={true} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route element={<PublicLayout withFooter={false} />}>
          <Route path="/map" element={<MapPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="import" element={<AdminImportPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
