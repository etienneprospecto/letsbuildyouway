import { supabase } from '../lib/supabase';

export interface InvitationData {
  id: string;
  coach_id: string;
  client_email: string;
  client_first_name: string;
  client_last_name: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export interface CreateInvitationData {
  coach_id: string;
  client_email: string;
  client_first_name: string;
  client_last_name: string;
  client_phone?: string;
  client_date_of_birth?: string;
  client_gender?: string;
  client_height_cm?: number;
  client_weight_kg?: number;
  client_age?: number;
  client_primary_goal?: string;
  client_fitness_level?: string;
  client_medical_conditions?: string;
  client_dietary_restrictions?: string;
}

class InvitationService {
  /**
   * Créer une invitation pour un nouveau client (version simplifiée)
   */
  async createInvitation(data: CreateInvitationData): Promise<InvitationData> {
    console.log('🚀 Création invitation simplifiée...');
    
    try {
      // Générer un token unique
      const token = this.generateInvitationToken();
      
      // Date d'expiration (7 jours)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const invitationData = {
        coach_id: data.coach_id,
        client_email: data.client_email,
        client_first_name: data.client_first_name,
        client_last_name: data.client_last_name,
        token,
        status: 'pending' as const,
        expires_at: expiresAt.toISOString(),
        client_data: {
          phone: data.client_phone,
          date_of_birth: data.client_date_of_birth,
          gender: data.client_gender,
          height_cm: data.client_height_cm,
          weight_kg: data.client_weight_kg,
          primary_goal: data.client_primary_goal,
          fitness_level: data.client_fitness_level,
          medical_conditions: data.client_medical_conditions,
          dietary_restrictions: data.client_dietary_restrictions,
        }
      };

      const { data: invitation, error } = await supabase
        .from('client_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création de l'invitation: ${error.message}`);
      }

      console.log('✅ Invitation créée:', invitation);

      // Envoyer l'email via Resend (approche directe)
      await this.sendEmailDirect(invitation);

      return invitation;

    } catch (error) {
      console.error('❌ Erreur création invitation:', error);
      throw error;
    }
  }

  /**
   * Valider un token d'invitation
   */
  async validateInvitation(token: string): Promise<InvitationData | null> {
    const { data: invitation, error } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return null;
    }

    // Vérifier si l'invitation n'est pas expirée
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (now > expiresAt) {
      // Marquer comme expirée
      await supabase
        .from('client_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      
      return null;
    }

    return invitation;
  }

  /**
   * Accepter une invitation et créer le compte client
   */
  async acceptInvitation(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const invitation = await this.validateInvitation(token);
    
    if (!invitation) {
      return { success: false, message: 'Invitation invalide ou expirée' };
    }

    try {
      // Déconnecter l'utilisateur actuel s'il est connecté
      await supabase.auth.signOut();

      // Valider l'email avant de créer le compte
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitation.client_email)) {
        throw new Error('Format d\'email invalide');
      }

      // Créer le compte utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.client_email,
        password,
        options: {
          data: {
            first_name: invitation.client_first_name,
            last_name: invitation.client_last_name,
            role: 'client'
          }
        }
      });

      if (authError) {

        throw new Error(`Erreur lors de la création du compte: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      // Attendre que le trigger crée le profil
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que le profil a été créé par le trigger
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {

        // Si le profil n'existe pas, le créer manuellement
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: invitation.client_email,
            first_name: invitation.client_first_name,
            last_name: invitation.client_last_name,
            role: 'client'
          });

        if (createProfileError) {

          throw new Error(`Erreur lors de la création du profil: ${createProfileError.message}`);
        }
      } else {

      }

      // Créer la fiche client avec user_id pour l'isolation (CORRECTION CRITIQUE)
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authData.user.id, // ✅ Lier au compte auth.users pour l'isolation
          coach_id: invitation.coach_id,
          first_name: invitation.client_first_name,
          last_name: invitation.client_last_name,
          contact: invitation.client_email,
          // Champs obligatoires avec valeurs par défaut
          age: Math.max(16, Math.min(100, invitation.client_data?.age || 25)), // Valeur par défaut avec contraintes
          level: invitation.client_data?.fitness_level === 'beginner' ? 'Débutant' : 
                 invitation.client_data?.fitness_level === 'intermediate' ? 'Intermédiaire' :
                 invitation.client_data?.fitness_level === 'advanced' ? 'Avancé' : 'Débutant', // Mapping correct
          objective: invitation.client_data?.primary_goal || 'Forme générale', // Valeur par défaut
          mentality: 'Motivé', // Valeur par défaut
          coaching_type: 'Personnel', // Valeur par défaut
          sports_history: 'Aucun', // Valeur par défaut
          start_date: new Date().toISOString().split('T')[0], // Date actuelle
          // Champs optionnels (seulement ceux qui existent dans la table)
          phone: invitation.client_data?.phone,
          date_of_birth: invitation.client_data?.date_of_birth,
          gender: invitation.client_data?.gender,
          height_cm: invitation.client_data?.height_cm,
          weight_kg: invitation.client_data?.weight_kg,
          primary_goal: invitation.client_data?.primary_goal,
          fitness_level: invitation.client_data?.fitness_level,
          medical_conditions: invitation.client_data?.medical_conditions,
          dietary_restrictions: invitation.client_data?.dietary_restrictions,
        });

      if (clientError) {

        throw new Error(`Erreur lors de la création de la fiche client: ${clientError.message}`);
      }

      // Marquer l'invitation comme acceptée
      await supabase
        .from('client_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      return { success: true, message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' };

    } catch (error) {

      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la création du compte' 
      };
    }
  }

  /**
   * Envoyer l'email via Edge Function Resend
   */
  private async sendEmailDirect(invitation: InvitationData): Promise<void> {
    const invitationUrl = `${window.location.origin}/accept-invitation?token=${invitation.token}`;
    
    console.log('📧 Envoi email via Edge Function...');
    console.log('📧 Client:', invitation.client_email);
    console.log('🔗 URL:', invitationUrl);

    try {
      // Récupérer le nom du coach
      const { data: coach } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', invitation.coach_id)
        .single();

      const coachName = coach ? `${coach.first_name} ${coach.last_name}` : 'Votre coach';

      // Appel Edge Function Supabase Auth
      const { data, error } = await supabase.functions.invoke('send-auth-invitation', {
        body: {
          email: invitation.client_email,
          firstName: invitation.client_first_name,
          lastName: invitation.client_last_name,
          coachId: invitation.coach_id,
          clientData: invitation.client_data
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(`Erreur envoi email: ${error.message}`);
      }

      console.log('✅ Email envoyé via Edge Function:', data);
      
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      // Ne pas faire échouer l'invitation si l'email échoue
      console.log('💡 URL d\'invitation manuelle:', invitationUrl);
    }
  }

  /**
   * Logger les erreurs d'email pour debugging
   */
  private async logEmailError(invitation: InvitationData, error: any): Promise<void> {
    try {
      const { error: logError } = await supabase
        .from('email_error_logs')
        .insert({
          invitation_id: invitation.id,
          client_email: invitation.client_email,
          error_type: error.name || 'Unknown',
          error_message: error.message || 'Unknown error',
          error_details: JSON.stringify(error),
          timestamp: new Date().toISOString()
        });

      if (logError) {
        console.error('❌ Erreur lors du logging:', logError);
      }
    } catch (logError) {
      console.error('❌ Erreur critique lors du logging:', logError);
    }
  }

  /**
   * Générer un token d'invitation unique
   */
  private generateInvitationToken(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `inv_${timestamp}_${randomPart}`;
  }
}

export default new InvitationService();
