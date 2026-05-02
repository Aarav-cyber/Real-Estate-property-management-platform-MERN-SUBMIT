import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import LeasesPage     from './pages/LeasesPage';
import PaymentsPage   from './pages/PaymentsPage';
import RequestsPage   from './pages/RequestsPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#14143d',
            color: '#fff',
            border: '1px solid rgba(97,113,246,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6171f6', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — any authenticated user */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/properties" element={
          <ProtectedRoute><PropertiesPage /></ProtectedRoute>
        } />
        <Route path="/properties/:id" element={
          <ProtectedRoute><PropertyDetailsPage /></ProtectedRoute>
        } />
        <Route path="/leases" element={
          <ProtectedRoute><LeasesPage /></ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute><PaymentsPage /></ProtectedRoute>
        } />

        {/* Requests — accessible to all but only owners see data */}
        <Route path="/requests" element={
          <ProtectedRoute><RequestsPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
