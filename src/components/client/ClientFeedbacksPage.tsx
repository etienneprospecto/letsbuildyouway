import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { WeeklyFeedbackService } from '@/services/weeklyFeedbackService'
import { ClientService } from '@/services/clientService'
import { WeeklyFeedback, FeedbackResponse, FeedbackTemplate } from '@/types/feedback'
import { toast } from '@/hooks/use-toast'
import FeedbackForm from './FeedbackForm'
import { supabase } from '@/lib/supabase'

const ClientFeedbacksPage: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // États des données
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedback[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())
  const [currentFeedback, setCurrentFeedback] = useState<WeeklyFeedback | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<FeedbackTemplate | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    if (user?.id) {
      loadFeedbacks()
    }
  }, [user?.id])

  // Recalcule le feedback de la semaine lorsqu'on change de semaine ou quand la liste change
  useEffect(() => {
    const weekStart = getWeekStart(selectedWeek).toISOString().split('T')[0]
    const weekEnd = getWeekEnd(selectedWeek).toISOString().split('T')[0]
    const weekFeedback = feedbacks.find((f: WeeklyFeedback) => f.week_start === weekStart && f.week_end === weekEnd) || null
    setCurrentFeedback(weekFeedback)
  }, [selectedWeek, feedbacks])

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      console.log('🔍 Chargement feedbacks pour user:', user?.id, user?.email)
      
      if (!user?.email) throw new Error('Email utilisateur introuvable')
      console.log('📧 Recherche client avec email:', user.email)
      
      const client = await ClientService.getClientByEmail(user.email)
      console.log('👤 Client trouvé:', client)
      
      if (!client) {
        console.log('❌ Aucun client trouvé pour cet email')
        setFeedbacks([])
        setCurrentFeedback(null)
        return
      }

      console.log('📊 Récupération feedbacks pour client.id:', client.id)
      const feedbacksData = await WeeklyFeedbackService.getClientFeedbacks(client.id)
      console.log('📋 Feedbacks récupérés:', feedbacksData)
      setFeedbacks(feedbacksData)

      const weekStart = getWeekStart(selectedWeek).toISOString().split('T')[0]
      const weekEnd = getWeekEnd(selectedWeek).toISOString().split('T')[0]
      console.log('🗓️ Semaine recherchée:', weekStart, 'à', weekEnd)
      
      const weekFeedback = feedbacksData.find((f: WeeklyFeedback) => f.week_start === weekStart && f.week_end === weekEnd) || null
      console.log('🎯 Feedback de la semaine trouvé:', weekFeedback)
      setCurrentFeedback(weekFeedback)

      // Si on a un feedback, récupérer son template avec les questions
      if (weekFeedback) {
        try {
          const { data: templateData, error: templateError } = await supabase
            .from('feedback_templates')
            .select(`
              *,
              feedback_questions(*)
            `)
            .eq('id', weekFeedback.template_id)
            .single()

          if (templateError) throw templateError
          
          const template: FeedbackTemplate = {
            ...templateData,
            questions: templateData.feedback_questions || []
          }
          
          console.log('📝 Template récupéré:', template)
          setCurrentTemplate(template)
        } catch (error) {
          console.error('❌ Erreur récupération template:', error)
        }
      } else {
        setCurrentTemplate(null)
      }
    } catch (error) {
      console.error('❌ Erreur chargement feedbacks:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos feedbacks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Navigation hebdomadaire
  const goToPreviousWeek = () => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(selectedWeek.getDate() - 7)
    setSelectedWeek(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(selectedWeek.getDate() + 7)
    setSelectedWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date())
  }

  // Utilitaires de date
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday
  }

  const getWeekEnd = (date: Date): Date => {
    const monday = new Date(getWeekStart(date))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sunday
  }

  const formatWeekRange = (date: Date): string => {
    const start = getWeekStart(date)
    const end = getWeekEnd(date)
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes Feedbacks Hebdomadaires</h1>
      </div>

      {/* Navigation hebdomadaire */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Navigation hebdomadaire</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg border hover:bg-gray-50"
            >
              ← Semaine précédente
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cette semaine
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg border hover:bg-gray-50"
            >
              Semaine suivante →
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {formatWeekRange(selectedWeek)}
          </p>
        </div>
      </div>

      {/* Feedback de la semaine */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Feedback de cette semaine</h3>
        {currentFeedback ? (
          currentFeedback.status === 'completed' ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <p className="font-medium text-blue-800">
                  ✅ Feedback terminé pour cette semaine
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Merci d'avoir complété le feedback !
                </p>
                {currentFeedback.score && (
                  <div className="mt-3 p-3 bg-blue-100 rounded">
                    <p className="text-sm font-medium">Score global: {currentFeedback.score}/100</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="font-medium text-green-800">
                  📝 Feedback disponible pour cette semaine
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {currentFeedback.status === 'sent' ? 'Cliquez pour remplir le formulaire' : 'En cours de traitement...'}
                </p>
                {currentFeedback.status === 'sent' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📋 Remplir le formulaire
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-gray-600">
              Aucun feedback disponible pour cette semaine
            </p>
          </div>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Historique des feedbacks</h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">Aucun feedback dans l'historique</p>
        ) : (
          <div className="space-y-2">
            {feedbacks.map(feedback => (
              <div key={feedback.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">
                    Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Statut: {feedback.status}
                  </p>
                </div>
                <div className="text-right">
                  {feedback.score && (
                    <p className="font-medium text-blue-600">
                      Score: {feedback.score}/100
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal du formulaire */}
      {showForm && currentTemplate && currentFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Formulaire de feedback</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <FeedbackForm
              template={currentTemplate}
              onSubmit={async (responses) => {
                try {
                  console.log('📝 Soumission des réponses:', responses)
                  
                  // Convertir les réponses au format attendu par le service
                  const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
                    question_id: questionId,
                    question_text: currentTemplate.questions.find(q => q.id === questionId)?.question_text || '',
                    question_type: currentTemplate.questions.find(q => q.id === questionId)?.question_type || 'text',
                    response
                  }))
                  
                  console.log('📊 Réponses formatées:', responsesArray)
                  
                  // Soumettre via le service
                  await WeeklyFeedbackService.submitClientResponses(currentFeedback.id, responsesArray)
                  
                  console.log('✅ Réponses soumises avec succès')
                  
                  toast({
                    title: "Succès",
                    description: "Feedback soumis avec succès !"
                  })
                  
                  // Fermer le formulaire et recharger les données
                  setShowForm(false)
                  await loadFeedbacks()
                  
                } catch (error) {
                  console.error('❌ Erreur soumission feedback:', error)
                  toast({
                    title: "Erreur",
                    description: "Impossible de soumettre le feedback",
                    variant: "destructive"
                  })
                }
              }}
              loading={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientFeedbacksPage
