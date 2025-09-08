import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { WeeklyFeedbackService } from '@/services/weeklyFeedbackService'
import { ClientService } from '@/services/clientService'
import { 
  FeedbackTemplate, 
  WeeklyFeedback
} from '@/types/feedback'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import FeedbackTemplateModal from './FeedbackTemplateModal'
import SendFeedbackModal from './SendFeedbackModal'

const CoachFeedbacksPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  
  // États des données
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([])
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedback[]>([])
  const [clients, setClients] = useState<any[]>([])

  // États des modals
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FeedbackTemplate | null>(null)
  const [showResponsesModal, setShowResponsesModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<WeeklyFeedback | null>(null)
  const [clientResponses, setClientResponses] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Chargement dashboard pour coach:', user!.id)
      
      const [templatesData, feedbacksData, clientsData] = await Promise.all([
        WeeklyFeedbackService.getCoachTemplates(user!.id),
        WeeklyFeedbackService.getCoachFeedbacks(user!.id),
        ClientService.getClientsByCoach(user!.id)
      ])

      console.log('📝 Templates récupérés:', templatesData)
      console.log('📋 Feedbacks récupérés:', feedbacksData)
      console.log('👥 Clients récupérés:', clientsData)

      setTemplates(templatesData)
      setFeedbacks(feedbacksData)
      setClients(clientsData)
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Gestion des modals
  const handleCreateTemplate = async (templateData: Omit<FeedbackTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🎯 Création template:', templateData)
      console.log('👤 Coach ID:', user!.id)
      
      const newTemplate = await WeeklyFeedbackService.createTemplate({
        ...templateData,
        coach_id: user!.id
      })
      
      console.log('✅ Template créé:', newTemplate)
      setTemplates(prev => [newTemplate, ...prev])
      setShowTemplateModal(false)
      toast({
        title: "Succès",
        description: "Template créé avec succès"
      })
    } catch (error) {
      console.error('❌ Erreur création template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTemplate = async (templateData: FeedbackTemplate) => {
    try {
      console.log('🔄 Mise à jour template:', templateData)
      
      const updatedTemplate = await WeeklyFeedbackService.updateTemplate(templateData.id, templateData)
      
      console.log('✅ Template mis à jour:', updatedTemplate)
      
      // Mettre à jour la liste des templates
      setTemplates(prev => prev.map(t => t.id === templateData.id ? updatedTemplate : t))
      
      // Fermer le modal et réinitialiser
      setShowTemplateModal(false)
      setEditingTemplate(null)
      
      // Recharger les données pour s'assurer de la synchronisation
      await loadDashboardData()
      
      toast({
        title: "Succès",
        description: "Template mis à jour avec succès"
      })
    } catch (error) {
      console.error('❌ Erreur mise à jour template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.')) {
      return
    }

    try {
      console.log('🗑️ Suppression template:', templateId)
      
      await WeeklyFeedbackService.deleteTemplate(templateId)
      
      console.log('✅ Template supprimé')
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast({
        title: "Succès",
        description: "Template supprimé avec succès"
      })
    } catch (error) {
      console.error('❌ Erreur suppression template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      })
    }
  }

  const handleEditTemplate = (template: FeedbackTemplate) => {
    setEditingTemplate(template)
    setShowTemplateModal(true)
  }

  const handleSendFeedback = async (data: {
    templateId: string
    clientIds: string[]
    weekStart: string
    weekEnd: string
    message?: string
  }) => {
    try {
      console.log('🚀 Début envoi feedback:', data)
      console.log('👤 Coach ID:', user!.id)
      
      await WeeklyFeedbackService.createAndSendWeeklyFeedbacks(
        user!.id,
        data.templateId,
        data.clientIds,
        data.weekStart,
        data.weekEnd
      )
      
      console.log('✅ Feedback envoyé avec succès')
      setShowSendModal(false)
      toast({
        title: "Succès",
        description: "Feedback envoyé avec succès"
      })
      await loadDashboardData()
    } catch (error) {
      console.error('❌ Erreur envoi feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback",
        variant: "destructive"
      })
    }
  }

  const viewClientResponses = async (feedbackId: string) => {
    try {
      console.log('🔍 Consultation réponses pour feedback:', feedbackId)
      const feedback = feedbacks.find(f => f.id === feedbackId)
      if (!feedback) {
        toast({
          title: "Erreur",
          description: "Feedback non trouvé",
          variant: "destructive"
        })
        return
      }

      setSelectedFeedback(feedback)
      
      // Récupérer les réponses du client
      const { data: responses, error } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erreur récupération réponses:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les réponses",
          variant: "destructive"
        })
        return
      }

      console.log('📊 Réponses récupérées:', responses)
      setClientResponses(responses || [])
      setShowResponsesModal(true)
    } catch (error) {
      console.error('❌ Erreur consultation réponses:', error)
      toast({
        title: "Erreur",
        description: "Impossible de consulter les réponses",
        variant: "destructive"
      })
    }
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
        <h1 className="text-3xl font-bold">Feedbacks Hebdomadaires</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nouveau Template
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Envoyer Feedback
          </button>
        </div>
      </div>


      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['dashboard', 'templates', 'cette-semaine', 'historique', 'reponses'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'templates' && 'Templates'}
                {tab === 'cette-semaine' && 'Cette semaine'}
                {tab === 'historique' && 'Historique'}
                {tab === 'reponses' && 'Réponses'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Clients disponibles</h3>
                {clients.length === 0 ? (
                  <p className="text-gray-500">Aucun client trouvé</p>
                ) : (
                  <div className="space-y-2">
                    {clients.map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded bg-white">
                        <div>
                          <p className="font-medium">{client.first_name} {client.last_name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Templates de feedback</h3>
                <button
                  onClick={() => {
                    setEditingTemplate(null)
                    setShowTemplateModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Nouveau Template
                </button>
              </div>
              {templates.length === 0 ? (
                <p className="text-gray-500">Aucun template créé</p>
              ) : (
                <div className="grid gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {template.questions.length} questions • Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cette semaine Tab */}
          {activeTab === 'cette-semaine' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Feedbacks de cette semaine</h3>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Envoyer Feedback
                </button>
              </div>
              {feedbacks.filter(f => f.status === 'sent' || f.status === 'in_progress').length === 0 ? (
                <p className="text-gray-500">Aucun feedback envoyé cette semaine</p>
              ) : (
                <div className="space-y-3">
                  {feedbacks
                    .filter(f => f.status === 'sent' || f.status === 'in_progress')
                    .map(feedback => {
                      const client = clients.find(c => c.id === feedback.client_id)
                      return (
                        <div 
                          key={feedback.id} 
                          className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => viewClientResponses(feedback.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">
                                {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                              </p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                feedback.status === 'sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {feedback.status === 'sent' ? 'Envoyé' : 'En cours'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Cliquer pour voir les détails →
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* Historique Tab */}
          {activeTab === 'historique' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historique des feedbacks</h3>
              {feedbacks.filter(f => f.status === 'completed').length === 0 ? (
                <p className="text-gray-500">Aucun feedback complété</p>
              ) : (
                <div className="space-y-3">
                  {feedbacks
                    .filter(f => f.status === 'completed')
                    .map(feedback => {
                      const client = clients.find(c => c.id === feedback.client_id)
                      return (
                        <div 
                          key={feedback.id} 
                          className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => viewClientResponses(feedback.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">
                                {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Complété
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Cliquer pour voir les détails →
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* Réponses Tab */}
          {activeTab === 'reponses' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Réponses des clients</h3>
              {feedbacks.filter(f => f.status === 'completed').length === 0 ? (
                <p className="text-gray-500">Aucune réponse à consulter</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks
                    .filter(f => f.status === 'completed')
                    .map(feedback => {
                      const client = clients.find(c => c.id === feedback.client_id)
                      return (
                        <div 
                          key={feedback.id} 
                          className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => viewClientResponses(feedback.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">
                                {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mt-1">
                                Complété
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Cliquer pour voir les détails →
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FeedbackTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false)
          setEditingTemplate(null)
        }}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        template={editingTemplate}
      />

      <SendFeedbackModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        templates={templates}
        clients={clients}
        onSend={handleSendFeedback}
      />

      {/* Modal des réponses client */}
      {showResponsesModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Réponses du client</h2>
              <button
                onClick={() => {
                  setShowResponsesModal(false)
                  setSelectedFeedback(null)
                  setClientResponses([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {clientResponses.length === 0 ? (
              <p className="text-gray-500">Aucune réponse trouvée</p>
            ) : (
              <div className="space-y-4">
                {clientResponses.map((response, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-2">{response.question_text}</h4>
                    <div className="text-sm text-gray-600">
                      <strong>Type:</strong> {response.question_type}
                    </div>
                    <div className="mt-2">
                      <strong>Réponse:</strong>
                      <div className="mt-1 p-2 bg-white border rounded">
                        {response.question_type === 'multiple_choice' && Array.isArray(response.response) ? (
                          <ul className="list-disc list-inside">
                            {response.response.map((choice: string, i: number) => (
                              <li key={i}>{choice}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{response.response}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Répondu le {new Date(response.created_at).toLocaleDateString('fr-FR')} à {new Date(response.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoachFeedbacksPage
