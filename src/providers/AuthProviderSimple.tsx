import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

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

  console.log('🚀 AuthProvider SIMPLE initialisé');

  // Fonction ultra-simplifiée pour récupérer le profil
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!fetchError && existingProfile) {
        console.log('✅ Profile found:', existingProfile.role);
        return existingProfile;
      }

      console.log('❌ No existing profile found for user:', userId);
      return null;
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      return null;
    }
  };

  // Fonction ultra-simplifiée pour valider et définir l'utilisateur
  const validateAndSetUser = async (session: Session | null) => {
    console.log('🔍 validateAndSetUser called with session:', !!session);
    
    try {
      if (!session?.user) {
        console.log('❌ No session/user, clearing state');
        setUser(null);
        setProfile(null);
        setSession(null);
        setError(null);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, setting user:', session.user.email);
      setUser(session.user);
      setSession(session);
      setError(null);

      // Charger le profil
      const profileData = await fetchProfile(session.user.id);
      
      if (profileData) {
        console.log('✅ Profile loaded:', profileData.role);
        setProfile(profileData);
        setLoading(false);
      } else {
        console.log('⚠️ No profile found, creating one...');
        
        // Créer un profil simple
        const email = session.user.email?.toLowerCase() || '';
        const allowedCoachEmails = ['etienne.guimbard@gmail.com', 'team@propulseo-site.com', 'henriprospecto123@gmail.com'];
        const isCoach = allowedCoachEmails.includes(email);

        const newProfileData = {
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || 'User',
          last_name: session.user.user_metadata?.last_name || 'Name',
          role: isCoach ? 'coach' : 'client',
        };

        console.log('🔧 Creating profile:', newProfileData);

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfileData, { onConflict: 'id' })
          .select()
          .single();

        if (!createError && createdProfile) {
          console.log('✅ Profile created:', createdProfile.role);
          setProfile(createdProfile);
          setLoading(false);
        } else {
          console.error('❌ Error creating profile:', createError);
          setError('Erreur lors de la création du profil');
          setLoading(false);
        }
      }

    } catch (error) {
      console.error('❌ Error in validateAndSetUser:', error);
      setError('Erreur lors de l\'authentification');
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Error during sign out:', error);
      setError(error.message || 'Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 AuthProvider useEffect starting...');

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔔 Auth state change:', event, !!currentSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (currentSession) {
            await validateAndSetUser(currentSession);
          } else {
            setUser(null);
            setProfile(null);
            setSession(null);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSession(null);
          setLoading(false);
          setError(null);
        } else if (event === 'USER_UPDATED') {
          const { data: { session: updatedSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Error getting session after user update:', sessionError);
          } else if (updatedSession) {
            await validateAndSetUser(updatedSession);
          }
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('🔍 Initial session check:', !!initialSession);
      if (initialSession) {
        validateAndSetUser(initialSession);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error('Error getting initial session:', err);
      setLoading(false);
      setError('Failed to load initial session.');
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  console.log('🔍 AuthProvider render - user:', !!user, 'profile:', !!profile, 'loading:', loading);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, error, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
