import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Browse } from './pages/Browse';
import { ReportLost } from './pages/ReportLost';
import { ReportFound } from './pages/ReportFound';
import { ItemDetail } from './pages/ItemDetail';
import { MyItems } from './pages/MyItems';
import { Claims } from './pages/Claims';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';

export function App() {
  const theme = useAuthStore((state) => state.theme);
  useSocket(); // Maintain live socket events

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="browse" element={<Browse />} />
        <Route path="items/:id" element={<ItemDetail />} />

        {/* Protected Routes */}
        <Route
          path="report/lost"
          element={
            <ProtectedRoute>
              <ReportLost />
            </ProtectedRoute>
          }
        />
        <Route
          path="report/found"
          element={
            <ProtectedRoute>
              <ReportFound />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-items"
          element={
            <ProtectedRoute>
              <MyItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="claims"
          element={
            <ProtectedRoute>
              <Claims />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
