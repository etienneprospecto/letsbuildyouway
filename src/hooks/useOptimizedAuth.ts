import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { OptimizedAuthService, OptimizedAuthData } from '../services/optimizedAuthService';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UseOptimizedAuthReturn {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Hook optimisé pour l'authentification avec React Query
 * Remplace les multiples useEffect et useState du AuthProvider
 */
export const useOptimizedAuth = (): UseOptimizedAuthReturn => {
  const queryClient = useQueryClient();

  // Query principale pour les données d'authentification
  const {
    data: authData,
    isLoading,
    error: queryError,
    refetch: refetchAuth
  } = useQuery<OptimizedAuthData>({
    queryKey: ['auth', 'current'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { user: null, profile: null, session: null };
      }

      return await OptimizedAuthService.getAuthData(session.user.id);
    },
    // Cache pendant 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry intelligent
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    // Timeout de 10 secondes
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Mutation pour la déconnexion
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalider le cache d'authentification
      queryClient.setQueryData(['auth', 'current'], {
        user: null,
        profile: null,
        session: null
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la déconnexion:', error);
    }
  });

  // Mutation pour rafraîchir le profil
  const refreshProfileMutation = useMutation({
    mutationFn: async () => {
      if (!authData?.user) {
        throw new Error('Aucun utilisateur connecté');
      }
      return await OptimizedAuthService.getAuthData(authData.user.id);
    },
    onSuccess: (newAuthData) => {
      // Mettre à jour le cache avec les nouvelles données
      queryClient.setQueryData(['auth', 'current'], newAuthData);
    }
  });

  // Fonction de déconnexion optimisée
  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Fonction pour rafraîchir le profil
  const refreshProfile = async () => {
    try {
      // Vérifier si l'utilisateur est connecté avant de rafraîchir
      if (!authData?.user) {
        console.log('Aucun utilisateur connecté, pas de rafraîchissement nécessaire');
        return;
      }
      await refreshProfileMutation.mutateAsync();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      throw error;
    }
  };

  return {
    user: authData?.user || null,
    profile: authData?.profile || null,
    session: authData?.session || null,
    loading: isLoading,
    error: queryError?.message || null,
    signOut,
    refreshProfile,
    isAuthenticated: !!(authData?.user && authData?.profile)
  };
};
