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

      // Si pas encore de profil, on le crée à partir des métadonnées auth
      if (!data) {
        console.log('No profile found, creating one...');
        const { data: userRes } = await supabase.auth.getUser();
        const currentUser = userRes.user;
        console.log('Current user from auth:', currentUser);
        
        if (currentUser) {
          const profileData = {
            id: currentUser.id,
            email: currentUser.email ?? '',
            first_name: (currentUser.user_metadata?.first_name as string) ?? 'User',
            last_name: (currentUser.user_metadata?.last_name as string) ?? 'Name',
            role: ((currentUser.user_metadata?.role as string) ?? 'client') as any,
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
        }
      }

      console.log('Profile fetched successfully:', data);
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
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // OPTIMISATION: Validation rapide par email (whitelist)
          try {
            const accessValidation = await AccessValidationService.validateUserAccess(session.user.email!);
            
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
          // Valider l'accès avant de charger le profil
          try {
            const accessValidation = await AccessValidationService.canUserConnect(session.user.id);
            
            if (!accessValidation.hasAccess) {
              // Accès refusé, déconnecter automatiquement
              console.log('Access denied, signing out user:', session.user.email);
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setSession(null);
              setLoading(false);
              return;
            }
            
            // Accès autorisé, charger le profil
            fetchProfile(session.user.id).catch((e) => console.error('Deferred profile fetch error:', e));
          } catch (error) {
            console.error('Error validating access:', error);
            // En cas d'erreur de validation, déconnecter par sécurité
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setSession(null);
            setLoading(false);
          }
        } else {
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
