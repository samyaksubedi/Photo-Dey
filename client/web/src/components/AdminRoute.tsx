import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './PageState';

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Checking administrator access" />;
  if (!user) return <Navigate to="/admin" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
