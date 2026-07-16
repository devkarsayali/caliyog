import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/home/SplashScreen';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminRegister = lazy(() => import('./admin/pages/AdminRegister'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
function App() {
  const [splashDone, setSplashDone] = useState(() => {
    const path = window.location.pathname;
    return path.startsWith('/admin') || path.startsWith('/admin-');
  });



  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#090d13',
            color: '#fff',
            border: '1px solid #22c55e',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
        }}
      />

      {/* Splash Screen */}
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}

      {/* Main App Routes */}
      {splashDone && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-[#090d13] flex items-center justify-center z-[9999]">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Slash Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route
              path="/admin/dashboard/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hyphenated Admin Routes (matching Vercel deploy structure) */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route
              path="/admin-dashboard/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;