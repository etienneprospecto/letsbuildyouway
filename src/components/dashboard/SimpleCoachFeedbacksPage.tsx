import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { WeeklyFeedbackService } from '@/services/weeklyFeedbackService'
import { ClientService } from '@/services/clientService'
import { FeedbackTemplate } from '@/types/feedback'
import SendFeedbackModal from './SendFeedbackModal'

const SimpleCoachFeedbacksPage: React.FC = () => {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showSendModal, setShowSendModal] = useState(false)

  const loadData = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      console.log('🔍 Chargement des données pour coach:', user.id)
      
      const [feedbacksData, templatesData, clientsData] = await Promise.all([
        supabase
          .from('feedbacks_hebdomadaires')
          .select(`
            *,
            clients!inner(first_name, last_name, contact)
          `)
          .eq('coach_id', user.id)
          .order('week_start', { ascending: false }),
        WeeklyFeedbackService.getCoachTemplates(user.id),
        ClientService.getClientsByCoach(user.id)
      ])

      if (feedbacksData.error) {
        console.error('❌ Erreur récupération feedbacks:', feedbacksData.error)
        throw feedbacksData.error
      }

      console.log('📊 Feedbacks récupérés:', feedbacksData.data)
      console.log('📝 Templates récupérés:', templatesData)
      console.log('👥 Clients récupérés:', clientsData)
      
      // Debug détaillé de chaque feedback
      feedbacksData.data.forEach((feedback: any) => {
        console.log(`\n📋 Feedback ${feedback.id}:`, {
          status: feedback.status,
          responses: feedback.responses,
          responsesType: typeof feedback.responses,
          responsesLength: feedback.responses?.length || 0,
          completed_at: feedback.completed_at,
          client: feedback.clients
        })
      })

      setFeedbacks(feedbacksData.data)
      setTemplates(templatesData)
      setClients(clientsData)
    } catch (error) {
      console.error('❌ Erreur chargement données:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }


  const handleSendFeedback = async (data: {
    templateId: string
    clientIds: string[]
    weekStart: string
    weekEnd: string
    message?: string
  }) => {
    try {
      console.log('🚀 Envoi de feedback:', data)
      
      await WeeklyFeedbackService.createAndSendWeeklyFeedbacks(
        user!.id,
        data.templateId,
        data.clientIds,
        data.weekStart,
        data.weekEnd
      )
      
      toast({
        title: "Succès",
        description: "Feedback envoyé avec succès"
      })
      
      setShowSendModal(false)
      await loadData()
    } catch (error) {
      console.error('❌ Erreur envoi feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feedbacks Clients</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📤 Envoyer Feedback
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Recharger
          </button>
        </div>
      </div>

      {/* Stats simples */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{feedbacks.length}</div>
          <div className="text-sm text-gray-600">Total Feedbacks</div>
              </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {feedbacks.filter(f => f.status === 'completed').length}
              </div>
          <div className="text-sm text-gray-600">Complétés</div>
            </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {feedbacks.filter(f => f.status === 'sent').length}
              </div>
          <div className="text-sm text-gray-600">Envoyés</div>
              </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {feedbacks.filter(f => f.responses && f.responses.length > 0).length}
            </div>
          <div className="text-sm text-gray-600">Avec Réponses</div>
            </div>
      </div>

      {/* Liste des feedbacks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tous les Feedbacks</h2>
        
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun feedback trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
            {feedbacks.map(feedback => {
              const client = feedback.clients
              const hasResponses = feedback.responses && feedback.responses.length > 0
              
              return (
                <div 
                  key={feedback.id} 
                  className={`border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow ${
                    hasResponses ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {client?.first_name} {client?.last_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          feedback.status === 'completed' ? 'bg-green-100 text-green-800' :
                          feedback.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.status}
                            </span>
                        {hasResponses && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {feedback.responses.length} réponse{feedback.responses.length > 1 ? 's' : ''}
                            </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                                  Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                                </p>
                      
                      {hasResponses && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h4 className="font-medium text-green-800 mb-2">Réponses du client :</h4>
                          {feedback.responses.map((response: any, index: number) => (
                            <div key={index} className="mb-2">
                              <p className="text-sm font-medium text-gray-700">
                                {response.question_text}
                              </p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                                "{response.response}"
                              </p>
                            </div>
                          ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
      </div>

      {/* Modal d'envoi de feedback */}
      {showSendModal && (
      <SendFeedbackModal
        isOpen={showSendModal}
        templates={templates}
        clients={clients}
        onSend={handleSendFeedback}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  )
}

export default SimpleCoachFeedbacksPage