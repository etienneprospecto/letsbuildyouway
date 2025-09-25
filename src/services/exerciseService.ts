import { supabase } from '../lib/supabase';
import { Exercise } from '../types';
import { ErrorHandler, ApiError } from './errorHandler';
import { PaginationService, PaginationParams, PaginatedResult } from './paginationService';

export const exerciseService = {
  async getExercises(pagination?: PaginationParams): Promise<PaginatedResult<Exercise> | Exercise[]> {
    try {
      if (pagination) {
        const validatedParams = PaginationService.validatePaginationParams(pagination)
        const offset = PaginationService.getOffset(validatedParams.page, validatedParams.limit)

        // Compter le total
        const { count, error: countError } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          ErrorHandler.handleSupabaseError(countError, 'getExercises count')
        }

        // Récupérer les données
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' })
          .range(offset, offset + validatedParams.limit - 1)

        if (error) {
          ErrorHandler.handleSupabaseError(error, 'getExercises')
        }

        return PaginationService.createPaginatedResult(
          data || [],
          count || 0,
          validatedParams.page,
          validatedParams.limit
        )
      } else {
        // Mode non-paginé pour la compatibilité
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name')

        if (error) {
          ErrorHandler.handleSupabaseError(error, 'getExercises')
        }
        
        return data || []
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'getExercises')
    }
  },

  async getExercisesByTheme(theme: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('theme', theme)
      .order('name');

    if (error) throw error;
    return data;
  },

  async createExercise(exerciseData: Omit<Exercise, 'id'> & { createdBy: string }) {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name: exerciseData.name,
        theme: exerciseData.theme,
        video_url: exerciseData.video,
        objective: exerciseData.objective,
        instructions: exerciseData.instructions,
        common_mistakes: exerciseData.commonMistakes,
        variations: exerciseData.variations,
        image_url: exerciseData.image,
        created_by: exerciseData.createdBy,
        is_custom: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExercise(exerciseId: string, updates: Partial<Exercise>) {
    const { data, error } = await supabase
      .from('exercises')
      .update({
        name: updates.name,
        theme: updates.theme,
        video_url: updates.video,
        objective: updates.objective,
        instructions: updates.instructions,
        common_mistakes: updates.commonMistakes,
        variations: updates.variations,
        image_url: updates.image,
        updated_at: new Date().toISOString()
      })
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExercise(exerciseId: string) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw error;
  }
};