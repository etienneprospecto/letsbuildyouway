import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { AccessValidationService } from './accessValidationService';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface OptimizedAuthData {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
}

export class OptimizedAuthService {
  /**
   * Récupère toutes les données d'authentification en une seule requête optimisée
   * Remplace les multiples fetchProfile + createProfile
   */
  static async getAuthData(userId: string): Promise<OptimizedAuthData> {
    try {
      // 1. Récupérer la session actuelle
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return { user: null, profile: null, session: null };
      }

      // 2. Valider l'accès utilisateur avec le service existant
      const accessValidation = await AccessValidationService.validateUserAccess(session.user.email!);
      
      if (!accessValidation.hasAccess) {
        throw new Error(accessValidation.error || 'Accès non autorisé');
      }

      // 3. Requête optimisée avec jointure pour récupérer le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Erreur lors de la récupération du profil: ${profileError.message}`);
      }

      // 4. Si pas de profil, créer un nouveau profil avec le bon rôle
      if (!profileData) {
        const newProfile = await this.createOptimizedProfile(session.user, accessValidation.role);
        return {
          user: session.user,
          profile: newProfile,
          session: session
        };
      }

      return {
        user: session.user,
        profile: profileData,
        session: session
      };

    } catch (error) {
      console.error('Erreur OptimizedAuthService.getAuthData:', error);
      throw error;
    }
  }

  /**
   * Crée un profil optimisé avec validation
   * Remplace la logique de création dans AuthProvider
   */
  static async createOptimizedProfile(user: User, role: 'coach' | 'client' | null = null): Promise<Profile | null> {
    try {
      const email = user.email?.toLowerCase() || '';
      
      // Utiliser le rôle déterminé par la validation d'accès
      const userRole = role || 'client'; // Par défaut client si pas de rôle spécifié

      const newProfileData = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || 'User',
        last_name: user.user_metadata?.last_name || 'Name',
        role: userRole,
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfileData, { onConflict: 'id' })
        .select()
        .single();

      if (createError) {
        throw new Error(`Erreur lors de la création du profil: ${createError.message}`);
      }

      return createdProfile;

    } catch (error) {
      console.error('Erreur OptimizedAuthService.createOptimizedProfile:', error);
      return null;
    }
  }

  /**
   * Valide l'accès utilisateur avec une requête optimisée
   * Utilise le service AccessValidationService existant
   */
  static async validateUserAccessOptimized(email: string): Promise<{
    hasAccess: boolean;
    role: 'coach' | 'client' | null;
    clientId?: string;
    coachId?: string;
    error?: string;
  }> {
    try {
      // Utiliser le service de validation d'accès existant
      const result = await AccessValidationService.validateUserAccess(email);
      
      return {
        hasAccess: result.hasAccess,
        role: result.role,
        clientId: result.clientId,
        coachId: result.coachId,
        error: result.error
      };

    } catch (error) {
      console.error('Erreur OptimizedAuthService.validateUserAccessOptimized:', error);
      return {
        hasAccess: false,
        role: null,
        error: 'Erreur lors de la validation de l\'accès'
      };
    }
  }
}
