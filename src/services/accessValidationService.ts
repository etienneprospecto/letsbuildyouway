import { supabase } from '../lib/supabase';

export interface AccessValidationResult {
  hasAccess: boolean;
  role: 'coach' | 'client' | null;
  clientId?: string;
  coachId?: string;
  error?: string;
}

export class AccessValidationService {
  /**
   * Valide l'accès d'un utilisateur en vérifiant son email
   * Seuls les emails autorisés par un coach peuvent se connecter
   */
  static async validateUserAccess(email: string): Promise<AccessValidationResult> {
    try {

      const normalizedEmail = email.trim().toLowerCase();

      // OPTIMISATION: Vérifier d'abord la whitelist (plus rapide)
      const allowedCoachEmails = ['etienne.guimbard@gmail.com'];
      if (allowedCoachEmails.includes(normalizedEmail)) {
        console.log('Coach access granted (by whitelist) for:', email);
        return {
          hasAccess: true,
          role: 'coach',
          coachId: undefined, // Sera récupéré plus tard si nécessaire
        };
      }

      // OPTIMISATION: Récupérer l'utilisateur courant une seule fois
      const { data: userRes } = await supabase.auth.getUser();
      const currentUser = userRes?.user || null;

      // Vérifier les métadonnées auth

      const isSameUser = currentUser?.email?.toLowerCase() === normalizedEmail;
      const metaRole = (currentUser?.user_metadata as any)?.role as string | undefined;

      if (isSameUser && metaRole === 'coach') {
        console.log('Coach access granted (by auth metadata) for:', email);
        return {
          hasAccess: true,
          role: 'coach',
          coachId: currentUser!.id
        };
      }

      // 1.ter Fallback: vérifier la table profiles par email (désynchronisation possible avec auth)
      const { data: coachProfile, error: coachError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', normalizedEmail)
        .eq('role', 'coach')
        .maybeSingle();

      if (!coachError && coachProfile) {
        console.log('Coach access granted (by profiles) for:', email);
        return {
          hasAccess: true,
          role: 'coach',
          coachId: coachProfile.id,
        };
      }

      // 2. Vérifier si c'est un client autorisé (dans clients)

      const { data: clientRecord, error: clientError } = await supabase
        .from('clients')
        .select('id, coach_id, first_name, last_name, status')
        .eq('contact', normalizedEmail)
        .eq('status', 'active')
        .maybeSingle();

      if (clientError) {

        return { hasAccess: false, role: null, error: 'Erreur de validation' };
      }

      if (clientRecord) {

        // C'est un client autorisé par un coach, accès autorisé
        return {
          hasAccess: true,
          role: 'client',
          clientId: clientRecord.id,
          coachId: clientRecord.coach_id
        };
      }

      // 3. Aucun accès trouvé - l'email n'a pas été autorisé par un coach

      return {
        hasAccess: false,
        role: null,
        error: 'Accès non autorisé. Votre email doit être ajouté par un coach via la page "Clients".'
      };

    } catch (error) {

      return {
        hasAccess: false,
        role: null,
        error: 'Erreur lors de la validation de l\'accès'
      };
    }
  }

  /**
   * Vérifie si un utilisateur peut se connecter après authentification
   */
  static async canUserConnect(userId: string): Promise<AccessValidationResult> {
    try {
      // Récupérer l'email de l'utilisateur authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { hasAccess: false, role: null, error: 'Utilisateur non trouvé' };
      }

      // Valider l'accès avec l'email
      return await this.validateUserAccess(user.email!);

    } catch (error) {

      return {
        hasAccess: false,
        role: null,
        error: 'Erreur lors de la vérification de l\'accès'
      };
    }
  }
}
