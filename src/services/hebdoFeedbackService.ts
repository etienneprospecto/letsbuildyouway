import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type WeeklyFeedback = Database['public']['Tables']['weekly_feedbacks']['Row']
type WeeklyFeedbackInsert = Database['public']['Tables']['weekly_feedbacks']['Insert']
type WeeklyFeedbackUpdate = Database['public']['Tables']['weekly_feedbacks']['Update']

export interface FeedbackScores {
  alimentation: number
  lifestyle: number
  feelings: number
}

export interface FeedbackDetails {
  alimentation: {
    score: number
    comment?: string
    details?: Record<string, any>
  }
  lifestyle: {
    score: number
    comment?: string
    details?: Record<string, any>
  }
  feelings: {
    score: number
    comment?: string
    details?: Record<string, any>
  }
}

export interface WeeklyFeedbackWithDetails extends WeeklyFeedback {
  feedbackDetails?: FeedbackDetails
}

export class HebdoFeedbackService {
  // Récupérer tous les feedbacks hebdomadaires d'un client
  static async getClientFeedbacks(clientId: string): Promise<WeeklyFeedbackWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_feedbacks')
        .select('*')
        .eq('client_id', clientId)
        .order('week_start', { ascending: false })

      if (error) throw error

      // Parser les détails JSON si présents
      const feedbacksWithDetails = (data || []).map(feedback => ({
        ...feedback,
        feedbackDetails: this.parseFeedbackDetails(feedback)
      }))

      return feedbacksWithDetails
    } catch (error) {
      console.error('Error fetching weekly feedbacks:', error)
      throw error
    }
  }

  // Récupérer un feedback spécifique
  static async getFeedbackById(feedbackId: string): Promise<WeeklyFeedbackWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_feedbacks')
        .select('*')
        .eq('id', feedbackId)
        .single()

      if (error) throw error

      return data ? {
        ...data,
        feedbackDetails: this.parseFeedbackDetails(data)
      } : null
    } catch (error) {
      console.error('Error fetching feedback by id:', error)
      throw error
    }
    }

  // Créer un nouveau feedback hebdomadaire
  static async createFeedback(feedbackData: WeeklyFeedbackInsert): Promise<WeeklyFeedback> {
    try {
      const { data, error } = await supabase
        .from('weekly_feedbacks')
        .insert(feedbackData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating weekly feedback:', error)
      throw error
    }
  }

  // Mettre à jour un feedback existant
  static async updateFeedback(feedbackId: string, updates: WeeklyFeedbackUpdate): Promise<WeeklyFeedback> {
    try {
      const { data, error } = await supabase
        .from('weekly_feedbacks')
        .update(updates)
        .eq('id', feedbackId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating weekly feedback:', error)
      throw error
    }
  }

  // Soumettre un feedback complet
  static async submitFeedback(clientId: string, weekStart: string, weekEnd: string, scores: FeedbackScores, comments?: {
    alimentary?: string
    lifestyle?: string
    feelings?: string
  }): Promise<WeeklyFeedback> {
    try {
      const scoreGlobal = Math.round((scores.alimentation + scores.lifestyle + scores.feelings) / 3 * 10)

      const feedbackData: WeeklyFeedbackInsert = {
        client_id: clientId,
        week_start: weekStart,
        week_end: weekEnd,
        alimentary_scores: scores.alimentation,
        lifestyle_scores: scores.lifestyle,
        feelings_scores: scores.feelings,
        alimentary_comment: comments?.alimentary || null,
        lifestyle_comment: comments?.lifestyle || null,
        feelings_comment: comments?.feelings || null,
        score: scoreGlobal,
        submitted_at: new Date().toISOString()
      }

      return await this.createFeedback(feedbackData)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  // Récupérer le feedback de la semaine courante
  static async getCurrentWeekFeedback(clientId: string): Promise<WeeklyFeedbackWithDetails | null> {
    try {
      const today = new Date()
      const weekStart = this.getWeekStart(today)
      const weekEnd = this.getWeekEnd(today)

      const { data, error } = await supabase
        .from('weekly_feedbacks')
        .select('*')
        .eq('client_id', clientId)
        .eq('week_start', weekStart)
        .eq('week_end', weekEnd)
        .maybeSingle()

      if (error) throw error

      return data ? {
        ...data,
        feedbackDetails: this.parseFeedbackDetails(data)
      } : null
    } catch (error) {
      console.error('Error fetching current week feedback:', error)
      throw error
    }
  }

  // Récupérer les statistiques de feedback d'un client
  static async getClientFeedbackStats(clientId: string): Promise<{
    totalFeedbacks: number
    averageScore: number
    lastFeedbackDate: string | null
    completionRate: number
  }> {
    try {
      const feedbacks = await this.getClientFeedbacks(clientId)
      
      if (feedbacks.length === 0) {
        return {
          totalFeedbacks: 0,
          averageScore: 0,
          lastFeedbackDate: null,
          completionRate: 0
        }
      }

      const totalFeedbacks = feedbacks.length
      const averageScore = Math.round(
        feedbacks.reduce((sum, f) => sum + f.score, 0) / totalFeedbacks
      )
      const lastFeedbackDate = feedbacks[0]?.submitted_at || null
      
      // Calculer le taux de completion (feedbacks soumis vs semaines depuis le début)
      const firstFeedback = feedbacks[feedbacks.length - 1]
      if (firstFeedback) {
        const startDate = new Date(firstFeedback.week_start)
        const today = new Date()
        const weeksSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const completionRate = Math.round((totalFeedbacks / Math.max(weeksSinceStart, 1)) * 100)
        
        return {
          totalFeedbacks,
          averageScore,
          lastFeedbackDate,
          completionRate: Math.min(completionRate, 100)
        }
      }

      return {
        totalFeedbacks,
        averageScore,
        lastFeedbackDate,
        completionRate: 100
      }
    } catch (error) {
      console.error('Error calculating feedback stats:', error)
      throw error
    }
  }

  // S'abonner aux changements de feedbacks d'un client (realtime)
  static subscribeToClientFeedbacks(clientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`feedbacks_client_${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_feedbacks',
          filter: `client_id=eq.${clientId}`
        },
        callback
      )
      .subscribe()
  }

  // Utilitaires pour les dates
  private static getWeekStart(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lundi = 1, Dimanche = 0
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  private static getWeekEnd(date: Date): string {
    const monday = new Date(this.getWeekStart(date))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sunday.toISOString().split('T')[0]
  }

  // Parser les détails JSON des feedbacks
  private static parseFeedbackDetails(feedback: WeeklyFeedback): FeedbackDetails | undefined {
    try {
      if (!feedback.alimentary_scores && !feedback.lifestyle_scores && !feedback.feelings_scores) {
        return undefined
      }

      return {
        alimentation: {
          score: typeof feedback.alimentary_scores === 'number' ? feedback.alimentary_scores : 0,
          comment: feedback.alimentary_comment || undefined,
          details: typeof feedback.alimentary_scores === 'object' ? feedback.alimentary_scores : undefined
        },
        lifestyle: {
          score: typeof feedback.lifestyle_scores === 'number' ? feedback.lifestyle_scores : 0,
          comment: feedback.lifestyle_comment || undefined,
          details: typeof feedback.lifestyle_scores === 'object' ? feedback.lifestyle_scores : undefined
        },
        feelings: {
          score: typeof feedback.feelings_scores === 'number' ? feedback.feelings_scores : 0,
          comment: feedback.feelings_comment || undefined,
          details: typeof feedback.feelings_scores === 'object' ? feedback.feelings_scores : undefined
        }
      }
    } catch (error) {
      console.error('Error parsing feedback details:', error)
      return undefined
    }
  }
}

export default HebdoFeedbackService
