import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './features/home/HomePage';
import HonoreePage from './features/honoree/HonoreePage';
import ExecutiveDashboard from './features/dashboard/ExecutiveDashboard';
import AdminPanel from './features/admin/AdminPanel';
import UnitsPage from './features/admin/UnitsPage';
import ReportsPage from './features/admin/ReportsPage';
import AboutPage from './features/about/AboutPage';
import TimelinePage from './features/timeline/TimelinePage';
import GalleryPage from './features/gallery/GalleryPage';
import PartnersPage from './features/partners/PartnersPage';
import LoginPage from './features/auth/LoginPage';
import AwardDetailsPage from './features/awards/AwardDetailsPage';
import AwardsGalleryPage from './features/awards/AwardsGalleryPage';
import HonoreesGalleryPage from './features/honoree/HonoreesGalleryPage';
import HonoreesAdminPage from './features/admin/HonoreesAdminPage';
import HonoreeRegistrationPage from './features/admin/HonoreeRegistrationPage';
import HonoreeDetailsAdminPage from './features/admin/HonoreeDetailsAdminPage';
import HonoreeEditPage from './features/admin/HonoreeEditPage';
import AwardsAdminPage from './features/admin/AwardsAdminPage';
import AwardRegistrationPage from './features/admin/AwardRegistrationPage';
import HomeMediaAdminPage from './features/admin/HomeMediaAdminPage';
import UnitRegistrationPage from './features/admin/UnitRegistrationPage';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="sobre" element={<AboutPage />} />
            <Route path="linha-do-tempo" element={<TimelinePage />} />
            <Route path="galeria" element={<GalleryPage />} />
            <Route path="homenageados" element={<HonoreesGalleryPage />} />
            <Route path="premios" element={<AwardsGalleryPage />} />
            <Route path="premio/:id" element={<AwardDetailsPage />} />
            <Route path="parceiros" element={<PartnersPage />} />
            <Route path="homenageado/:id" element={<HonoreePage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<ExecutiveDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPanel />} />
              <Route path="homenageados" element={<HonoreesAdminPage />} />
              <Route path="homenageados/novo" element={<HonoreeRegistrationPage />} />
              <Route path="homenageados/novo/:step" element={<HonoreeRegistrationPage />} />
              <Route path="homenageados/:id" element={<HonoreeDetailsAdminPage />} />
              <Route path="homenageados/:id/editar" element={<HonoreeEditPage />} />
              <Route path="homenageados/:id/editar/:step" element={<HonoreeEditPage />} />
              <Route path="premios" element={<AwardsAdminPage />} />
              <Route path="premios/novo" element={<AwardRegistrationPage />} />
              <Route path="premios/:id/editar" element={<AwardRegistrationPage />} />
              <Route path="home-media" element={<HomeMediaAdminPage />} />
              <Route path="unidades" element={<UnitsPage />} />
              <Route path="unidades/novo" element={<UnitRegistrationPage />} />
              <Route path="unidades/:id/editar" element={<UnitRegistrationPage />} />
              <Route path="relatorios" element={<ReportsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
