import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { executeQuery, loading, error };
};