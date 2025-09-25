import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { errorHandler } from './errorHandler';

type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row'];
type CalendarIntegrationInsert = Database['public']['Tables']['calendar_integrations']['Insert'];
type CalendarIntegrationUpdate = Database['public']['Tables']['calendar_integrations']['Update'];
type SyncEvent = Database['public']['Tables']['sync_events']['Row'];
type SyncEventInsert = Database['public']['Tables']['sync_events']['Insert'];
type CalendarSettings = Database['public']['Tables']['calendar_settings']['Row'];
type CalendarSettingsUpdate = Database['public']['Tables']['calendar_settings']['Update'];

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface ExternalEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees?: string[];
  isPrivate?: boolean;
}

export interface CalendarProvider {
  name: 'google' | 'outlook' | 'apple';
  displayName: string;
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
}

class CalendarSyncService {
  private readonly providers: { [key: string]: CalendarProvider } = {
    google: {
      name: 'google',
      displayName: 'Google Calendar',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      apiBaseUrl: 'https://www.googleapis.com/calendar/v3'
    },
    outlook: {
      name: 'outlook',
      displayName: 'Outlook Calendar',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      apiBaseUrl: 'https://graph.microsoft.com/v1.0'
    },
    apple: {
      name: 'apple',
      displayName: 'Apple Calendar',
      authUrl: '', // Apple utilise CalDAV
      tokenUrl: '',
      apiBaseUrl: ''
    }
  };

  /**
   * Obtenir l'URL d'autorisation OAuth
   */
  getAuthorizationUrl(provider: 'google' | 'outlook', config: OAuthConfig): string {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Fournisseur ${provider} non supporté`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline', // Pour Google
      prompt: 'consent' // Pour forcer le refresh token
    });

    return `${providerConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Échanger le code d'autorisation contre un token d'accès
   */
  async exchangeCodeForTokens(
    provider: 'google' | 'outlook',
    code: string,
    config: OAuthConfig
  ): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }> {
    try {
      const providerConfig = this.providers[provider];
      
      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur OAuth: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de l\'échange du code d\'autorisation');
    }
  }

  /**
   * Rafraîchir un token d'accès
   */
  async refreshAccessToken(
    provider: 'google' | 'outlook',
    refreshToken: string,
    config: OAuthConfig
  ): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    try {
      const providerConfig = this.providers[provider];
      
      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du rafraîchissement: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors du rafraîchissement du token');
    }
  }

  /**
   * Créer une intégration calendrier
   */
  async createCalendarIntegration(integration: CalendarIntegrationInsert): Promise<CalendarIntegration> {
    try {
      // Chiffrer les tokens avant stockage (à implémenter côté serveur)
      const encryptedIntegration = {
        ...integration,
        access_token: this.encryptToken(integration.access_token),
        refresh_token: integration.refresh_token ? this.encryptToken(integration.refresh_token) : null
      };

      const { data, error } = await supabase
        .from('calendar_integrations')
        .insert(encryptedIntegration)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création de l\'intégration');
    }
  }

  /**
   * Obtenir les intégrations d'un coach
   */
  async getCoachIntegrations(coachId: string): Promise<CalendarIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des intégrations');
    }
  }

  /**
   * Mettre à jour une intégration
   */
  async updateCalendarIntegration(id: string, updates: CalendarIntegrationUpdate): Promise<CalendarIntegration> {
    try {
      // Chiffrer les nouveaux tokens si présents
      const encryptedUpdates = { ...updates };
      if (updates.access_token) {
        encryptedUpdates.access_token = this.encryptToken(updates.access_token);
      }
      if (updates.refresh_token) {
        encryptedUpdates.refresh_token = this.encryptToken(updates.refresh_token);
      }

      const { data, error } = await supabase
        .from('calendar_integrations')
        .update(encryptedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la mise à jour de l\'intégration');
    }
  }

  /**
   * Supprimer une intégration
   */
  async deleteCalendarIntegration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la suppression de l\'intégration');
    }
  }

  /**
   * Synchroniser les événements depuis un calendrier externe
   */
  async syncFromExternalCalendar(integrationId: string): Promise<SyncEvent[]> {
    try {
      const integration = await this.getIntegrationById(integrationId);
      if (!integration) {
        throw new Error('Intégration introuvable');
      }

      const accessToken = this.decryptToken(integration.access_token);
      const events = await this.fetchExternalEvents(integration.provider, accessToken, integration.calendar_id);

      const syncEvents: SyncEventInsert[] = [];

      for (const event of events) {
        // Vérifier si l'événement existe déjà
        const existingSync = await this.getSyncEventByExternalId(
          integration.coach_id,
          integration.provider,
          event.id
        );

        if (!existingSync) {
          // Créer une période bloquée pour cet événement
          if (!event.isPrivate) {
            await this.createBlockedPeriodFromEvent(integration.coach_id, event);
          }

          syncEvents.push({
            coach_id: integration.coach_id,
            external_event_id: event.id,
            provider: integration.provider,
            sync_direction: 'import',
            sync_status: 'success',
            event_data: event as any
          });
        }
      }

      if (syncEvents.length > 0) {
        const { data, error } = await supabase
          .from('sync_events')
          .insert(syncEvents)
          .select();

        if (error) throw error;

        // Mettre à jour la date de dernière synchronisation
        await this.updateCalendarIntegration(integrationId, {
          last_sync: new Date().toISOString()
        });

        return data;
      }

      return [];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la synchronisation depuis le calendrier externe');
    }
  }

  /**
   * Exporter un rendez-vous vers un calendrier externe
   */
  async exportAppointmentToExternalCalendar(appointmentId: string, integrationId: string): Promise<SyncEvent> {
    try {
      const integration = await this.getIntegrationById(integrationId);
      if (!integration) {
        throw new Error('Intégration introuvable');
      }

      // Récupérer les détails du rendez-vous
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients!inner (first_name, last_name),
          coach:profiles!appointments_coach_id_fkey (first_name, last_name)
        `)
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      const accessToken = this.decryptToken(integration.access_token);
      const settings = await this.getCalendarSettings(integration.coach_id);

      // Créer l'événement externe
      const externalEvent: ExternalEvent = {
        id: '', // Sera défini par l'API externe
        title: settings?.include_client_details 
          ? `${settings.event_prefix}Séance avec ${appointment.client.first_name} ${appointment.client.last_name}`
          : `${settings?.event_prefix || 'BYW - '}Séance de coaching`,
        description: appointment.client_notes || undefined,
        startDateTime: `${appointment.appointment_date}T${appointment.start_time}`,
        endDateTime: `${appointment.appointment_date}T${appointment.end_time}`,
        location: appointment.location || undefined
      };

      const createdEvent = await this.createExternalEvent(
        integration.provider,
        accessToken,
        integration.calendar_id,
        externalEvent
      );

      // Enregistrer la synchronisation
      const { data, error } = await supabase
        .from('sync_events')
        .insert({
          coach_id: integration.coach_id,
          appointment_id: appointmentId,
          external_event_id: createdEvent.id,
          provider: integration.provider,
          sync_direction: 'export',
          sync_status: 'success',
          event_data: createdEvent as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de l\'export vers le calendrier externe');
    }
  }

  /**
   * Obtenir les paramètres de calendrier d'un coach
   */
  async getCalendarSettings(coachId: string): Promise<CalendarSettings | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_settings')
        .select('*')
        .eq('coach_id', coachId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des paramètres');
    }
  }

  /**
   * Mettre à jour les paramètres de calendrier
   */
  async updateCalendarSettings(coachId: string, settings: CalendarSettingsUpdate): Promise<CalendarSettings> {
    try {
      const { data, error } = await supabase
        .from('calendar_settings')
        .update(settings)
        .eq('coach_id', coachId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la mise à jour des paramètres');
    }
  }

  /**
   * Détecter les conflits de calendrier
   */
  async detectCalendarConflicts(coachId: string, dateFrom: string, dateTo: string): Promise<{
    conflicts: Array<{
      appointmentId: string;
      externalEventId: string;
      conflictType: 'overlap' | 'duplicate';
      suggestion: string;
    }>;
  }> {
    try {
      // Cette fonction nécessiterait une logique complexe pour comparer
      // les rendez-vous BYW avec les événements externes synchronisés

      return { conflicts: [] };
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la détection des conflits');
    }
  }

  // Méthodes privées

  private async getIntegrationById(id: string): Promise<CalendarIntegration | null> {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private async getSyncEventByExternalId(
    coachId: string,
    provider: 'google' | 'outlook' | 'apple',
    externalEventId: string
  ): Promise<SyncEvent | null> {
    const { data, error } = await supabase
      .from('sync_events')
      .select('*')
      .eq('coach_id', coachId)
      .eq('provider', provider)
      .eq('external_event_id', externalEventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private async fetchExternalEvents(
    provider: 'google' | 'outlook' | 'apple',
    accessToken: string,
    calendarId: string
  ): Promise<ExternalEvent[]> {
    // Implémentation spécifique à chaque fournisseur
    switch (provider) {
      case 'google':
        return this.fetchGoogleCalendarEvents(accessToken, calendarId);
      case 'outlook':
        return this.fetchOutlookCalendarEvents(accessToken, calendarId);
      default:
        throw new Error(`Fournisseur ${provider} non supporté`);
    }
  }

  private async fetchGoogleCalendarEvents(accessToken: string, calendarId: string): Promise<ExternalEvent[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${new Date().toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API Google: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items.map((item: any) => ({
        id: item.id,
        title: item.summary,
        description: item.description,
        startDateTime: item.start.dateTime || item.start.date,
        endDateTime: item.end.dateTime || item.end.date,
        location: item.location,
        isPrivate: item.visibility === 'private'
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des événements Google: ${error}`);
    }
  }

  private async fetchOutlookCalendarEvents(accessToken: string, calendarId: string): Promise<ExternalEvent[]> {
    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events?$filter=start/dateTime ge '${new Date().toISOString()}'`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API Outlook: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value.map((item: any) => ({
        id: item.id,
        title: item.subject,
        description: item.body?.content,
        startDateTime: item.start.dateTime,
        endDateTime: item.end.dateTime,
        location: item.location?.displayName,
        isPrivate: item.sensitivity === 'private'
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des événements Outlook: ${error}`);
    }
  }

  private async createExternalEvent(
    provider: 'google' | 'outlook' | 'apple',
    accessToken: string,
    calendarId: string,
    event: ExternalEvent
  ): Promise<ExternalEvent> {
    switch (provider) {
      case 'google':
        return this.createGoogleCalendarEvent(accessToken, calendarId, event);
      case 'outlook':
        return this.createOutlookCalendarEvent(accessToken, calendarId, event);
      default:
        throw new Error(`Fournisseur ${provider} non supporté`);
    }
  }

  private async createGoogleCalendarEvent(
    accessToken: string,
    calendarId: string,
    event: ExternalEvent
  ): Promise<ExternalEvent> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: { dateTime: event.startDateTime },
          end: { dateTime: event.endDateTime },
          location: event.location
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur création événement Google: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...event, id: data.id };
  }

  private async createOutlookCalendarEvent(
    accessToken: string,
    calendarId: string,
    event: ExternalEvent
  ): Promise<ExternalEvent> {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: event.title,
          body: { content: event.description },
          start: { dateTime: event.startDateTime },
          end: { dateTime: event.endDateTime },
          location: { displayName: event.location }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur création événement Outlook: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...event, id: data.id };
  }

  private async createBlockedPeriodFromEvent(coachId: string, event: ExternalEvent): Promise<void> {
    try {
      const startDate = event.startDateTime.split('T')[0];
      const endDate = event.endDateTime.split('T')[0];
      const startTime = event.startDateTime.split('T')[1]?.substring(0, 5);
      const endTime = event.endDateTime.split('T')[1]?.substring(0, 5);

      await supabase
        .from('blocked_periods')
        .insert({
          coach_id: coachId,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime || null,
          end_time: endTime || null,
          reason: `Événement externe: ${event.title}`,
          is_all_day: !startTime || !endTime
        });
    } catch (error) {

    }
  }

  private encryptToken(token: string): string {

    // Pour l'instant, retourner le token tel quel (non sécurisé)
    return token;
  }

  private decryptToken(encryptedToken: string): string {

    // Pour l'instant, retourner le token tel quel
    return encryptedToken;
  }
}

export const calendarSyncService = new CalendarSyncService();
