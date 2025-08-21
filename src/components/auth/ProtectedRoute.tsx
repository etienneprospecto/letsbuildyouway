import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { AuthForm } from './AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'coach' | 'client';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, profile, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  // Role check if required
  if (requiredRole && profile.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Rôle requis: {requiredRole} | Votre rôle: {profile.role}
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
};

// Composants spécialisés pour chaque rôle
export const CoachRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="coach">
    {children}
  </ProtectedRoute>
);

export const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="client">
    {children}
  </ProtectedRoute>
);
