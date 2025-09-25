import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { errorHandler } from './errorHandler';

type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];
type AvailabilitySlotInsert = Database['public']['Tables']['availability_slots']['Insert'];
type AvailabilitySlotUpdate = Database['public']['Tables']['availability_slots']['Update'];
type BlockedPeriod = Database['public']['Tables']['blocked_periods']['Row'];
type BlockedPeriodInsert = Database['public']['Tables']['blocked_periods']['Insert'];

export interface AvailableSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  session_type: 'individual' | 'group' | 'video' | 'in_person';
  duration_minutes: number;
  max_clients: number;
  price: number | null;
  available_spots: number;
}

export interface WeeklySchedule {
  [key: number]: AvailabilitySlot[]; // 0-6 pour dimanche-samedi
}

class AvailabilityService {
  /**
   * Créer un créneau de disponibilité
   */
  async createAvailabilitySlot(slot: AvailabilitySlotInsert): Promise<AvailabilitySlot> {
    try {
      // Valider les horaires
      if (slot.start_time >= slot.end_time) {
        throw new Error('L\'heure de fin doit être après l\'heure de début');
      }

      const { data, error } = await supabase
        .from('availability_slots')
        .insert(slot)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création du créneau');
    }
  }

  /**
   * Obtenir tous les créneaux d'un coach
   */
  async getCoachAvailability(coachId: string): Promise<WeeklySchedule> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;

      // Organiser par jour de la semaine
      const schedule: WeeklySchedule = {};
      for (let i = 0; i <= 6; i++) {
        schedule[i] = [];
      }

      data.forEach(slot => {
        schedule[slot.day_of_week].push(slot);
      });

      return schedule;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des créneaux');
    }
  }

  /**
   * Obtenir les créneaux disponibles pour une date donnée
   */
  async getAvailableSlotsForDate(
    coachId: string,
    date: string,
    sessionType?: AvailabilitySlot['session_type']
  ): Promise<AvailableSlot[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_coach_id: coachId,
          p_date: date,
          p_session_type: sessionType || null
        });

      if (error) throw error;
      return data as AvailableSlot[];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des créneaux disponibles');
    }
  }

  /**
   * Mettre à jour un créneau de disponibilité
   */
  async updateAvailabilitySlot(id: string, updates: AvailabilitySlotUpdate): Promise<AvailabilitySlot> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la mise à jour du créneau');
    }
  }

  /**
   * Supprimer un créneau de disponibilité
   */
  async deleteAvailabilitySlot(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la suppression du créneau');
    }
  }

  /**
   * Désactiver/réactiver un créneau
   */
  async toggleAvailabilitySlot(id: string, isActive: boolean): Promise<AvailabilitySlot> {
    return this.updateAvailabilitySlot(id, { is_active: isActive });
  }

  /**
   * Créer des créneaux récurrents
   */
  async createRecurringSlots(
    coachId: string,
    daysOfWeek: number[],
    startTime: string,
    endTime: string,
    sessionType: AvailabilitySlot['session_type'],
    durationMinutes: number,
    maxClients: number = 1,
    price?: number
  ): Promise<AvailabilitySlot[]> {
    try {
      const slots: AvailabilitySlotInsert[] = daysOfWeek.map(day => ({
        coach_id: coachId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        session_type: sessionType,
        duration_minutes: durationMinutes,
        max_clients: maxClients,
        price: price || null
      }));

      const { data, error } = await supabase
        .from('availability_slots')
        .insert(slots)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création des créneaux récurrents');
    }
  }

  /**
   * Créer une période bloquée
   */
  async createBlockedPeriod(blockedPeriod: BlockedPeriodInsert): Promise<BlockedPeriod> {
    try {
      // Valider les dates
      if (blockedPeriod.start_date > blockedPeriod.end_date) {
        throw new Error('La date de fin doit être après la date de début');
      }

      if (!blockedPeriod.is_all_day && 
          (!blockedPeriod.start_time || !blockedPeriod.end_time || 
           blockedPeriod.start_time >= blockedPeriod.end_time)) {
        throw new Error('Les heures de début et fin sont requises et l\'heure de fin doit être après l\'heure de début');
      }

      const { data, error } = await supabase
        .from('blocked_periods')
        .insert(blockedPeriod)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création de la période bloquée');
    }
  }

  /**
   * Obtenir les périodes bloquées d'un coach
   */
  async getBlockedPeriods(coachId: string, dateFrom?: string, dateTo?: string): Promise<BlockedPeriod[]> {
    try {
      let query = supabase
        .from('blocked_periods')
        .select('*')
        .eq('coach_id', coachId);

      if (dateFrom) {
        query = query.gte('end_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('start_date', dateTo);
      }

      const { data, error } = await query.order('start_date');

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des périodes bloquées');
    }
  }

  /**
   * Supprimer une période bloquée
   */
  async deleteBlockedPeriod(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_periods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la suppression de la période bloquée');
    }
  }

  /**
   * Créer un modèle de planning standard
   */
  async createStandardSchedule(
    coachId: string,
    template: 'morning' | 'afternoon' | 'evening' | 'full_day'
  ): Promise<AvailabilitySlot[]> {
    const templates = {
      morning: [
        { start: '08:00', end: '09:00' },
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' }
      ],
      afternoon: [
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' }
      ],
      evening: [
        { start: '18:00', end: '19:00' },
        { start: '19:00', end: '20:00' },
        { start: '20:00', end: '21:00' }
      ],
      full_day: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' }
      ]
    };

    const timeSlots = templates[template];
    const weekdays = [1, 2, 3, 4, 5]; // Lundi à vendredi

    const slots: AvailabilitySlotInsert[] = [];

    weekdays.forEach(day => {
      timeSlots.forEach(slot => {
        slots.push({
          coach_id: coachId,
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end,
          session_type: 'individual',
          duration_minutes: 60,
          max_clients: 1,
          price: 80.00
        });
      });
    });

    const { data, error } = await supabase
      .from('availability_slots')
      .insert(slots)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Obtenir les créneaux les plus demandés
   */
  async getPopularTimeSlots(coachId: string, days: number = 30): Promise<any[]> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, end_time, session_type')
        .eq('coach_id', coachId)
        .eq('status', 'completed')
        .gte('appointment_date', dateFrom.toISOString().split('T')[0]);

      if (error) throw error;

      // Analyser les créneaux populaires
      const timeSlotCounts: { [key: string]: number } = {};

      data.forEach(appointment => {
        const key = `${appointment.start_time}-${appointment.end_time}`;
        timeSlotCounts[key] = (timeSlotCounts[key] || 0) + 1;
      });

      return Object.entries(timeSlotCounts)
        .map(([timeSlot, count]) => {
          const [startTime, endTime] = timeSlot.split('-');
          return { startTime, endTime, bookingCount: count };
        })
        .sort((a, b) => b.bookingCount - a.bookingCount);
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de l\'analyse des créneaux populaires');
    }
  }

  /**
   * Calculer le taux d'occupation
   */
  async getOccupancyRate(coachId: string, dateFrom: string, dateTo: string): Promise<{
    totalSlots: number;
    bookedSlots: number;
    occupancyRate: number;
  }> {
    try {
      // Compter les créneaux disponibles dans la période
      const availableSlots = await this.getCoachAvailability(coachId);
      let totalSlots = 0;

      // Calculer le nombre de jours dans la période
      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Compter les créneaux par jour de la semaine
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        totalSlots += availableSlots[dayOfWeek]?.length || 0;
      }

      // Compter les rendez-vous confirmés dans la période
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('coach_id', coachId)
        .gte('appointment_date', dateFrom)
        .lte('appointment_date', dateTo)
        .in('status', ['confirmed', 'completed']);

      if (error) throw error;

      const bookedSlots = data.length;
      const occupancyRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      return {
        totalSlots,
        bookedSlots,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      };
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors du calcul du taux d\'occupation');
    }
  }

  /**
   * Dupliquer le planning d'une semaine
   */
  async duplicateWeekSchedule(
    coachId: string,
    sourceWeekStart: string,
    targetWeekStart: string
  ): Promise<AvailabilitySlot[]> {
    try {
      // Cette fonction nécessiterait une logique plus complexe pour gérer
      // la duplication de créneaux spécifiques à une semaine
      // Pour l'instant, on retourne un tableau vide

      return [];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la duplication du planning');
    }
  }
}

export const availabilityService = new AvailabilityService();
