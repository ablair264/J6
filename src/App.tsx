import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { UIStudioComponentPage } from '@/components/ui/UIStudioPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SvgLayoutLoader } from '@/components/ui/svg-layout-loader';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Projects from '@/pages/Projects';
import Profile from '@/pages/Profile';
import LandingPage from '@/pages/LandingPage';
import ComponentLibrary from '@/pages/ComponentLibrary';

export default function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBootLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (isBootLoading) {
    return <SvgLayoutLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/library" element={<ComponentLibrary />} />
      <Route path="/library/:slug" element={<ComponentLibrary />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <UIStudioComponentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
