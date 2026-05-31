import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import PosKasirPage from './pages/PosKasirPage.jsx';
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';
import KatalogOnlinePage from './pages/KatalogOnlinePage.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { ROUTE_ACCESS } from './auth/roleConfig.js';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/pos"
        element={
          <ProtectedRoute roles={ROUTE_ACCESS['/pos']}>
            <PosKasirPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={ROUTE_ACCESS['/owner']}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/katalog"
        element={
          <ProtectedRoute roles={ROUTE_ACCESS['/katalog']}>
            <KatalogOnlinePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
