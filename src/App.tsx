import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { DataProvider } from './data/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DataModeBanner from './components/DataModeBanner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Overview from './pages/Overview';
import Hotspots from './pages/Hotspots';
import Predictions from './pages/Predictions';
import Operations from './pages/Operations';
import Intelligence from './pages/Intelligence';
import Reports from './pages/Reports';
import DataSources from './pages/DataSources';
import Settings from './pages/Settings';
import './App.css';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Waste Intelligence Platform',
  '/overview': 'Waste Intelligence Platform',
  '/hotspots': 'Waste Hotspots',
  '/predictions': 'Predictive Hotspot Models',
  '/operations': 'Operations & Collection',
  '/intelligence': 'Operational Intelligence',
  '/reports': 'Reports & Briefings',
  '/data-sources': 'Data Sources',
  '/settings': 'Platform Settings',
};

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = routeTitles[location.pathname] || 'WasteSignal';

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <Header
          title={title}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <DataModeBanner />
        <main className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="/hotspots" element={<Hotspots />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Marketing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUpPage />
                </PublicRoute>
              }
            />

            {/* Protected Workspace Dashboard Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
