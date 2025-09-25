import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { errorHandler } from './errorHandler';

type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row'];
type CalendarIntegrationInsert = Database['public']['Tables']['calendar_integrations']['Insert'];
type CalendarIntegrationUpdate = Database['public']['Tables']['calendar_integrations']['Update'];

export interface ExternalEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  description?: string;
  location?: string;
  attendees?: string[];
}

export interface CalendarSyncResult {
  success: boolean;
  eventsImported: number;
  conflictsDetected: number;
  errors: string[];
}

export interface GoogleCalendarConfig {
  apiKey: string;
  calendarId: string;
}

export interface OutlookCalendarConfig {
  apiKey: string; // ou access token
  calendarId: string;
}

export interface AppleCalendarConfig {
  username: string;
  password: string; // App-specific password
  serverUrl: string;
  calendarId: string;
}

class ExternalCalendarService {
  // ===============================
  // GESTION DES INTÉGRATIONS
  // ===============================

  async getIntegrations(coachId: string): Promise<CalendarIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la récupération des intégrations');
      return [];
    }
  }

  async createIntegration(integration: CalendarIntegrationInsert): Promise<CalendarIntegration | null> {
    try {
      // Valider les paramètres selon le provider
      const isValid = await this.validateIntegrationConfig(
        integration.provider, 
        integration.access_token || '', 
        integration.api_key || '', 
        integration.calendar_id
      );

      if (!isValid) {
        throw new Error('Configuration d\'intégration invalide');
      }

      const { data, error } = await supabase
        .from('calendar_integrations')
        .insert({
          ...integration,
          sync_settings: integration.sync_settings || {
            syncFrequency: 15, // minutes
            autoImport: true,
            autoExport: true,
            conflictResolution: 'manual'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Effectuer une synchronisation initiale
      if (data) {
        await this.syncCalendar(data.id);
      }

      return data;
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la création de l\'intégration');
      return null;
    }
  }

  async updateIntegration(id: string, updates: CalendarIntegrationUpdate): Promise<CalendarIntegration | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la mise à jour de l\'intégration');
      return null;
    }
  }

  async deleteIntegration(id: string): Promise<boolean> {
    try {
      // Supprimer d'abord les événements synchronisés
      await supabase
        .from('sync_events')
        .delete()
        .eq('integration_id', id);

      // Puis supprimer l'intégration
      const { error } = await supabase
        .from('calendar_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la suppression de l\'intégration');
      return false;
    }
  }

  async testConnection(integration: CalendarIntegration): Promise<boolean> {
    try {
      switch (integration.provider) {
        case 'google':
          return await this.testGoogleConnection(integration);
        case 'outlook':
          return await this.testOutlookConnection(integration);
        case 'apple':
          return await this.testAppleConnection(integration);
        default:
          return false;
      }
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors du test de connexion');
      return false;
    }
  }

  // ===============================
  // SYNCHRONISATION
  // ===============================

  async syncCalendar(integrationId: string): Promise<CalendarSyncResult> {
    try {
      const { data: integration } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (!integration) {
        throw new Error('Intégration non trouvée');
      }

      let result: CalendarSyncResult = {
        success: false,
        eventsImported: 0,
        conflictsDetected: 0,
        errors: []
      };

      // Synchroniser selon le provider
      switch (integration.provider) {
        case 'google':
          result = await this.syncGoogleCalendar(integration);
          break;
        case 'outlook':
          result = await this.syncOutlookCalendar(integration);
          break;
        case 'apple':
          result = await this.syncAppleCalendar(integration);
          break;
        default:
          result.errors.push(`Provider ${integration.provider} non supporté`);
      }

      // Mettre à jour les métadonnées de synchronisation
      await supabase
        .from('calendar_integrations')
        .update({
          last_sync: new Date().toISOString(),
          last_error: result.errors.length > 0 ? result.errors.join('; ') : null
        })
        .eq('id', integrationId);

      return result;
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la synchronisation');
      return {
        success: false,
        eventsImported: 0,
        conflictsDetected: 0,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      };
    }
  }

  async syncAllActiveIntegrations(coachId: string): Promise<CalendarSyncResult[]> {
    try {
      const integrations = await this.getIntegrations(coachId);
      const activeIntegrations = integrations.filter(i => i.is_active);

      const results = await Promise.all(
        activeIntegrations.map(integration => this.syncCalendar(integration.id))
      );

      return results;
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la synchronisation globale');
      return [];
    }
  }

  // ===============================
  // DÉTECTION DE CONFLITS
  // ===============================

  async detectConflicts(coachId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      const { data, error } = await supabase.rpc('get_calendar_conflicts_simple', {
        p_coach_id: coachId,
        p_start_date: start.toISOString().split('T')[0],
        p_end_date: end.toISOString().split('T')[0]
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la détection des conflits');
      return [];
    }
  }

  // ===============================
  // MÉTHODES PRIVÉES - GOOGLE CALENDAR
  // ===============================

  private async validateIntegrationConfig(
    provider: string, 
    accessToken: string, 
    apiKey: string, 
    calendarId: string
  ): Promise<boolean> {
    // Validation basique des paramètres requis
    switch (provider) {
      case 'google':
        return (!!accessToken || !!apiKey) && !!calendarId;
      case 'outlook':
        return (!!accessToken || !!apiKey) && !!calendarId;
      case 'apple':
        return (!!accessToken || !!apiKey) && !!calendarId;
      default:
        return false;
    }
  }

  private async testGoogleConnection(integration: CalendarIntegration): Promise<boolean> {
    try {
      if (!integration.api_key && !integration.access_token) {
        return false;
      }

      // Test avec Google Calendar API
      const url = `https://www.googleapis.com/calendar/v3/calendars/${integration.calendar_id}`;
      const headers: HeadersInit = {};
      
      if (integration.api_key) {
        headers['Authorization'] = `Bearer ${integration.api_key}`;
      } else if (integration.access_token) {
        headers['Authorization'] = `Bearer ${integration.access_token}`;
      }

      const response = await fetch(`${url}?key=${integration.api_key || ''}`, {
        headers
      });

      return response.ok;
    } catch (error) {

      return false;
    }
  }

  private async testOutlookConnection(integration: CalendarIntegration): Promise<boolean> {
    try {
      if (!integration.access_token && !integration.api_key) {
        return false;
      }

      // Test avec Microsoft Graph API
      const url = `https://graph.microsoft.com/v1.0/me/calendars/${integration.calendar_id}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${integration.access_token || integration.api_key}`
        }
      });

      return response.ok;
    } catch (error) {

      return false;
    }
  }

  private async testAppleConnection(integration: CalendarIntegration): Promise<boolean> {
    try {
      // Pour Apple Calendar, on utilise généralement CalDAV
      // Test basique de connectivité
      return !!(integration.api_key && integration.calendar_id);
    } catch (error) {

      return false;
    }
  }

  private async syncGoogleCalendar(integration: CalendarIntegration): Promise<CalendarSyncResult> {
    const result: CalendarSyncResult = {
      success: false,
      eventsImported: 0,
      conflictsDetected: 0,
      errors: []
    };

    try {
      if (!integration.api_key && !integration.access_token) {
        result.errors.push('Clé API ou token d\'accès manquant');
        return result;
      }

      // Récupérer les événements des 30 prochains jours
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${integration.calendar_id}/events`);
      url.searchParams.set('timeMin', timeMin);
      url.searchParams.set('timeMax', timeMax);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      
      if (integration.api_key) {
        url.searchParams.set('key', integration.api_key);
      }

      const headers: HeadersInit = {};
      if (integration.access_token) {
        headers['Authorization'] = `Bearer ${integration.access_token}`;
      }

      const response = await fetch(url.toString(), { headers });
      
      if (!response.ok) {
        result.errors.push(`Erreur API Google: ${response.status}`);
        return result;
      }

      const data = await response.json();
      const events = data.items || [];

      // Importer les événements
      for (const event of events) {
        if (event.start?.dateTime && event.end?.dateTime) {
          await this.importExternalEvent(integration, {
            id: event.id,
            title: event.summary || 'Événement sans titre',
            start: event.start.dateTime,
            end: event.end.dateTime,
            description: event.description,
            location: event.location
          });
          result.eventsImported++;
        }
      }

      result.success = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur Google Calendar');
    }

    return result;
  }

  private async syncOutlookCalendar(integration: CalendarIntegration): Promise<CalendarSyncResult> {
    const result: CalendarSyncResult = {
      success: false,
      eventsImported: 0,
      conflictsDetected: 0,
      errors: []
    };

    try {
      if (!integration.access_token && !integration.api_key) {
        result.errors.push('Token d\'accès manquant');
        return result;
      }

      // Microsoft Graph API
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const url = `https://graph.microsoft.com/v1.0/me/calendars/${integration.calendar_id}/events?$filter=start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'&$orderby=start/dateTime`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${integration.access_token || integration.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        result.errors.push(`Erreur API Outlook: ${response.status}`);
        return result;
      }

      const data = await response.json();
      const events = data.value || [];

      // Importer les événements
      for (const event of events) {
        if (event.start?.dateTime && event.end?.dateTime) {
          await this.importExternalEvent(integration, {
            id: event.id,
            title: event.subject || 'Événement sans titre',
            start: event.start.dateTime,
            end: event.end.dateTime,
            description: event.bodyPreview,
            location: event.location?.displayName
          });
          result.eventsImported++;
        }
      }

      result.success = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur Outlook Calendar');
    }

    return result;
  }

  private async syncAppleCalendar(integration: CalendarIntegration): Promise<CalendarSyncResult> {
    const result: CalendarSyncResult = {
      success: false,
      eventsImported: 0,
      conflictsDetected: 0,
      errors: []
    };

    try {
      // Apple Calendar via CalDAV nécessiterait une implémentation plus complexe
      // Pour l'instant, on simule une synchronisation basique
      result.errors.push('Synchronisation Apple Calendar non encore implémentée');
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erreur Apple Calendar');
    }

    return result;
  }

  private async importExternalEvent(integration: CalendarIntegration, event: ExternalEvent): Promise<void> {
    try {
      // Vérifier si l'événement existe déjà
      const { data: existing } = await supabase
        .from('sync_events')
        .select('id')
        .eq('integration_id', integration.id)
        .eq('external_event_id', event.id)
        .single();

      const eventData = {
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description,
        location: event.location,
        attendees: event.attendees
      };

      if (existing) {
        // Mettre à jour l'événement existant
        await supabase
          .from('sync_events')
          .update({
            event_data: eventData,
            last_synced: new Date().toISOString(),
            sync_status: 'success'
          })
          .eq('id', existing.id);
      } else {
        // Créer un nouvel événement synchronisé
        await supabase
          .from('sync_events')
          .insert({
            coach_id: integration.coach_id,
            integration_id: integration.id,
            external_event_id: event.id,
            provider: integration.provider,
            sync_direction: 'import',
            event_data: eventData,
            sync_status: 'success'
          });
      }
    } catch (error) {

      throw error;
    }
  }
}

export const externalCalendarService = new ExternalCalendarService();
