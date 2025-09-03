import { supabase } from '../lib/supabase';
import { WeeklyFeedback } from '../types';

export const feedbackService = {
  async getClientFeedbacks(clientId: string) {
    const { data, error } = await supabase
      .from('weekly_feedbacks')
      .select('*')
      .eq('client_id', clientId)
      .order('week_start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async submitWeeklyFeedback(feedbackData: Omit<WeeklyFeedback, 'id'>) {
    const { data, error } = await supabase
      .from('weekly_feedbacks')
      .insert({
        client_id: feedbackData.clientId,
        week_start_date: feedbackData.weekStart,
        week_end_date: feedbackData.weekEnd,
        alimentary_scores: feedbackData.alimentary,
        lifestyle_scores: feedbackData.lifestyle,
        feelings_scores: feedbackData.feelings,
        alimentary_comment: feedbackData.comments?.alimentary,
        lifestyle_comment: feedbackData.comments?.lifestyle,
        feelings_comment: feedbackData.comments?.feelings,
        score: feedbackData.score,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFeedback(feedbackId: string, updates: Partial<WeeklyFeedback>) {
    const { data, error } = await supabase
      .from('weekly_feedbacks')
      .update({
        alimentary_scores: updates.alimentary,
        lifestyle_scores: updates.lifestyle,
        feelings_scores: updates.feelings,
        alimentary_comment: updates.comments?.alimentary,
        lifestyle_comment: updates.comments?.lifestyle,
        feelings_comment: updates.comments?.feelings,
        score: updates.score
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};