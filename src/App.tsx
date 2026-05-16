import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { getMe } from './api/auth';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { UsersPage } from './pages/UsersPage';
import { StoresPage } from './pages/StoresPage';
import { AlarmPage } from './pages/AlarmPage';
import { RegisterPage } from './pages/RegisterPage';
import { PageLoading } from './components/common/Loading';
import { useState } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { token, setUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) {
      getMe().then((res) => { if (res.data) setUser(res.data); }).catch(() => {}).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [token]);

  if (!ready) return <PageLoading />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menus" element={<MenuPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="alarms" element={<AlarmPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
