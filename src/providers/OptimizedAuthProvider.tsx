import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface OptimizedAuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an OptimizedAuthProvider');
  }
  return context;
};

interface OptimizedAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider d'authentification optimisé avec React Query
 * Remplace l'ancien AuthProvider avec des performances améliorées
 */
export const OptimizedAuthProvider: React.FC<OptimizedAuthProviderProps> = ({ children }) => {
  const authData = useOptimizedAuth();
  const queryClient = useQueryClient();

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Invalider et refetch la requête d'auth quand l'état change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          queryClient.invalidateQueries({ queryKey: ['auth', 'current'] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <OptimizedAuthContext.Provider value={authData}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};
