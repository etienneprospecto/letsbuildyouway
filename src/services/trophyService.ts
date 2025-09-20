import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { errorHandler } from './errorHandler';

type Trophy = Database['public']['Tables']['trophies']['Row'];
type UserTrophy = Database['public']['Tables']['user_trophies']['Row'];
type TrophyInsert = Database['public']['Tables']['trophies']['Insert'];
type UserTrophyInsert = Database['public']['Tables']['user_trophies']['Insert'];

export interface TrophyWithProgress extends Trophy {
  is_unlocked: boolean;
  unlocked_date?: string;
  progress_percentage: number;
  current_value: number;
  target_value: number;
}

export interface TrophyStats {
  total_trophies: number;
  unlocked_trophies: number;
  completion_percentage: number;
  recent_trophies: UserTrophy[];
}

export interface TrophyCategory {
  name: string;
  icon: string;
  trophies: TrophyWithProgress[];
}

class TrophyService {
  /**
   * Récupérer tous les trophées avec le statut de déverrouillage pour un utilisateur
   */
  async getUserTrophies(userId: string): Promise<TrophyWithProgress[]> {
    try {
      const { data, error } = await supabase
        .from('trophies')
        .select(`
          *,
          user_trophies!left (
            id,
            earned_date,
            user_id
          )
        `);

      if (error) throw error;

      return data.map(trophy => {
        const userTrophy = trophy.user_trophies?.find((ut: any) => ut.user_id === userId);
        const criteria = trophy.criteria as any;
        
        return {
          ...trophy,
          is_unlocked: !!userTrophy,
          unlocked_date: userTrophy?.earned_date || undefined,
          progress_percentage: userTrophy ? 100 : 0, // TODO: Calculer le vrai pourcentage
          current_value: 0, // TODO: Calculer la valeur actuelle
          target_value: criteria?.target || 1
        };
      });
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des trophées');
    }
  }

  /**
   * Récupérer les trophées par catégories
   */
  async getUserTrophiesByCategory(userId: string): Promise<TrophyCategory[]> {
    const trophies = await this.getUserTrophies(userId);
    
    const categories: { [key: string]: TrophyWithProgress[] } = {
      assiduity: [],
      progression: [],
      training: [],
      nutrition: [],
      interaction: [],
      calendar: []
    };

    trophies.forEach(trophy => {
      const criteria = trophy.criteria as any;
      const type = criteria?.type || 'other';
      
      if (type.includes('consecutive_days') || type.includes('first_login')) {
        categories.assiduity.push(trophy);
      } else if (type.includes('weight') || type.includes('goal')) {
        categories.progression.push(trophy);
      } else if (type.includes('sessions') || type.includes('workout')) {
        categories.training.push(trophy);
      } else if (type.includes('nutrition')) {
        categories.nutrition.push(trophy);
      } else if (type.includes('messages')) {
        categories.interaction.push(trophy);
      } else if (type.includes('appointments')) {
        categories.calendar.push(trophy);
      }
    });

    return [
      {
        name: 'Assiduité',
        icon: '📅',
        trophies: categories.assiduity
      },
      {
        name: 'Progression',
        icon: '📈',
        trophies: categories.progression
      },
      {
        name: 'Entraînement',
        icon: '💪',
        trophies: categories.training
      },
      {
        name: 'Nutrition',
        icon: '🥗',
        trophies: categories.nutrition
      },
      {
        name: 'Interaction',
        icon: '💬',
        trophies: categories.interaction
      },
      {
        name: 'Rendez-vous',
        icon: '📅',
        trophies: categories.calendar
      }
    ].filter(category => category.trophies.length > 0);
  }

  /**
   * Récupérer les statistiques des trophées pour un utilisateur
   */
  async getUserTrophyStats(userId: string): Promise<TrophyStats> {
    try {
      // Récupérer le total des trophées
      const { count: totalTrophies, error: totalError } = await supabase
        .from('trophies')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Récupérer les trophées déverrouillés
      const { data: unlockedTrophies, error: unlockedError } = await supabase
        .from('user_trophies')
        .select('*, trophies(*)')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      if (unlockedError) throw unlockedError;

      const unlockedCount = unlockedTrophies?.length || 0;
      const completionPercentage = totalTrophies ? Math.round((unlockedCount / totalTrophies) * 100) : 0;

      return {
        total_trophies: totalTrophies || 0,
        unlocked_trophies: unlockedCount,
        completion_percentage: completionPercentage,
        recent_trophies: unlockedTrophies?.slice(0, 5) || []
      };
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Déverrouiller un trophée pour un utilisateur
   */
  async unlockTrophy(userId: string, trophyId: string): Promise<UserTrophy> {
    try {
      // Vérifier si le trophée n'est pas déjà déverrouillé
      const { data: existingTrophy, error: checkError } = await supabase
        .from('user_trophies')
        .select('id')
        .eq('user_id', userId)
        .eq('trophy_id', trophyId)
        .single();

      if (existingTrophy) {
        throw new Error('Trophée déjà déverrouillé');
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Déverrouiller le trophée
      const { data, error } = await supabase
        .from('user_trophies')
        .insert({
          user_id: userId,
          trophy_id: trophyId,
          earned_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors du déverrouillage du trophée');
    }
  }

  /**
   * Vérifier et déverrouiller les trophées automatiquement
   */
  async checkAndUnlockTrophies(userId: string): Promise<UserTrophy[]> {
    try {
      const newTrophies: UserTrophy[] = [];

      // Récupérer les données utilisateur nécessaires
      const userData = await this.getUserProgressData(userId);
      
      // Récupérer tous les trophées non déverrouillés
      const { data: availableTrophies, error } = await supabase
        .from('trophies')
        .select(`
          *,
          user_trophies!left (
            id,
            user_id
          )
        `);

      if (error) throw error;

      // Filtrer les trophées non déverrouillés
      const unlockedTrophyIds = availableTrophies
        ?.filter(t => t.user_trophies?.some((ut: any) => ut.user_id === userId))
        .map(t => t.id) || [];

      const lockedTrophies = availableTrophies?.filter(t => !unlockedTrophyIds.includes(t.id)) || [];

      // Vérifier chaque trophée verrouillé
      for (const trophy of lockedTrophies) {
        const criteria = trophy.criteria as any;
        
        if (this.checkTrophyCriteria(criteria, userData)) {
          try {
            const newTrophy = await this.unlockTrophy(userId, trophy.id);
            newTrophies.push(newTrophy);
          } catch (error) {
            console.error(`Erreur lors du déverrouillage du trophée ${trophy.name}:`, error);
          }
        }
      }

      return newTrophies;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la vérification des trophées');
    }
  }

  /**
   * Récupérer les données de progression d'un utilisateur
   */
  private async getUserProgressData(userId: string): Promise<any> {
    try {
      // Récupérer le profil client
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, clients(*)')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const clientId = profile.client_id;
      if (!clientId) return {};

      // Récupérer les données en parallèle
      const [
        { data: sessions },
        { data: nutritionEntries },
        { data: messages },
        { data: appointments },
        { data: progressData }
      ] = await Promise.all([
        supabase.from('seances').select('*').eq('client_id', clientId),
        supabase.from('nutrition_entries').select('*').eq('client_id', clientId),
        supabase.from('messages').select('*').eq('sender_id', userId),
        supabase.from('appointments').select('*').eq('client_id', clientId).eq('status', 'completed'),
        supabase.from('progress_data').select('*').eq('client_id', clientId).order('measurement_date', { ascending: false })
      ]);

      return {
        sessions: sessions || [],
        nutritionEntries: nutritionEntries || [],
        messages: messages || [],
        appointments: appointments || [],
        progressData: progressData || [],
        profile,
        client: profile.clients
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return {};
    }
  }

  /**
   * Vérifier si les critères d'un trophée sont remplis
   */
  private checkTrophyCriteria(criteria: any, userData: any): boolean {
    if (!criteria || !criteria.type) return false;

    const { type, target } = criteria;

    switch (type) {
      case 'first_login':
        return true; // Si on arrive ici, c'est que l'utilisateur s'est connecté

      case 'sessions_completed':
        const completedSessions = userData.sessions?.filter((s: any) => s.statut === 'terminée').length || 0;
        return completedSessions >= target;

      case 'nutrition_entries':
        return (userData.nutritionEntries?.length || 0) >= target;

      case 'messages_sent':
        return (userData.messages?.length || 0) >= target;

      case 'appointments_completed':
        return (userData.appointments?.length || 0) >= target;

      case 'weight_progress':
        if (!userData.client || !userData.progressData?.length) return false;
        const startWeight = userData.client.poids_depart;
        const currentWeight = userData.progressData[0]?.weight_kg || userData.client.poids_actuel;
        if (!startWeight || !currentWeight) return false;
        return Math.abs(startWeight - currentWeight) >= target;

      case 'weight_goal':
        if (!userData.client) return false;
        const targetWeight = userData.client.poids_objectif;
        const actualWeight = userData.progressData?.[0]?.weight_kg || userData.client.poids_actuel;
        if (!targetWeight || !actualWeight) return false;
        return Math.abs(targetWeight - actualWeight) <= 1; // Tolérance de 1kg

      // TODO: Implémenter les autres types de critères (consecutive_days, nutrition_streak, etc.)
      
      default:
        return false;
    }
  }

  /**
   * Récupérer les trophées récents de tous les clients pour un coach
   */
  async getCoachClientsTrophies(coachId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_trophies')
        .select(`
          *,
          trophies (*),
          profiles!user_trophies_user_id_fkey (
            *,
            clients (*)
          )
        `)
        .order('earned_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Filtrer pour ne garder que les clients du coach
      return data?.filter((trophy: any) => 
        trophy.profiles?.clients?.coach_id === coachId
      ) || [];
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la récupération des trophées clients');
    }
  }

  /**
   * Créer un trophée personnalisé
   */
  async createCustomTrophy(trophy: TrophyInsert): Promise<Trophy> {
    try {
      const { data, error } = await supabase
        .from('trophies')
        .insert(trophy)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw errorHandler.handleError(error, 'Erreur lors de la création du trophée');
    }
  }
}

export const trophyService = new TrophyService();
