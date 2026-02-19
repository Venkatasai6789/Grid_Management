import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GWOProvider } from './context/GWOContext';
import { UserProvider } from './context/UserContext';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DevicesPage from './pages/DevicesPage';
import WalletPage from './pages/WalletPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// ============================================================
// Protected route wrapper
// ============================================================
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

// ============================================================
// App routes — inside providers
// ============================================================
function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to={role === 'admin' ? '/admin' : '/'} replace />}
      />

      {/* User routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/history" element={<AnalyticsPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>

      {/* Admin route */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboardPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================================
// App — 4-provider nesting: Auth → GWO → User → Sim (innermost)
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GWOProvider>
          <UserProvider>
            <SimulationProvider>
              <AppRoutes />
            </SimulationProvider>
          </UserProvider>
        </GWOProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
