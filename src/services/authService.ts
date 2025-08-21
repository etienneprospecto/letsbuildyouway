import { supabase } from '../lib/supabase';
import { AccessValidationService, AccessValidationResult } from './accessValidationService';

export const authService = {
  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: 'coach' | 'client';
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role
        }
      }
    });

    if (error) throw error;
    
    // Créer manuellement le profil si l'inscription réussit
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email!,
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role
            },
            { onConflict: 'id' }
          );
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // On continue même si le profil n'est pas créé
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // On continue même si le profil n'est pas créé
      }
    }
    
    return data;
  },

  async signIn(email: string, password: string): Promise<{ data: any; accessValidation: AccessValidationResult }> {
    // 1. Authentification Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // 2. Validation de l'accès - seuls les emails autorisés par un coach peuvent se connecter
    const accessValidation = await AccessValidationService.validateUserAccess(email);
    
    if (!accessValidation.hasAccess) {
      // Déconnecter l'utilisateur si pas d'accès
      await supabase.auth.signOut();
      throw new Error(accessValidation.error || 'Accès non autorisé');
    }

    return { data, accessValidation };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
  }
};