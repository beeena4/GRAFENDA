// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'seller' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user.role === 'admin' ? '/dashboard/admin' :
                         user.role === 'seller' ? '/dashboard/seller' :
                         '/dashboard/user';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};