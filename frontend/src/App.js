// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary       from './components/layout/ErrorBoundary';
import Sidebar             from './components/layout/Sidebar';
import LoginPage           from './pages/LoginPage';
import DashboardPage       from './pages/DashboardPage';
import ProductsPage        from './pages/ProductsPage';
import InventoryPage       from './pages/InventoryPage';
import SalesPage           from './pages/SalesPage';
import ReportsPage         from './pages/ReportsPage';
import NotFoundPage        from './pages/NotFoundPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;

  return (
    <Routes>
      <Route path="/login"           element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute><AppLayout><ProductsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute><AppLayout><InventoryPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute><AppLayout><SalesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute adminOnly><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
