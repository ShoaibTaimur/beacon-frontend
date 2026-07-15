import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SharedDevicesPage from './pages/SharedDevicesPage';
import MapTimelinePage from './pages/MapTimelinePage';
import LandingPage from './pages/LandingPage';

function VercelAnalytics() {
  const location = useLocation();
  return <Analytics key={location.pathname} />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <ProtectedRoute>
                <SharedDevicesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/devices/:id/map" element={<MapTimelinePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <VercelAnalytics />
      </AuthProvider>
    </Router>
  );
}

export default App;
