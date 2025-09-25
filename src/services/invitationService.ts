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
   * Créer une invitation pour un nouveau client
   */
  async createInvitation(data: CreateInvitationData): Promise<InvitationData> {
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
      // Stocker les données client pour la création du profil
      client_data: {
        phone: data.client_phone,
        date_of_birth: data.client_date_of_birth,
        gender: data.client_gender,
        height_cm: data.client_height_cm,
        weight_kg: data.client_weight_kg,
        primary_goal: data.client_primary_goal,
        fitness_level: data.client_fitness_level,
        notes: data.client_notes,
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

    // Envoyer l'email d'invitation
    await this.sendInvitationEmail(invitation);

    return invitation;
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

      // Créer la fiche client avec des valeurs par défaut pour les champs obligatoires
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          id: authData.user.id,
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
   * Envoyer l'email d'invitation
   */
  private async sendInvitationEmail(invitation: InvitationData): Promise<void> {
    const invitationUrl = `${window.location.origin}/?token=${invitation.token}`;

    // Pour l'instant, on simule l'envoi d'email pour éviter les problèmes

    console.log('📧 Email d\'invitation simulé (Edge Function temporairement désactivée):');

    // Code commenté pour l'Edge Function (à réactiver plus tard)
    /*
    try {
      // Récupérer le nom du coach
      const { data: coach, error: coachError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', invitation.coach_id)
        .single();

      if (coachError) {

      }

      const coachName = coach ? `${coach.first_name} ${coach.last_name}` : 'Votre coach';

      // Appeler l'Edge Function pour envoyer l'email avec timeout

      const functionPromise = supabase.functions.invoke('send-invitation-email', {
        body: {
          client_email: invitation.client_email,
          client_name: `${invitation.client_first_name} ${invitation.client_last_name}`,
          invitation_url: invitationUrl,
          coach_name: coachName
        }
      });

      // Timeout de 10 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Edge Function took too long')), 10000)
      );

      const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as any;

      if (error) {

        // Ne pas faire échouer la création de l'invitation si l'email échoue
        console.log('📧 Email d\'invitation simulé (service indisponible):');

      } else {

      }
    } catch (error) {

      // Fallback : afficher l'URL dans la console
      console.log('📧 Email d\'invitation simulé (erreur de service):');

    }
    */
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
