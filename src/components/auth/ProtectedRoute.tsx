import React from 'react';
import { isActiveSubscriptionStatus } from '@/services/accessValidationService';
import { useAuth } from '@/providers/OptimizedAuthProvider';
import { AuthForm } from './AuthForm';

// Fonction pour vérifier l'accès aux pages selon le plan d'abonnement
const hasPageAccess = (pageId: string, subscriptionPlan: string | null): boolean => {
  if (!subscriptionPlan) return false;
  
  const planLimits = {
    warm_up: ['dashboard', 'clients', 'messages', 'feedbacks-hebdomadaires', 'workouts', 'exercices'],
    transformationnel: ['dashboard', 'clients', 'messages', 'feedbacks-hebdomadaires', 'workouts', 'exercices', 'calendar', 'nutrition', 'trophies', 'billing'],
    elite: ['dashboard', 'clients', 'messages', 'feedbacks-hebdomadaires', 'workouts', 'exercices', 'calendar', 'nutrition', 'trophies', 'billing', 'color-customizer', 'settings']
  };
  
  const allowedPages = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.warm_up;
  return allowedPages.includes(pageId);
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'coach' | 'client';
  pageId?: string; // ID de la page pour vérifier l'accès selon le plan
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  pageId,
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

  // Enforce active/trialing subscription for coach features
  if (requiredRole === 'coach') {
    const status = (profile as any).subscription_status as string | null | undefined;
    if (!isActiveSubscriptionStatus(status)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">Abonnement requis</h1>
            <p className="text-gray-600">Votre abonnement n'est pas actif. Veuillez finaliser ou renouveler votre paiement.</p>
            <p className="text-sm text-gray-500 mt-2">Statut actuel: {status || 'inconnu'}</p>
          </div>
        </div>
      );
    }
  }

  // Vérifier l'accès à la page selon le plan d'abonnement
  if (pageId && requiredRole === 'coach') {
    const subscriptionPlan = (profile as any).subscription_plan as string | null | undefined;
    if (!hasPageAccess(pageId, subscriptionPlan)) {
      const planName = subscriptionPlan === 'warm_up' ? 'Warm-Up' :
                      subscriptionPlan === 'transformationnel' ? 'Transformationnel' :
                      subscriptionPlan === 'elite' ? 'Elite' : 'inconnu';
      
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-500 mb-4">Fonctionnalité non incluse</h1>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité n'est pas incluse dans votre plan <strong>{planName}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Page demandée: {pageId} | Plan actuel: {planName}
            </p>
            <div className="bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Plan Warm-Up inclut :</strong><br />
                Dashboard, Clients, Messages, Feedbacks, Workouts, Exercices
              </p>
              <p className="text-sm text-gray-700">
                <strong>Upgradez</strong> vers Transformationnel ou Elite pour plus de fonctionnalités !
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized
  return <>{children}</>;
};

// Composants spécialisés pour chaque rôle
export const CoachRoute: React.FC<{ children: React.ReactNode; pageId?: string }> = ({ children, pageId }) => (
  <ProtectedRoute requiredRole="coach" pageId={pageId}>
    {children}
  </ProtectedRoute>
);

export const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="client">
    {children}
  </ProtectedRoute>
);
