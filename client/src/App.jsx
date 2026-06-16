import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import useTheme from './hooks/useTheme';
import CommandPalette from './components/CommandPalette';
import Layout from './components/Layout';
import { Loading } from './components/States';

// Route-level code splitting keeps the initial bundle lean (heavy chart pages
// like Dashboard/Reports load on demand).
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const POS = lazy(() => import('./pages/POS'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  useTheme();

  return (
    <>
      {user && <CommandPalette />}
      <AnimatePresence mode="wait">
      <Suspense fallback={<Loading label="Loading…" />}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route
            path="/reports"
            element={
              <RequireAdmin>
                <Reports />
              </RequireAdmin>
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
      </Suspense>
      </AnimatePresence>
    </>
  );
}
