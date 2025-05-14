import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { authState } = useAuth();
  
  if (!authState.isAuthenticated) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }
  
  if (!authState.user?.isAdmin) {
    // Redirect to home if user is not an admin
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;