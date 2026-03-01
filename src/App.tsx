import { Navigate, Route, Routes } from 'react-router-dom';
import { UIStudioComponentPage } from '@/components/ui/UIStudioPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UIStudioComponentPage />} />
      <Route path="/:component" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
