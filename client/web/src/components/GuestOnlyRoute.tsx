import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './PageState';

export function GuestOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="centered-page"><PageLoader label="Checking your session" /></main>;
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
