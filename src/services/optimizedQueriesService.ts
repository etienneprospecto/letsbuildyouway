import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

/**
 * Service de requêtes optimisées avec jointures
 * Remplace les multiples requêtes par des jointures intelligentes
 */
export class OptimizedQueriesService {
  /**
   * Récupère les données complètes d'un coach avec ses clients en une seule requête
   * Remplace les multiples requêtes dans CoachDashboard
   */
  static async getCoachDashboardData(coachId: string) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getCoachDashboardData', { coachId });

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          clients!clients_coach_id_fkey(
            id,
            first_name,
            last_name,
            contact,
            status,
            created_at,
            coach_client_relations!coach_client_relations_client_id_fkey(
              relation_active,
              created_at
            )
          )
        `)
        .eq('id', coachId)
        .eq('role', 'coach')
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération des données coach: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getCoachDashboardData', duration);

      return {
        profile: data,
        clients: data.clients || [],
        totalClients: data.clients?.length || 0,
        activeClients: data.clients?.filter(c => c.status === 'active').length || 0
      };

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getCoachDashboardData', error);
      throw error;
    }
  }

  /**
   * Récupère les données complètes d'un client avec son coach en une seule requête
   * Remplace les multiples requêtes dans ClientDashboard
   */
  static async getClientDashboardData(clientId: string) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getClientDashboardData', { clientId });

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profiles!clients_coach_id_fkey(
            id,
            first_name,
            last_name,
            email,
            role
          ),
          coach_client_relations!coach_client_relations_client_id_fkey(
            relation_active,
            created_at
          )
        `)
        .eq('id', clientId)
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération des données client: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getClientDashboardData', duration);

      return {
        client: data,
        coach: data.profiles,
        relation: data.coach_client_relations?.[0] || null
      };

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getClientDashboardData', error);
      throw error;
    }
  }

  /**
   * Récupère les messages avec les détails des utilisateurs en une seule requête
   * Remplace les multiples requêtes dans MessageService
   */
  static async getMessagesWithDetails(relationId: string, limit: number = 50) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getMessagesWithDetails', { relationId, limit });

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id,
            first_name,
            last_name,
            email
          ),
          receiver:receiver_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('relation_id', relationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getMessagesWithDetails', duration);

      return data || [];

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getMessagesWithDetails', error);
      throw error;
    }
  }

  /**
   * Récupère les séances avec les détails du client et du coach en une seule requête
   * Remplace les multiples requêtes dans les composants de séances
   */
  static async getSessionsWithDetails(clientId: string, limit: number = 20) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getSessionsWithDetails', { clientId, limit });

      const { data, error } = await supabase
        .from('seances')
        .select(`
          *,
          clients!seances_client_id_fkey(
            id,
            first_name,
            last_name,
            profiles!clients_coach_id_fkey(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Erreur lors de la récupération des séances: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getSessionsWithDetails', duration);

      return data || [];

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getSessionsWithDetails', error);
      throw error;
    }
  }

  /**
   * Récupère les données de facturation avec les détails des clients en une seule requête
   * Remplace les multiples requêtes dans InvoiceModal
   */
  static async getBillingDataWithClients(coachId: string) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getBillingDataWithClients', { coachId });

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          clients!clients_coach_id_fkey(
            id,
            first_name,
            last_name,
            contact,
            status,
            created_at
          )
        `)
        .eq('id', coachId)
        .eq('role', 'coach')
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération des données de facturation: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getBillingDataWithClients', duration);

      return {
        coach: data,
        clients: data.clients || []
      };

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getBillingDataWithClients', error);
      throw error;
    }
  }

  /**
   * Récupère les données de progression avec les détails du client en une seule requête
   * Remplace les multiples requêtes dans TrophyService
   */
  static async getProgressDataWithDetails(clientId: string) {
    const startTime = performance.now();
    
    try {
      logger.supabaseQuery('getProgressDataWithDetails', { clientId });

      const { data, error } = await supabase
        .from('progress_data')
        .select(`
          *,
          clients!progress_data_client_id_fkey(
            id,
            first_name,
            last_name,
            profiles!clients_coach_id_fkey(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des données de progression: ${error.message}`);
      }

      const duration = performance.now() - startTime;
      logger.performance('getProgressDataWithDetails', duration);

      return data || [];

    } catch (error) {
      logger.error('Erreur OptimizedQueriesService.getProgressDataWithDetails', error);
      throw error;
    }
  }
}
