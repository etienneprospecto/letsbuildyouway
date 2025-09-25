import { supabase } from '@/lib/supabase'
import { 
  WeeklyFeedback, 
  FeedbackTemplate, 
  FeedbackQuestion, 
  FeedbackResponse,
  FeedbackStats,
  ClientFeedbackSummary,
  CoachFeedbackDashboard
} from '@/types/feedback'

export class WeeklyFeedbackService {
  // ===== TEMPLATES =====
  
  // Créer un nouveau template de feedback
  static async createTemplate(template: Omit<FeedbackTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<FeedbackTemplate> {
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('feedback_templates')
        .insert({
          coach_id: template.coach_id,
          name: template.name,
          description: template.description,
          is_active: template.is_active
        })
        .select()
        .single()

      if (templateError) throw templateError

      // Créer les questions du template
      const questions = await Promise.all(
        template.questions.map(async (question, index) => {
          const { data: questionData, error: questionError } = await supabase
            .from('feedback_questions')
            .insert({
              template_id: templateData.id,
              question_text: question.question_text,
              question_type: question.question_type,
              order_index: index,
              required: question.required,
              options: question.options
            })
            .select()
            .single()

          if (questionError) throw questionError
          return questionData
        })
      )

      return {
        ...templateData,
        questions
      }
    } catch (error) {
      console.error('Error creating feedback template:', error)
      throw error
    }
  }

  // Récupérer tous les templates d'un coach
  static async getCoachTemplates(coachId: string): Promise<FeedbackTemplate[]> {
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('feedback_templates')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError

      // Récupérer les questions pour chaque template
      const templatesWithQuestions = await Promise.all(
        templates.map(async (template) => {
          const { data: questions, error: questionsError } = await supabase
            .from('feedback_questions')
            .select('*')
            .eq('template_id', template.id)
            .order('order_index')

          if (questionsError) throw questionsError

          return {
            ...template,
            questions: questions || []
          }
        })
      )

      return templatesWithQuestions
    } catch (error) {
      console.error('Error fetching coach templates:', error)
      throw error
    }
  }

  // Mettre à jour un template existant
  static async updateTemplate(templateId: string, templateData: Partial<FeedbackTemplate>): Promise<FeedbackTemplate> {
    try {
      console.log('🔄 Mise à jour template:', templateId, templateData)
      
      // Mettre à jour le template principal
      const { data: updatedTemplate, error: templateError } = await supabase
        .from('feedback_templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          is_active: templateData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single()

      if (templateError) throw templateError

      // Si des questions sont fournies, les mettre à jour
      if (templateData.questions) {
        console.log('📝 Mise à jour des questions:', templateData.questions)
        
        // Supprimer toutes les anciennes questions
        const { error: deleteError } = await supabase
          .from('feedback_questions')
          .delete()
          .eq('template_id', templateId)

        if (deleteError) {
          console.error('❌ Erreur suppression anciennes questions:', deleteError)
          throw deleteError
        }

        console.log('✅ Anciennes questions supprimées')

        // Créer les nouvelles questions
        const questions = await Promise.all(
          templateData.questions.map(async (question, index) => {
            console.log(`📝 Création question ${index + 1}:`, question)
            
            const { data: questionData, error: questionError } = await supabase
              .from('feedback_questions')
              .insert({
                template_id: templateId,
                question_text: question.question_text,
                question_type: question.question_type,
                order_index: index,
                required: question.required,
                options: question.options || []
              })
              .select()
              .single()

            if (questionError) {
              console.error(`❌ Erreur création question ${index + 1}:`, questionError)
              throw questionError
            }
            
            console.log(`✅ Question ${index + 1} créée:`, questionData)
            return questionData
          })
        )

        console.log('🎉 Toutes les questions ont été mises à jour')
        
        // Retourner le template complet avec les questions
        const finalTemplate = {
          ...updatedTemplate,
          questions
        }
        
        console.log('📋 Template final retourné:', finalTemplate)
        return finalTemplate
      }

      console.log('⚠️ Aucune question à mettre à jour, retour du template principal')
      return updatedTemplate
    } catch (error) {
      console.error('❌ Erreur mise à jour template:', error)
      throw error
    }
  }

  // Supprimer un template
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      console.log('🗑️ Suppression template:', templateId)
      
      // Supprimer d'abord toutes les questions du template
      const { error: questionsError } = await supabase
        .from('feedback_questions')
        .delete()
        .eq('template_id', templateId)

      if (questionsError) throw questionsError

      // Supprimer le template principal
      const { error: templateError } = await supabase
        .from('feedback_templates')
        .delete()
        .eq('id', templateId)

      if (templateError) throw templateError

      console.log('✅ Template supprimé avec succès')
    } catch (error) {
      console.error('Error deleting feedback template:', error)
      throw error
    }
  }

  // ===== FEEDBACKS HEBDOMADAIRES =====

  // Créer un nouveau feedback hebdomadaire
  static async createWeeklyFeedback(feedback: Omit<WeeklyFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyFeedback> {
    try {
      const { data, error } = await supabase
        .from('feedbacks_hebdomadaires')
        .insert({
          client_id: feedback.client_id,
          coach_id: feedback.coach_id,
          template_id: feedback.template_id,
          week_start: feedback.week_start,
          week_end: feedback.week_end,
          status: feedback.status,
          sent_at: feedback.sent_at,
          completed_at: feedback.completed_at,
          score: feedback.score
        })
        .select()
        .single()

      if (error) throw error

      // Créer les réponses du feedback
      if (feedback.responses.length > 0) {
        await Promise.all(
          feedback.responses.map(async (response) => {
            const { error: responseError } = await supabase
              .from('feedback_responses')
              .insert({
                feedback_id: data.id,
                question_id: response.question_id,
                question_text: response.question_text,
                question_type: response.question_type,
                response: response.response
              })

            if (responseError) throw responseError
          })
        )
      }

      return {
        ...data,
        responses: feedback.responses
      }
    } catch (error) {
      console.error('Error creating weekly feedback:', error)
      throw error
    }
  }

  // Envoyer un feedback à un client
  static async sendFeedbackToClient(feedbackId: string, deadlineDays: number = 7): Promise<void> {
    try {
      // Calculer la deadline (par défaut 7 jours après l'envoi)
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + deadlineDays)
      
      const { error } = await supabase
        .from('feedbacks_hebdomadaires')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          deadline: deadline.toISOString()
        })
        .eq('id', feedbackId)

      if (error) throw error
    } catch (error) {
      console.error('Error sending feedback to client:', error)
      throw error
    }
  }

  // Récupérer les feedbacks d'un client
  static async getClientFeedbacks(clientId: string): Promise<WeeklyFeedback[]> {
    try {
      console.log('🔍 Récupération feedbacks pour client:', clientId)
      
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('feedbacks_hebdomadaires')
        .select('*')
        .eq('client_id', clientId)
        .order('week_start', { ascending: false })

      if (feedbacksError) {
        console.error('❌ Erreur récupération feedbacks:', feedbacksError)
        throw feedbacksError
      }

      console.log('📋 Feedbacks trouvés:', feedbacks.length)

      // Les réponses sont maintenant stockées directement dans le champ responses du feedback
      const feedbacksWithResponses = feedbacks.map((feedback) => {
        console.log(`🔍 Feedback ${feedback.id} - réponses dans le champ responses:`, feedback.responses?.length || 0)
        
        return {
          ...feedback,
          responses: feedback.responses || []
        }
      })

      console.log('✅ Tous les feedbacks avec réponses récupérés')
      return feedbacksWithResponses
    } catch (error) {
      console.error('❌ Erreur récupération feedbacks client:', error)
      throw error
    }
  }

  // Récupérer les feedbacks d'un coach
  static async getCoachFeedbacks(coachId: string): Promise<WeeklyFeedback[]> {
    try {
      console.log('🔍 Service: Récupération feedbacks pour coach:', coachId)
      
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('feedbacks_hebdomadaires')
        .select(`
          *,
          clients!inner(first_name, last_name, contact)
        `)
        .eq('coach_id', coachId)
        .order('week_start', { ascending: false })

      console.log('📊 Service: Feedbacks bruts récupérés:', feedbacks)

      if (feedbacksError) throw feedbacksError

      // Les réponses sont maintenant stockées directement dans le champ responses du feedback
      const feedbacksWithResponses = feedbacks.map((feedback) => {
        console.log(`🔍 Feedback ${feedback.id} - réponses récupérées:`, feedback.responses)
        return {
          ...feedback,
          responses: feedback.responses || []
        }
      })

      console.log('📊 Tous les feedbacks avec réponses:', feedbacksWithResponses)
      return feedbacksWithResponses
    } catch (error) {
      console.error('Error fetching coach feedbacks:', error)
      throw error
    }
  }

  // Soumettre les réponses d'un client
  static async submitClientResponses(feedbackId: string, responses: Omit<FeedbackResponse, 'created_at'>[]): Promise<void> {
    try {
      console.log('🚀 Service: Soumission des réponses pour feedback:', feedbackId)
      console.log('📝 Réponses reçues:', responses)
      
      // Mettre à jour le statut du feedback avec les réponses stockées dans un champ JSONB
      const { error: statusError } = await supabase
        .from('feedbacks_hebdomadaires')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          responses: responses // Stocker les réponses directement dans le feedback
        })
        .eq('id', feedbackId)

      if (statusError) {
        console.error('❌ Erreur mise à jour statut et réponses:', statusError)
        console.error('❌ Détails de l\'erreur:', {
          code: statusError.code,
          message: statusError.message,
          details: statusError.details,
          hint: statusError.hint
        })
        throw statusError
      }

      console.log('✅ Statut feedback et réponses mis à jour avec succès')
      
      // Note: Les réponses sont maintenant stockées dans le champ responses du feedback principal
      // pour éviter les problèmes de RLS avec la table feedback_responses
      console.log('📝 Réponses stockées dans le champ responses du feedback principal')
      
      console.log('🎉 Réponses soumises avec succès')
    } catch (error) {
      console.error('❌ Erreur soumission réponses client:', error)
      throw error
    }
  }

  // Mettre à jour les réponses d'un client (pour modification)
  static async updateClientResponses(feedbackId: string, responses: Omit<FeedbackResponse, 'created_at'>[]): Promise<void> {
    try {
      console.log('🔄 Mise à jour des réponses pour feedback:', feedbackId)
      console.log('📝 Nouvelles réponses:', responses)
      
      // Mettre à jour le feedback avec les nouvelles réponses
      const { error: statusError } = await supabase
        .from('feedbacks_hebdomadaires')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          responses: responses // Stocker les réponses directement dans le feedback
        })
        .eq('id', feedbackId)

      if (statusError) {
        console.error('❌ Erreur mise à jour statut et réponses:', statusError)
        console.error('❌ Détails de l\'erreur:', {
          code: statusError.code,
          message: statusError.message,
          details: statusError.details,
          hint: statusError.hint
        })
        throw statusError
      }

      console.log('✅ Feedback et réponses mis à jour avec succès')
      
      // Note: Les réponses sont maintenant stockées dans le champ responses du feedback principal
      // pour éviter les problèmes de RLS avec la table feedback_responses
      console.log('📝 Réponses mises à jour dans le champ responses du feedback principal')

      console.log('✅ Réponses mises à jour avec succès')
    } catch (error) {
      console.error('❌ Erreur mise à jour réponses client:', error)
      throw error
    }
  }

  // ===== STATISTIQUES ET DASHBOARD =====

  // Récupérer les statistiques d'un coach
  static async getCoachStats(coachId: string): Promise<FeedbackStats> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('feedbacks_hebdomadaires')
        .select('*')
        .eq('coach_id', coachId)

      if (error) throw error

      const total_sent = feedbacks.filter(f => f.status === 'sent' || f.status === 'in_progress' || f.status === 'completed').length
      const total_completed = feedbacks.filter(f => f.status === 'completed').length
      const completion_rate = total_sent > 0 ? (total_completed / total_sent) * 100 : 0
      
      // Calculer le score moyen
      const completedFeedbacks = feedbacks.filter(f => f.status === 'completed' && f.score)
      const average_score = completedFeedbacks.length > 0 
        ? completedFeedbacks.reduce((sum, f) => sum + (f.score || 0), 0) / completedFeedbacks.length 
        : 0

      // Tendances hebdomadaires (dernières 8 semaines)
      const weekly_trend = this.calculateWeeklyTrend(feedbacks)

      return {
        total_sent,
        total_completed,
        completion_rate: Math.round(completion_rate),
        average_score: Math.round(average_score),
        weekly_trend
      }
    } catch (error) {
      console.error('Error fetching coach stats:', error)
      throw error
    }
  }

  // Calculer les tendances hebdomadaires
  private static calculateWeeklyTrend(feedbacks: WeeklyFeedback[]) {
    const weeks = []
    const today = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7))
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Lundi
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]
      
      const weekFeedbacks = feedbacks.filter(f => 
        f.week_start === weekStartStr && f.week_end === weekEndStr
      )
      
      weeks.push({
        week: weekStartStr,
        sent: weekFeedbacks.filter(f => f.status !== 'draft').length,
        completed: weekFeedbacks.filter(f => f.status === 'completed').length,
        score: weekFeedbacks.filter(f => f.status === 'completed' && f.score).length > 0
          ? weekFeedbacks.filter(f => f.status === 'completed' && f.score)
              .reduce((sum, f) => sum + (f.score || 0), 0) / 
              weekFeedbacks.filter(f => f.status === 'completed' && f.score).length
          : 0
      })
    }
    
    return weeks
  }

  // Récupérer le dashboard complet d'un coach
  static async getCoachDashboard(coachId: string): Promise<CoachFeedbackDashboard> {
    try {
      const [stats, feedbacks] = await Promise.all([
        this.getCoachStats(coachId),
        this.getCoachFeedbacks(coachId)
      ])

      // Résumé des clients
      const clientsSummary = await this.getClientsSummary(coachId)

      // Feedbacks récents (dernière semaine)
      const recentFeedbacks = feedbacks.filter(f => {
        const weekStart = new Date(f.week_start)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - weekStart.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      })

      // Deadlines à venir (cette semaine)
      const upcomingDeadlines = feedbacks.filter(f => f.status === 'sent' && f.week_end >= new Date().toISOString().split('T')[0])

      return {
        stats,
        clients_summary: clientsSummary,
        recent_feedbacks: recentFeedbacks,
        upcoming_deadlines: upcomingDeadlines
      }
    } catch (error) {
      console.error('Error fetching coach dashboard:', error)
      throw error
    }
  }

  // Récupérer le résumé des clients d'un coach
  private static async getClientsSummary(coachId: string): Promise<ClientFeedbackSummary[]> {
    try {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, contact')
        .eq('coach_id', coachId)

      if (clientsError) throw clientsError

      const clientsSummary = await Promise.all(
        clients.map(async (client) => {
          const clientFeedbacks = await this.getClientFeedbacks(client.id)
          
          const total_feedbacks = clientFeedbacks.length
          const completed_feedbacks = clientFeedbacks.filter(f => f.status === 'completed')
          const completion_rate = total_feedbacks > 0 ? (completed_feedbacks.length / total_feedbacks) * 100 : 0
          
          const scores = completed_feedbacks.filter(f => f.score).map(f => f.score || 0)
          const average_score = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
          
          const last_feedback = completed_feedbacks.length > 0 ? completed_feedbacks[0].completed_at : undefined

          return {
            client_id: client.id,
            client_name: `${client.first_name} ${client.last_name}`,
            client_email: client.contact,
            last_feedback_date: last_feedback,
            completion_rate: Math.round(completion_rate),
            average_score: Math.round(average_score),
            total_feedbacks
          }
        })
      )

      return clientsSummary
    } catch (error) {
      console.error('Error fetching clients summary:', error)
      throw error
    }
  }

  // ===== AUTOMATISATION HEBDOMADAIRE =====

  // Programmer l'envoi automatique des feedbacks
  static async scheduleWeeklyFeedbacks(coachId: string, templateId: string, clientIds: string[]): Promise<void> {
    try {
      const today = new Date()
      const weekStart = this.getWeekStart(today)
      const weekEnd = this.getWeekEnd(today)

      // Créer les feedbacks pour chaque client
      await Promise.all(
        clientIds.map(async (clientId) => {
          await this.createWeeklyFeedback({
            client_id: clientId,
            coach_id: coachId,
            template_id: templateId,
            week_start: weekStart,
            week_end: weekEnd,
            status: 'draft',
            responses: []
          })
        })
      )
    } catch (error) {
      console.error('Error scheduling weekly feedbacks:', error)
      throw error
    }
  }

  // Obtenir le début de la semaine (lundi)
  private static getWeekStart(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  // Obtenir la fin de la semaine (dimanche)
  private static getWeekEnd(date: Date): string {
    const monday = new Date(this.getWeekStart(date))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sunday.toISOString().split('T')[0]
  }

  // Créer et envoyer immédiatement des feedbacks pour une semaine donnée
  static async createAndSendWeeklyFeedbacks(coachId: string, templateId: string, clientIds: string[], weekStart: string, weekEnd: string, deadlineDays: number = 7): Promise<void> {
    try {
      console.log('🚀 Service: Création feedbacks pour', clientIds.length, 'clients')
      console.log('📋 Paramètres reçus:', {
        coachId,
        templateId,
        clientIds,
        weekStart,
        weekEnd,
        deadlineDays
      })
      
      // Vérifier que le template existe
      const { data: template, error: templateError } = await supabase
        .from('feedback_templates')
        .select('id, name')
        .eq('id', templateId)
        .single()

      if (templateError) {
        console.error('❌ Template non trouvé:', templateError)
        throw new Error(`Template non trouvé: ${templateError.message}`)
      }

      console.log('✅ Template trouvé:', template)

      // Vérifier que les clients existent
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, contact')
        .in('id', clientIds)

      if (clientsError) {
        console.error('❌ Erreur récupération clients:', clientsError)
        throw new Error(`Erreur récupération clients: ${clientsError.message}`)
      }

      console.log('✅ Clients trouvés:', clients)
      
      // Créer les feedbacks un par un pour mieux gérer les erreurs
      for (const clientId of clientIds) {
        console.log('📝 Création feedback pour client:', clientId)
        
        const { data, error } = await supabase
          .from('feedbacks_hebdomadaires')
          .insert({
            client_id: clientId,
            coach_id: coachId,
            template_id: templateId,
            week_start: weekStart,
            week_end: weekEnd,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Erreur création feedback pour client', clientId, ':', error)
          console.error('❌ Détails de l\'erreur:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }
        
        console.log('✅ Feedback créé pour client', clientId, ':', data)
      }
      
      console.log('🎉 Tous les feedbacks ont été créés avec succès')
    } catch (error) {
      console.error('❌ Erreur création et envoi feedbacks:', error)
      throw error
    }
  }
}

export default WeeklyFeedbackService
