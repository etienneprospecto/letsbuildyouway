import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      // Si pas encore de profil, on le crée avec le bon rôle
      if (!data) {
        console.log('No profile found, creating profile...');
        const { data: userRes } = await supabase.auth.getUser();
        const currentUser = userRes.user;
        console.log('Current user from auth:', currentUser);
        
        if (currentUser) {
          // Déterminer le rôle en fonction de la validation d'accès
          try {
            const accessValidation = await AccessValidationService.validateUserAccess(currentUser.email!);
            console.log('Access validation for profile creation:', accessValidation);
            
            const profileData = {
              id: currentUser.id,
              email: currentUser.email ?? '',
              first_name: (currentUser.user_metadata?.first_name as string) ?? 'User',
              last_name: (currentUser.user_metadata?.last_name as string) ?? 'Name',
              role: accessValidation.role || 'client', // Utiliser le rôle de la validation
            };
            console.log('Creating profile with data:', profileData);
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(profileData, { onConflict: 'id' })
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              console.log('Profile created successfully:', createdProfile);
              setProfile(createdProfile);
              return;
            }
          } catch (error) {
            console.error('Error validating access during profile creation:', error);
            // En cas d'erreur, créer un profil client par défaut
            const profileData = {
              id: currentUser.id,
              email: currentUser.email ?? '',
              first_name: (currentUser.user_metadata?.first_name as string) ?? 'User',
              last_name: (currentUser.user_metadata?.last_name as string) ?? 'Name',
              role: 'client',
            };
            console.log('Creating default client profile due to validation error');
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(profileData, { onConflict: 'id' })
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating default profile:', createError);
            } else {
              console.log('Default profile created successfully:', createdProfile);
              setProfile(createdProfile);
              return;
            }
          }
        }
      }

      console.log('Profile fetched successfully:', data);
      console.log('Profile role:', data?.role);
      console.log('Setting profile in state:', data);
      setProfile(data ?? null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user?.email);
      
      // Nettoyer d'abord l'état local pour éviter les conflits
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Puis déconnecter de Supabase
      await supabase.auth.signOut();
      console.log('Supabase signOut completed');
      
      console.log('User signed out successfully, should be redirected to AuthPage');
    } catch (error) {
      console.error('Error signing out:', error);
      // L'état est déjà nettoyé, pas besoin de le refaire
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        // Protection contre les blocages (seulement si on n'est pas en train de se déconnecter)
        const timeoutId = setTimeout(() => {
          console.warn('Initial session timeout - forcing loading to false');
          setLoading(false);
        }, 5000);
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        clearTimeout(timeoutId);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found, validating access...');
          // OPTIMISATION: Validation rapide par email (whitelist)
          try {
            console.log('Calling validateUserAccess...');
            const accessValidation = await AccessValidationService.validateUserAccess(session.user.email!);
            console.log('Access validation result:', accessValidation);
            
            if (!accessValidation.hasAccess) {
              console.log('Access denied on initial session, signing out user:', session.user.email);
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setSession(null);
              setLoading(false);
              return;
            }
            
            // Accès autorisé, charger le profil immédiatement
            console.log('Access granted, setting loading to false and fetching profile...');
            setLoading(false); // Libérer l'UI avant le profil
            fetchProfile(session.user.id).catch((e) => console.error('Deferred profile fetch error:', e));
          } catch (error) {
            console.error('Error validating access on initial session:', error);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setSession(null);
            setLoading(false);
          }
        } else {
          console.log('No user found, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found in auth state change, validating access...');
          // OPTIMISATION: Validation rapide par email (whitelist)
          try {
            const accessValidation = await AccessValidationService.validateUserAccess(session.user.email!);
            console.log('Access validation result in auth state change:', accessValidation);
            
            if (!accessValidation.hasAccess) {
              console.log('Access denied, signing out user:', session.user.email);
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setSession(null);
              setLoading(false);
              return;
            }
            
            // Accès autorisé, charger le profil immédiatement
            console.log('Access granted in auth state change, fetching profile for user:', session.user.id);
            setLoading(false); // Libérer l'UI avant le profil
            fetchProfile(session.user.id).catch((e) => console.error('Deferred profile fetch error:', e));
          } catch (error) {
            console.error('Error validating access:', error);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setSession(null);
            setLoading(false);
          }
        } else {
          console.log('No user in auth state change, clearing profile');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
