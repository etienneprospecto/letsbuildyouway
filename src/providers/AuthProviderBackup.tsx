import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { AccessValidationService } from '../services/accessValidationService';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref pour éviter les appels multiples simultanés
  const isProcessingAuth = useRef(false);
  const isSigningOut = useRef(false);
  const isInitialized = useRef(false);

  // Fonction simplifiée pour récupérer/créer un profil
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);

      // 1. Essayer de récupérer le profil existant
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!fetchError && existingProfile) {
        console.log('✅ Profile found:', existingProfile.role);
        return existingProfile;
      }

      // 2. Si pas de profil, le créer avec le bon rôle
      const { data: userRes } = await supabase.auth.getUser();
      const currentUser = userRes?.user;
      
      if (!currentUser) {
        console.log('❌ No current user found');
        return null;
      }

      // Déterminer le rôle basé sur l'email
      const email = currentUser.email?.toLowerCase() || '';
      const allowedCoachEmails = ['etienne.guimbard@gmail.com', 'team@propulseo-site.com', 'henriprospecto123@gmail.com'];
      const isCoach = allowedCoachEmails.includes(email);
      
      console.log('👤 User email:', email, 'isCoach:', isCoach);

      // Créer un profil avec le bon rôle
      const profileData = {
        id: currentUser.id,
        email: currentUser.email ?? '',
        first_name: currentUser.user_metadata?.first_name || 'User',
        last_name: currentUser.user_metadata?.last_name || 'Name',
        role: isCoach ? 'coach' : 'client',
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return null;
      }

      console.log('✅ Profile created with role:', createdProfile.role);
      return createdProfile;
      
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      return null;
    }
  };

  // Fonction simplifiée pour valider et définir l'utilisateur
  const validateAndSetUser = async (session: Session | null) => {
    // Éviter les appels multiples simultanés
    if (isProcessingAuth.current || isSigningOut.current) {
      console.log('⚠️ Auth déjà en cours, ignorer cet appel');
      return;
    }

    isProcessingAuth.current = true;
    
    try {
      if (!session?.user) {
        // Pas d'utilisateur, nettoyer l'état
        setUser(null);
        setProfile(null);
        setSession(null);
        setError(null);
        setLoading(false);
        return;
      }

      // 1. Définir l'utilisateur et la session immédiatement
      setUser(session.user);
      setSession(session);
      setError(null);
      
      // 2. Charger le profil (sans validation complexe pour l'instant)
      const profileData = await fetchProfile(session.user.id);
      
      if (profileData) {
        setProfile(profileData);
        setLoading(false);
        console.log('✅ Profil chargé avec succès:', profileData.role);
      } else {
        // En cas d'échec du profil, ne pas déconnecter automatiquement
        console.warn('⚠️ Profil non trouvé, création en cours...');
        
        // Essayer de créer le profil
        try {
          const { data: userRes } = await supabase.auth.getUser();
          const currentUser = userRes?.user;
          
          if (currentUser) {
            const email = currentUser.email?.toLowerCase() || '';
            const allowedCoachEmails = ['etienne.guimbard@gmail.com', 'team@propulseo-site.com', 'henriprospecto123@gmail.com'];
            const isCoach = allowedCoachEmails.includes(email);
            
            const profileData = {
              id: currentUser.id,
              email: currentUser.email || '',
              first_name: currentUser.user_metadata?.first_name || 'User',
              last_name: currentUser.user_metadata?.last_name || 'Name',
              role: isCoach ? 'coach' : 'client',
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(profileData, { onConflict: 'id' })
              .select()
              .single();
              
            if (!createError && createdProfile) {
              console.log('✅ Profil créé:', createdProfile.role);
              setProfile(createdProfile);
              setLoading(false);
              return;
            }
          }
        } catch (createError) {
          console.error('❌ Erreur création profil:', createError);
        }
        
        // Si tout échoue, déconnecter
        console.error('❌ Impossible de créer le profil, déconnexion');
        await signOut();
        return;
      }
      
    } catch (error) {

      setError('Erreur lors de l\'authentification');
      // En cas d'erreur, déconnecter pour éviter un état incohérent
      await signOut();
    } finally {
      isProcessingAuth.current = false;
    }
  };

  // ✅ SUPPRIMÉ : updateProfileRoleSimple qui causait la boucle infinie
  // Le rôle est maintenant déterminé directement dans fetchProfile

  const refreshProfile = async () => {
    if (user && !isProcessingAuth.current) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        // ✅ SUPPRIMÉ : setTimeout qui causait des problèmes
      }
    }
  };

  const signOut = async () => {
    if (isSigningOut.current) return;
    
    try {

      isSigningOut.current = true;
      
      // Nettoyer l'état local d'abord
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Puis déconnecter de Supabase
      await supabase.auth.signOut();

    } catch (error) {

    } finally {
      isSigningOut.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Timeout de sécurité pour éviter le chargement infini
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {

        setLoading(false);
        setError('Délai d\'authentification dépassé. Veuillez rafraîchir la page.');
      }
    }, 15000); // 15 secondes
    
    // Fonction d'initialisation unique et sécurisée
    const initializeAuth = async () => {
      if (isInitialized.current) {

        return;
      }
      
      try {

        // 1. Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;
        
        // 2. Traiter la session initiale
        if (session?.user) {
          await validateAndSetUser(session);
        } else {
          // Pas de session, état déconnecté
          setUser(null);
          setProfile(null);
          setSession(null);
          setError(null);
          setLoading(false);
        }
        
        isInitialized.current = true;
        
      } catch (error) {

        if (mounted) {
          setError('Erreur lors de l\'initialisation');
          setLoading(false);
        }
      }
    };

    // Lancer l'initialisation
    initializeAuth();

    // Écouter les changements d'état d'authentification (seulement après l'initialisation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ignorer les événements pendant la déconnexion
        if (isSigningOut.current) {

          return;
        }
        
        // Ignorer les événements avant l'initialisation
        if (!isInitialized.current) {

          return;
        }

        if (mounted && !isProcessingAuth.current) {
          await validateAndSetUser(session);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};