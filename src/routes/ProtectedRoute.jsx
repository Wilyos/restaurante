import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowed }) {
  const { rol } = useAuth();
  if (!rol) return <Navigate to="/login" replace />;
  if (allowed.includes(rol) || rol === 'admin') return children;
  return <Navigate to="/" replace />;
}
