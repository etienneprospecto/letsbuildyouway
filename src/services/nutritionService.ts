import { supabase } from '../lib/supabase';

export interface NutritionEntry {
  id: string;
  client_id: string;
  coach_id: string;
  meal_type: 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation';
  photo_url?: string;
  description?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionComment {
  id: string;
  nutrition_entry_id: string;
  coach_id: string;
  comment: string;
  created_at: string;
}

export interface NutritionGoals {
  id: string;
  client_id: string;
  coach_id: string;
  daily_calories?: number;
  daily_proteins?: number;
  daily_carbs?: number;
  daily_fats?: number;
  daily_water_glasses: number;
  created_at: string;
  updated_at: string;
}

export interface HydrationTracking {
  id: string;
  client_id: string;
  glasses_count: number;
  date: string;
  created_at: string;
}

export interface NutritionStats {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  waterGlasses: number;
  goals: NutritionGoals | null;
  progress: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    water: number;
  };
}

export class NutritionService {
  // ===== NUTRITION ENTRIES =====
  
  static async getClientNutritionEntries(clientId: string, date?: string) {
    try {
      let query = supabase
        .from('nutrition_entries')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        // Si la table n'existe pas, retourner un tableau vide au lieu de planter
        if (error.code === 'PGRST116' || error.message?.includes('relation "nutrition_entries" does not exist')) {
          return [];
        }
        throw error;
      }
      
      return data as NutritionEntry[];
    } catch (error) {
      console.error('Error in getClientNutritionEntries:', error);
      // En cas d'erreur, retourner un tableau vide pour éviter de planter l'interface
      return [];
    }
  }

  static async getCoachNutritionEntries(coachId: string, clientId?: string) {
    let query = supabase
      .from('nutrition_entries')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as NutritionEntry[];
  }

  static async createNutritionEntry(entry: Omit<NutritionEntry, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data as NutritionEntry;
  }

  static async updateNutritionEntry(id: string, updates: Partial<NutritionEntry>) {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NutritionEntry;
  }

  static async deleteNutritionEntry(id: string) {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== NUTRITION COMMENTS =====

  static async getNutritionComments(nutritionEntryId: string) {
    const { data, error } = await supabase
      .from('nutrition_comments')
      .select('*')
      .eq('nutrition_entry_id', nutritionEntryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as NutritionComment[];
  }

  static async createNutritionComment(comment: Omit<NutritionComment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('nutrition_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data as NutritionComment;
  }

  static async updateNutritionComment(id: string, comment: string) {
    const { data, error } = await supabase
      .from('nutrition_comments')
      .update({ comment })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NutritionComment;
  }

  static async deleteNutritionComment(id: string) {
    const { error } = await supabase
      .from('nutrition_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== NUTRITION GOALS =====

  static async getNutritionGoals(clientId: string) {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as NutritionGoals | null;
  }

  static async createOrUpdateNutritionGoals(goals: Omit<NutritionGoals, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Essayer d'abord l'upsert avec la contrainte unique
      const { data, error } = await supabase
        .from('nutrition_goals')
        .upsert(goals, { onConflict: 'client_id,coach_id' })
        .select()
        .single();

      if (error) throw error;
      return data as NutritionGoals;
    } catch (error: any) {
      // Si l'upsert échoue, essayer une approche manuelle
      console.log('Upsert failed, trying manual approach:', error);
      
      // Chercher un objectif existant
      const existing = await this.getNutritionGoals(goals.client_id);
      
      if (existing) {
        // Mettre à jour l'objectif existant
        const { data, error } = await supabase
          .from('nutrition_goals')
          .update({ ...goals, updated_at: new Date().toISOString() })
          .eq('client_id', goals.client_id)
          .eq('coach_id', goals.coach_id)
          .select()
          .single();
        
        if (error) throw error;
        return data as NutritionGoals;
      } else {
        // Créer un nouvel objectif
        const { data, error } = await supabase
          .from('nutrition_goals')
          .insert(goals)
          .select()
          .single();
        
        if (error) throw error;
        return data as NutritionGoals;
      }
    }
  }

  // ===== HYDRATION TRACKING =====

  static async getHydrationTracking(clientId: string, date?: string) {
    let query = supabase
      .from('hydration_tracking')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as HydrationTracking[];
  }

  static async addWaterGlass(clientId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('hydration_tracking')
      .upsert(
        { 
          client_id: clientId, 
          date: targetDate,
          glasses_count: 1
        },
        { 
          onConflict: 'client_id,date',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as HydrationTracking;
  }

  static async updateWaterGlasses(clientId: string, glassesCount: number, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('hydration_tracking')
      .upsert(
        { 
          client_id: clientId, 
          date: targetDate,
          glasses_count: glassesCount
        },
        { 
          onConflict: 'client_id,date'
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as HydrationTracking;
  }

  // ===== NUTRITION STATS =====

  static async getNutritionStats(clientId: string, date?: string): Promise<NutritionStats> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Get nutrition entries for the day
      const entries = await this.getClientNutritionEntries(clientId, targetDate);
      
      // Get hydration tracking for the day
      const hydration = await this.getHydrationTracking(clientId, targetDate);
      
      // Get nutrition goals
      const goals = await this.getNutritionGoals(clientId);

    // Calculate totals
    const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const totalProteins = entries.reduce((sum, entry) => sum + (entry.proteins || 0), 0);
    const totalCarbs = entries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
    const totalFats = entries.reduce((sum, entry) => sum + (entry.fats || 0), 0);
    const waterGlasses = hydration.reduce((sum, h) => sum + h.glasses_count, 0);

    // Calculate progress percentages
    const progress = {
      calories: goals?.daily_calories ? (totalCalories / goals.daily_calories) * 100 : 0,
      proteins: goals?.daily_proteins ? (totalProteins / goals.daily_proteins) * 100 : 0,
      carbs: goals?.daily_carbs ? (totalCarbs / goals.daily_carbs) * 100 : 0,
      fats: goals?.daily_fats ? (totalFats / goals.daily_fats) * 100 : 0,
      water: goals?.daily_water_glasses ? (waterGlasses / goals.daily_water_glasses) * 100 : 0,
    };

      return {
        totalCalories,
        totalProteins,
        totalCarbs,
        totalFats,
        waterGlasses,
        goals,
        progress
      };
    } catch (error) {
      console.error('Error in getNutritionStats:', error);
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalCalories: 0,
        totalProteins: 0,
        totalCarbs: 0,
        totalFats: 0,
        waterGlasses: 0,
        goals: null,
        progress: {
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          water: 0
        }
      };
    }
  }

  // ===== PHOTO UPLOAD =====

  static async uploadNutritionPhoto(file: File, clientId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${clientId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('nutrition-photos')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('nutrition-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  static async deleteNutritionPhoto(photoUrl: string) {
    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('nutrition-photos')
      .remove([filePath]);

    if (error) throw error;
  }
}
