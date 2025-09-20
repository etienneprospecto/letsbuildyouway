import { supabase } from '../lib/supabase';
import { ProgressData } from '../types';

export const progressService = {
  async getClientProgress(clientId: string) {
    const { data, error } = await supabase
      .from('progress_data')
      .select('*')
      .eq('client_id', clientId)
      .order('measurement_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addProgressEntry(progressData: Omit<ProgressData, 'id'>) {
    const { data, error } = await supabase
      .from('progress_data')
      .insert({
        client_id: progressData.clientId,
        measurement_date: progressData.date,
        weight_kg: progressData.weight,
        body_fat_percentage: progressData.bodyFat,
        muscle_mass_kg: progressData.muscleMass,
        measurements: progressData.measurements,
        photos_urls: progressData.photos
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgressEntry(progressId: string, updates: Partial<ProgressData>) {
    const { data, error } = await supabase
      .from('progress_data')
      .update({
        weight_kg: updates.weight,
        body_fat_percentage: updates.bodyFat,
        muscle_mass_kg: updates.muscleMass,
        measurements: updates.measurements,
        photos_urls: updates.photos
      })
      .eq('id', progressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProgressEntry(progressId: string) {
    const { error } = await supabase
      .from('progress_data')
      .delete()
      .eq('id', progressId);

    if (error) throw error;
  }
};