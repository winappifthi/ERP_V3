import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import AppLayout from '../layouts/AppLayout';
import { routes } from '../navigation/routeConfig';

// Login is not lazy-loaded — it needs to render instantly
import Login from '../features/auth/pages/Login';

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <CircularProgress size={32} />
  </Box>
);

/**
 * Wraps protected routes. Redirects to /login if not authenticated.
 */
function RequireAuth({ children }) {
  const isAuthenticated = useSelector((s) => s.app.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * If user is authenticated and visits /login, redirect to dashboard.
 */
function RedirectIfAuth({ children }) {
  const isAuthenticated = useSelector((s) => s.app.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />

        {/* ── ROOT REDIRECT ── */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* ── PROTECTED ROUTES (AppLayout wraps everything) ── */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          {/* All feature routes from routeConfig */}
          {routes.map(({ path, element: Component }) => (
            <Route
              key={path}
              path={path.replace('/app/', '')}
              element={<Component />}
            />
          ))}
        </Route>

        {/* ── CATCH-ALL: 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}