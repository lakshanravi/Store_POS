import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { FullPageSpinner } from './components/shared/Spinner';
import { ProtectedRoute, PermissionRoute } from './components/auth/ProtectedRoute';
import AppLayout    from './components/layout/AppLayout';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import POS          from './pages/POS';
import Products     from './pages/Products';
import Categories   from './pages/Categories';
import Suppliers    from './pages/Suppliers';
import Customers    from './pages/Customers';
import Sales        from './pages/Sales';
import Refunds      from './pages/Refunds';
import Inventory    from './pages/Inventory';
import Settings     from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import DailySales   from './pages/reports/DailySales';
import ProfitLoss   from './pages/reports/ProfitLoss';
import RefundLog    from './pages/reports/RefundLog';

export default function App() {
  const { init, isInitialized } = useAuthStore();

  useEffect(() => {
    init(); // Read JWT from localStorage — no API call needed
  }, []);

  if (!isInitialized) return <FullPageSpinner />;

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontFamily: 'DM Sans' },
        success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
      }} />

      <Routes>
        <Route path="/login"        element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="pos"        element={<PermissionRoute permission="sales"><POS /></PermissionRoute>} />
          <Route path="sales"      element={<PermissionRoute permission="sales"><Sales /></PermissionRoute>} />
          <Route path="refunds"    element={<PermissionRoute permission="sales"><Refunds /></PermissionRoute>} />
          <Route path="customers"  element={<PermissionRoute permission="sales"><Customers /></PermissionRoute>} />

          <Route path="products"   element={<PermissionRoute permission="products"><Products /></PermissionRoute>} />
          <Route path="categories" element={<PermissionRoute permission="products"><Categories /></PermissionRoute>} />

          <Route path="suppliers"  element={<PermissionRoute permission="inventory"><Suppliers /></PermissionRoute>} />
          <Route path="inventory"  element={<PermissionRoute permission="inventory"><Inventory /></PermissionRoute>} />

          <Route path="reports/daily"   element={<PermissionRoute permission="reports"><DailySales /></PermissionRoute>} />
          <Route path="reports/pnl"     element={<PermissionRoute permission="reports"><ProfitLoss /></PermissionRoute>} />
          <Route path="reports/refunds" element={<PermissionRoute permission="reports"><RefundLog /></PermissionRoute>} />

          <Route path="settings"   element={<PermissionRoute permission="settings"><Settings /></PermissionRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}