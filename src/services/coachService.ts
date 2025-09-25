import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';

export type Coach = Tables<'profiles'> & {
  // Ajout de champs calculés pour l'affichage
  full_name: string;
  display_name: string;
  client_count?: number;
  experience_years?: number;
  specialities?: string[];
  rating?: number;
};

export interface CoachFilters {
  search?: string;
  speciality?: string;
  location?: string;
}

export class CoachService {
  /**
   * Récupère tous les coachs depuis la base de données
   */
  static async getAllCoaches(): Promise<Coach[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          clients!clients_coach_id_fkey(count)
        `)
        .eq('role', 'coach')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des coachs:', error);
        throw error;
      }

      // Transformer les données pour l'affichage
      const coaches: Coach[] = (data || []).map(profile => ({
        ...profile,
        full_name: `${profile.first_name} ${profile.last_name}`,
        display_name: profile.first_name,
        client_count: profile.clients?.[0]?.count || 0,
        // Valeurs par défaut pour les champs manquants
        experience_years: this.calculateExperienceYears(profile.created_at),
        specialities: this.extractSpecialities(profile.bio),
        rating: this.calculateRating(profile.created_at, profile.clients?.[0]?.count || 0)
      }));

      return coaches;
    } catch (error) {
      console.error('Erreur CoachService.getAllCoaches:', error);
      throw error;
    }
  }

  /**
   * Récupère un coach par son ID
   */
  static async getCoachById(id: string): Promise<Coach | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          clients!clients_coach_id_fkey(count)
        `)
        .eq('id', id)
        .eq('role', 'coach')
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du coach:', error);
        return null;
      }

      return {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        display_name: data.first_name,
        client_count: data.clients?.[0]?.count || 0,
        experience_years: this.calculateExperienceYears(data.created_at),
        specialities: this.extractSpecialities(data.bio),
        rating: this.calculateRating(data.created_at, data.clients?.[0]?.count || 0)
      };
    } catch (error) {
      console.error('Erreur CoachService.getCoachById:', error);
      return null;
    }
  }

  /**
   * Filtre les coachs selon les critères
   */
  static async getFilteredCoaches(filters: CoachFilters): Promise<Coach[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          clients!clients_coach_id_fkey(count)
        `)
        .eq('role', 'coach');

      // Filtre par recherche (nom, email)
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Filtre par spécialité (dans la bio)
      if (filters.speciality) {
        query = query.ilike('bio', `%${filters.speciality}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du filtrage des coachs:', error);
        throw error;
      }

      // Transformer les données
      const coaches: Coach[] = (data || []).map(profile => ({
        ...profile,
        full_name: `${profile.first_name} ${profile.last_name}`,
        display_name: profile.first_name,
        client_count: profile.clients?.[0]?.count || 0,
        experience_years: this.calculateExperienceYears(profile.created_at),
        specialities: this.extractSpecialities(profile.bio),
        rating: this.calculateRating(profile.created_at, profile.clients?.[0]?.count || 0)
      }));

      return coaches;
    } catch (error) {
      console.error('Erreur CoachService.getFilteredCoaches:', error);
      throw error;
    }
  }

  /**
   * Calcule les années d'expérience basées sur la date de création
   */
  private static calculateExperienceYears(createdAt: string | null): number {
    if (!createdAt) return 1;
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    
    return Math.max(1, diffYears);
  }

  /**
   * Extrait les spécialités depuis la bio
   */
  private static extractSpecialities(bio: string | null): string[] {
    if (!bio) return ['Coaching général'];
    
    // Mots-clés de spécialités courantes
    const specialityKeywords = [
      'musculation', 'crossfit', 'yoga', 'pilates', 'cardio', 'fitness',
      'nutrition', 'perte de poids', 'prise de masse', 'récupération',
      'sport', 'entraînement', 'coaching', 'préparation physique'
    ];
    
    const foundSpecialities = specialityKeywords.filter(keyword => 
      bio.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return foundSpecialities.length > 0 ? foundSpecialities : ['Coaching général'];
  }

  /**
   * Calcule une note basée sur l'ancienneté et le nombre de clients
   */
  private static calculateRating(createdAt: string | null, clientCount: number): number {
    const experienceYears = this.calculateExperienceYears(createdAt);
    
    // Note de base basée sur l'expérience (3.5 à 5.0)
    let baseRating = 3.5 + (experienceYears * 0.1);
    
    // Bonus basé sur le nombre de clients
    if (clientCount > 50) baseRating += 0.5;
    else if (clientCount > 20) baseRating += 0.3;
    else if (clientCount > 5) baseRating += 0.1;
    
    // Limiter entre 3.5 et 5.0
    return Math.min(5.0, Math.max(3.5, baseRating));
  }

  /**
   * Récupère les statistiques des coachs
   */
  static async getCoachStats(): Promise<{
    totalCoaches: number;
    totalClients: number;
    averageRating: number;
  }> {
    try {
      const coaches = await this.getAllCoaches();
      
      const totalCoaches = coaches.length;
      const totalClients = coaches.reduce((sum, coach) => sum + (coach.client_count || 0), 0);
      const averageRating = coaches.length > 0 
        ? coaches.reduce((sum, coach) => sum + (coach.rating || 0), 0) / coaches.length 
        : 0;

      return {
        totalCoaches,
        totalClients,
        averageRating: Math.round(averageRating * 10) / 10
      };
    } catch (error) {
      console.error('Erreur CoachService.getCoachStats:', error);
      throw error;
    }
  }
}
