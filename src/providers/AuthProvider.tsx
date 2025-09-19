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
      console.log('Fetching profile for user:', userId);
      
      // 1. Essayer de récupérer le profil existant
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!fetchError && existingProfile) {
        console.log('Existing profile found:', existingProfile);
        return existingProfile;
      }

      // 2. Si pas de profil, le créer avec un rôle par défaut
      console.log('No profile found, creating default profile...');
      const { data: userRes } = await supabase.auth.getUser();
      const currentUser = userRes?.user;
      
      if (!currentUser) {
        console.error('No current user found');
        return null;
      }

      // Créer un profil client par défaut (plus simple et fiable)
      const profileData = {
        id: currentUser.id,
        email: currentUser.email ?? '',
        first_name: currentUser.user_metadata?.first_name || 'User',
        last_name: currentUser.user_metadata?.last_name || 'Name',
        role: 'client', // Rôle par défaut, sera mis à jour plus tard si nécessaire
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }
      
      console.log('Profile created successfully:', createdProfile);
      return createdProfile;
      
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Fonction simplifiée pour valider et définir l'utilisateur
  const validateAndSetUser = async (session: Session | null) => {
    // Éviter les appels multiples simultanés
    if (isProcessingAuth.current || isSigningOut.current) {
      console.log('Auth processing already in progress, skipping...');
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

      console.log('Processing user:', session.user.email);
      
      // 1. Définir l'utilisateur et la session immédiatement
      setUser(session.user);
      setSession(session);
      setError(null);
      
      // 2. Charger le profil (sans validation complexe pour l'instant)
      const profileData = await fetchProfile(session.user.id);
      
      if (profileData) {
        setProfile(profileData);
        console.log('User authenticated successfully:', profileData.role);
        
        // 3. Mettre à jour le rôle du profil de manière simple
        // Éviter les appels en arrière-plan qui peuvent causer des boucles
        setTimeout(() => {
          updateProfileRoleSimple(session.user.id, session.user.email || '').catch(error => {
            console.error('Background role update failed:', error);
          });
        }, 1000); // Délai pour éviter les conflits
      } else {
        // En cas d'échec du profil, déconnecter
        console.error('Failed to load/create profile, signing out');
        await signOut();
        return;
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error in validateAndSetUser:', error);
      setError('Erreur lors de l\'authentification');
      // En cas d'erreur, déconnecter pour éviter un état incohérent
      await signOut();
    } finally {
      isProcessingAuth.current = false;
    }
  };

  // Fonction simplifiée pour mettre à jour le rôle du profil
  const updateProfileRoleSimple = async (userId: string, email: string) => {
    try {
      console.log('Updating profile role (simple) for:', email);
      
      // Éviter les appels multiples
      if (isProcessingAuth.current) {
        console.log('Auth processing in progress, skipping role update');
        return;
      }
      
      // Validation d'accès simplifiée
      const allowedCoachEmails = ['etienne.guimbard@gmail.com'];
      const isCoach = allowedCoachEmails.includes(email.toLowerCase());
      
      if (isCoach) {
        // Mettre à jour le profil en tant que coach
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'coach' })
          .eq('id', userId)
          .select()
          .single();
          
        if (!updateError && updatedProfile) {
          console.log('Profile updated to coach role:', updatedProfile);
          setProfile(updatedProfile);
          return;
        }
      }
      
      // Vérification client simplifiée - une seule requête
      const { data: clientRecord, error: clientError } = await supabase
        .from('clients')
        .select('id, coach_id')
        .eq('contact', email.toLowerCase())
        .eq('status', 'active')
        .maybeSingle();
      
      if (!clientError && clientRecord) {
        console.log('Client found, updating profile to client role');
        
        // Mettre à jour le profil en tant que client
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'client',
            client_id: clientRecord.id,
            coach_id: clientRecord.coach_id
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (!updateError && updatedProfile) {
          console.log('Profile updated to client role:', updatedProfile);
          setProfile(updatedProfile);
          return;
        }
      }
      
      console.log('No role update needed or client not found');
      
    } catch (error) {
      console.error('Error in updateProfileRoleSimple:', error);
      // Ne pas échouer si la mise à jour du rôle échoue
    }
  };

  const refreshProfile = async () => {
    if (user && !isProcessingAuth.current) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        // Mettre à jour le rôle si nécessaire (version simplifiée)
        setTimeout(() => {
          updateProfileRoleSimple(user.id, user.email || '').catch(error => {
            console.error('Profile role update failed:', error);
          });
        }, 500);
      }
    }
  };

  const signOut = async () => {
    if (isSigningOut.current) return;
    
    try {
      console.log('Signing out user:', user?.email);
      isSigningOut.current = true;
      
      // Nettoyer l'état local d'abord
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Puis déconnecter de Supabase
      await supabase.auth.signOut();
      console.log('User signed out successfully');
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      isSigningOut.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Timeout de sécurité pour éviter le chargement infini
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Safety timeout reached, forcing loading to false');
        setLoading(false);
        setError('Délai d\'authentification dépassé. Veuillez rafraîchir la page.');
      }
    }, 15000); // 15 secondes
    
    // Fonction d'initialisation unique et sécurisée
    const initializeAuth = async () => {
      if (isInitialized.current) {
        console.log('Auth already initialized, skipping...');
        return;
      }
      
      try {
        console.log('Initializing authentication...');
        
        // 1. Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
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
        console.error('Error during initialization:', error);
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
          console.log('Ignoring auth state change during sign out:', event);
          return;
        }
        
        // Ignorer les événements avant l'initialisation
        if (!isInitialized.current) {
          console.log('Auth not yet initialized, ignoring event:', event);
          return;
        }
        
        console.log('Auth state change:', event, session?.user?.email);
        
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