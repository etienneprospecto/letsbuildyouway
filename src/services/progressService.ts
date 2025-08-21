import { supabase } from '../lib/supabase';
import { ProgressData } from '../types';

export const progressService = {
  async getClientProgress(clientId: string) {
    const { data, error } = await supabase
      .from('progress_data')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async addProgressEntry(progressData: Omit<ProgressData, 'id'>) {
    const { data, error } = await supabase
      .from('progress_data')
      .insert({
        client_id: progressData.clientId,
        date: progressData.date,
        weight: progressData.weight,
        body_fat: progressData.bodyFat,
        muscle_mass: progressData.muscleMass,
        measurements: progressData.measurements,
        photos: progressData.photos
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
        weight: updates.weight,
        body_fat: updates.bodyFat,
        muscle_mass: updates.muscleMass,
        measurements: updates.measurements,
        photos: updates.photos
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