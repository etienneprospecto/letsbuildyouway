import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { errorHandler } from './errorHandler';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface AppointmentWithDetails extends Appointment {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    contact: string;
  };
  coach: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface AppointmentFilters {
  coachId?: string;
  clientId?: string;
  status?: Appointment['status'];
  dateFrom?: string;
  dateTo?: string;
  sessionType?: Appointment['session_type'];
}

class AppointmentService {
  /**
   * Créer un nouveau rendez-vous
   */
  async createAppointment(appointment: AppointmentInsert): Promise<Appointment> {
    try {
      // Vérifier les conflits avant la création
      const hasConflict = await this.checkConflicts(
        appointment.coach_id,
        appointment.appointment_date,
        appointment.start_time,
        appointment.end_time
      );

      if (hasConflict) {
        throw new Error('Ce créneau est déjà occupé ou en conflit avec une période bloquée');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;

      // Créer les notifications automatiques
      await this.createNotifications(data.id);

      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création du rendez-vous');
    }
  }

  /**
   * Obtenir les rendez-vous avec filtres
   */
  async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients!inner (
            id,
            first_name,
            last_name,
            photo_url,
            contact
          ),
          coach:profiles!appointments_coach_id_fkey (
            id,
            first_name,
            last_name
          )
        `);

      // Appliquer les filtres
      if (filters.coachId) {
        query = query.eq('coach_id', filters.coachId);
      }

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('appointment_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('appointment_date', filters.dateTo);
      }

      if (filters.sessionType) {
        query = query.eq('session_type', filters.sessionType);
      }

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;
      return data as AppointmentWithDetails[];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des rendez-vous');
    }
  }

  /**
   * Obtenir un rendez-vous par ID
   */
  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients!inner (
            id,
            first_name,
            last_name,
            photo_url,
            contact
          ),
          coach:profiles!appointments_coach_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as AppointmentWithDetails | null;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération du rendez-vous');
    }
  }

  /**
   * Mettre à jour un rendez-vous
   */
  async updateAppointment(id: string, updates: AppointmentUpdate): Promise<Appointment> {
    try {
      // Si on change la date/heure, vérifier les conflits
      if (updates.appointment_date || updates.start_time || updates.end_time) {
        const currentAppointment = await this.getAppointmentById(id);
        if (!currentAppointment) {
          throw new Error('Rendez-vous introuvable');
        }

        const hasConflict = await this.checkConflicts(
          currentAppointment.coach_id,
          updates.appointment_date || currentAppointment.appointment_date,
          updates.start_time || currentAppointment.start_time,
          updates.end_time || currentAppointment.end_time,
          id
        );

        if (hasConflict) {
          throw new Error('Ce nouveau créneau est déjà occupé ou en conflit');
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si le statut change vers annulé, créer une notification
      if (updates.status === 'cancelled') {
        await this.createCancellationNotification(id);
      }

      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la mise à jour du rendez-vous');
    }
  }

  /**
   * Supprimer un rendez-vous
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la suppression du rendez-vous');
    }
  }

  /**
   * Confirmer un rendez-vous
   */
  async confirmAppointment(id: string): Promise<Appointment> {
    return this.updateAppointment(id, { status: 'confirmed' });
  }

  /**
   * Annuler un rendez-vous
   */
  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const updates: AppointmentUpdate = { status: 'cancelled' };
    if (reason) {
      updates.coach_notes = reason;
    }
    return this.updateAppointment(id, updates);
  }

  /**
   * Marquer un rendez-vous comme terminé
   */
  async completeAppointment(id: string, coachNotes?: string): Promise<Appointment> {
    const updates: AppointmentUpdate = { status: 'completed' };
    if (coachNotes) {
      updates.coach_notes = coachNotes;
    }
    return this.updateAppointment(id, updates);
  }

  /**
   * Obtenir les rendez-vous du jour pour un coach
   */
  async getTodayAppointments(coachId: string): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({
      coachId,
      dateFrom: today,
      dateTo: today
    });
  }

  /**
   * Obtenir les prochains rendez-vous pour un client
   */
  async getUpcomingAppointments(clientId: string, limit: number = 5): Promise<AppointmentWithDetails[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients!inner (
            id,
            first_name,
            last_name,
            photo_url,
            contact
          ),
          coach:profiles!appointments_coach_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as AppointmentWithDetails[];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des prochains rendez-vous');
    }
  }

  /**
   * Vérifier les conflits pour un créneau
   */
  private async checkConflicts(
    coachId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_appointment_conflicts', {
          p_coach_id: coachId,
          p_appointment_date: date,
          p_start_time: startTime,
          p_end_time: endTime,
          p_exclude_appointment_id: excludeAppointmentId || null
        });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      return false; // En cas d'erreur, on permet la création (à améliorer)
    }
  }

  /**
   * Créer les notifications automatiques pour un rendez-vous
   */
  private async createNotifications(appointmentId: string): Promise<void> {
    try {
      const appointment = await this.getAppointmentById(appointmentId);
      if (!appointment) return;

      const notifications = [
        {
          appointment_id: appointmentId,
          notification_type: 'booking_confirmation' as const,
          recipient_id: appointment.client.id
        },
        {
          appointment_id: appointmentId,
          notification_type: 'booking_confirmation' as const,
          recipient_id: appointment.coach_id
        }
      ];

      // Ajouter les rappels si activés
      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('reminder_24h_enabled, reminder_2h_enabled')
        .eq('coach_id', appointment.coach_id)
        .single();

      if (settings?.reminder_24h_enabled) {
        notifications.push({
          appointment_id: appointmentId,
          notification_type: 'reminder_24h' as const,
          recipient_id: appointment.client.id
        });
      }

      if (settings?.reminder_2h_enabled) {
        notifications.push({
          appointment_id: appointmentId,
          notification_type: 'reminder_2h' as const,
          recipient_id: appointment.client.id
        });
      }

      const { error } = await supabase
        .from('calendar_notifications')
        .insert(notifications);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création des notifications:', error);
    }
  }

  /**
   * Créer une notification d'annulation
   */
  private async createCancellationNotification(appointmentId: string): Promise<void> {
    try {
      const appointment = await this.getAppointmentById(appointmentId);
      if (!appointment) return;

      const { error } = await supabase
        .from('calendar_notifications')
        .insert([
          {
            appointment_id: appointmentId,
            notification_type: 'cancellation',
            recipient_id: appointment.client.id
          },
          {
            appointment_id: appointmentId,
            notification_type: 'cancellation',
            recipient_id: appointment.coach_id
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création de la notification d\'annulation:', error);
    }
  }

  /**
   * Obtenir les statistiques de rendez-vous pour un coach
   */
  async getAppointmentStats(coachId: string, dateFrom?: string, dateTo?: string) {
    try {
      let query = supabase
        .from('appointments')
        .select('status, session_type, price')
        .eq('coach_id', coachId);

      if (dateFrom) query = query.gte('appointment_date', dateFrom);
      if (dateTo) query = query.lte('appointment_date', dateTo);

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        pending: data.filter(a => a.status === 'pending').length,
        completed: data.filter(a => a.status === 'completed').length,
        cancelled: data.filter(a => a.status === 'cancelled').length,
        revenue: data
          .filter(a => a.status === 'completed' && a.price)
          .reduce((sum, a) => sum + (a.price || 0), 0),
        sessionTypes: {
          individual: data.filter(a => a.session_type === 'individual').length,
          group: data.filter(a => a.session_type === 'group').length,
          video: data.filter(a => a.session_type === 'video').length,
          in_person: data.filter(a => a.session_type === 'in_person').length,
        }
      };

      return stats;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des statistiques');
    }
  }
}

export const appointmentService = new AppointmentService();
