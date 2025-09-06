import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { WeeklyFeedbackService } from '@/services/weeklyFeedbackService'
import { ClientService } from '@/services/clientService'
import { WeeklyFeedback, FeedbackTemplate } from '@/types/feedback'
import { toast } from '@/hooks/use-toast'
import FeedbackForm from './FeedbackForm'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Star
} from 'lucide-react'

const ClientFeedbacksPage: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [currentFeedback, setCurrentFeedback] = useState<WeeklyFeedback | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<FeedbackTemplate | null>(null)
  const [pastFeedbacks, setPastFeedbacks] = useState<WeeklyFeedback[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showPastFeedbackDetails, setShowPastFeedbackDetails] = useState(false)
  const [selectedPastFeedback, setSelectedPastFeedback] = useState<WeeklyFeedback | null>(null)
  const [selectedPastTemplate, setSelectedPastTemplate] = useState<FeedbackTemplate | null>(null)

  // Fonctions utilitaires pour les dates
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuster pour lundi
    return new Date(d.setDate(diff))
  }

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  }

  const formatWeekRange = (date: Date) => {
    const start = getWeekStart(date)
    const end = getWeekEnd(date)
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
  }

  const loadFeedbacks = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log('🔄 Chargement des feedbacks pour la semaine:', formatWeekRange(currentWeek))

      // Récupérer le client par email
      const client = await ClientService.getClientByEmail(user.email || '')
      if (!client) {
        console.error('❌ Client non trouvé')
        return
      }

      console.log('👤 Client trouvé:', client.id)

      // Debug: Vérifier les tables disponibles
      console.log('🔍 Vérification des tables...')
      
      // Test simple pour voir si weekly_feedbacks existe
      const { data: testData, error: testError } = await supabase
        .from('weekly_feedbacks')
        .select('id, client_id, week_start, week_start_date, week_end, week_end_date, created_at')
        .limit(5)
      
      console.log('📊 Test weekly_feedbacks:', { testData, testError })
      
      // Vérifier tous les feedbacks pour ce client
      const { data: allFeedbacks, error: allError } = await supabase
        .from('weekly_feedbacks')
        .select('*')
        .eq('client_id', client.id)
      
      console.log('📋 Tous les feedbacks pour ce client:', { allFeedbacks, allError })
      
      // Vérifier aussi dans feedbacks_hebdomadaires
      const { data: hebdoFeedbacks, error: hebdoError } = await supabase
        .from('feedbacks_hebdomadaires')
        .select('*')
        .eq('client_id', client.id)
      
      console.log('📋 Feedbacks dans feedbacks_hebdomadaires:', { hebdoFeedbacks, hebdoError })

      // Récupérer les feedbacks de la semaine courante
      const weekStart = getWeekStart(currentWeek)
      const weekEnd = getWeekEnd(currentWeek)
      
      console.log('📅 Période:', weekStart.toISOString(), 'à', weekEnd.toISOString())

      // Utiliser directement feedbacks_hebdomadaires puisque c'est là que sont les données
      const { data: currentFeedbacks, error: currentError } = await supabase
        .from('feedbacks_hebdomadaires')
        .select(`
          *,
          feedback_templates (
            id,
            name,
            description
          )
        `)
        .eq('client_id', client.id)
        .gte('week_start', weekStart.toISOString().split('T')[0])
        .lte('week_end', weekEnd.toISOString().split('T')[0])

      if (currentError) {
        console.error('❌ Erreur récupération feedbacks courants:', currentError)
        throw currentError
      }

      console.log('📊 Feedbacks courants trouvés:', currentFeedbacks?.length || 0)
      if (currentFeedbacks && currentFeedbacks.length > 0) {
        console.log('📋 Détails du feedback courant:', currentFeedbacks[0])
      }

      // Récupérer les feedbacks passés depuis feedbacks_hebdomadaires
      const { data: pastFeedbacksData, error: pastError } = await supabase
        .from('feedbacks_hebdomadaires')
        .select(`
          *,
          feedback_templates (
            id,
            name,
            description
          )
        `)
        .eq('client_id', client.id)
        .lt('week_start', weekStart.toISOString().split('T')[0])
        .order('week_start', { ascending: false })
        .limit(10)

      if (pastError) {
        console.error('❌ Erreur récupération feedbacks passés:', pastError)
        throw pastError
      }

      console.log('📈 Feedbacks passés trouvés:', pastFeedbacksData?.length || 0)

      // Traiter les données
      const processedCurrentFeedbacks = currentFeedbacks?.map((feedback: any) => ({
        ...feedback,
        template: feedback.feedback_templates
      })) || []

      const processedPastFeedbacks = pastFeedbacksData?.map((feedback: any) => ({
        ...feedback,
        template: feedback.feedback_templates
      })) || []

      setPastFeedbacks(processedPastFeedbacks)

      // Définir le feedback courant
      if (processedCurrentFeedbacks.length > 0) {
        const current = processedCurrentFeedbacks[0]
        setCurrentFeedback(current)
        
        // Récupérer le template complet avec ses questions
        if (current.template_id) {
          try {
            const { data: template, error: templateError } = await supabase
              .from('feedback_templates')
              .select(`
                *,
                feedback_questions (
                  id,
                  question_text,
                  question_type,
                  order_index,
                  required,
                  options
                )
              `)
              .eq('id', current.template_id)
              .single()

            if (!templateError && template) {
              const templateWithQuestions = {
                ...template,
                questions: template.feedback_questions?.map((q: any) => ({
                  id: q.id,
                  question_text: q.question_text,
                  question_type: q.question_type,
                  required: q.required,
                  options: q.options
                })) || []
              }
              setCurrentTemplate(templateWithQuestions)
            }
          } catch (error) {
            console.error('❌ Erreur récupération template courant:', error)
          }
        }
        
        console.log('✅ Feedback courant défini:', current.id)
      } else {
        setCurrentFeedback(null)
        setCurrentTemplate(null)
        console.log('ℹ️ Aucun feedback pour cette semaine')
      }

    } catch (error) {
      console.error('❌ Erreur chargement feedbacks:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les feedbacks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [user, currentWeek])

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }


  const handlePastFeedbackClick = async (feedback: WeeklyFeedback) => {
    try {
      console.log('🔍 Ouverture détails feedback:', feedback.id)
      
      // Récupérer le template complet avec ses questions
      const { data: template, error: templateError } = await supabase
        .from('feedback_templates')
        .select(`
          *,
          feedback_questions (
            id,
            question_text,
            question_type,
            order_index,
            required,
            options
          )
        `)
        .eq('id', feedback.template_id)
        .single()

      if (templateError) {
        console.error('❌ Erreur récupération template:', templateError)
        throw templateError
      }

      // Transformer les questions pour correspondre au format attendu
      const templateWithQuestions = {
        ...template,
        questions: template.feedback_questions?.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          required: q.required,
          options: q.options
        })) || []
      }

      setSelectedPastFeedback(feedback)
      setSelectedPastTemplate(templateWithQuestions)
      setShowPastFeedbackDetails(true)
      
    } catch (error) {
      console.error('❌ Erreur ouverture détails:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir les détails",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Hebdomadaire</h1>
          <p className="text-muted-foreground">Partagez votre expérience et suivez votre progression</p>
        </div>
      </div>

      {/* Navigation hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <span>Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Semaine précédente
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">Semaine actuelle</h3>
              <p className="text-sm text-muted-foreground">{formatWeekRange(currentWeek)}</p>
            </div>
            
            <Button variant="outline" onClick={goToNextWeek}>
              Semaine suivante
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <span>Feedback de cette semaine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentFeedback ? (
            <div className="space-y-4">
              {currentFeedback.status === 'completed' ? (
                <div 
                  className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => handlePastFeedbackClick(currentFeedback)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">Feedback complété !</h3>
                      <p className="text-sm text-green-600">Cliquez pour voir vos réponses</p>
                    </div>
                  </div>
                  
                  {currentFeedback.score && (
                    <div className="bg-white rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Score global</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-lg font-bold">{currentFeedback.score}/100</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            currentFeedback.score >= 80 ? 'bg-green-500' :
                            currentFeedback.score >= 60 ? 'bg-blue-500' :
                            currentFeedback.score >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${currentFeedback.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-right">
                    <span className="text-xs text-green-600 font-medium">Cliquez pour voir les détails →</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-800">Feedback disponible</h3>
                      <p className="text-sm text-blue-600">Partagez votre expérience de cette semaine</p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setShowForm(true)}>
                    Remplir le formulaire
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun feedback cette semaine</h3>
              <p className="text-muted-foreground">Votre coach n'a pas encore créé de feedback pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span>Historique des feedbacks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastFeedbacks.length > 0 ? (
            <div className="space-y-3">
              {pastFeedbacks.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handlePastFeedbackClick(feedback)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${
                        feedback.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : feedback.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {feedback.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : feedback.status === 'in_progress' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium">
                          Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(feedback.week_start).toLocaleDateString('fr-FR')} - {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {feedback.score && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{feedback.score}/100</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {feedback.status === 'completed' ? 'Terminé' : 
                         feedback.status === 'in_progress' ? 'En cours' : 
                         feedback.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
              <p className="text-muted-foreground">Vos feedbacks précédents apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal du formulaire */}
      {showForm && currentTemplate && currentFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl max-h-[95vh] overflow-hidden w-full">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold">Formulaire de feedback</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  <ChevronRight className="h-6 w-6 rotate-45" />
                </Button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
              <FeedbackForm
                template={currentTemplate}
                onSubmit={async (responses) => {
                  try {
                    console.log('📝 Soumission des réponses:', responses)
                    
                    // Convertir les réponses au format attendu par le service
                    const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
                      question_id: questionId,
                      question_text: currentTemplate.questions.find((q: any) => q.id === questionId)?.question_text || '',
                      question_type: currentTemplate.questions.find((q: any) => q.id === questionId)?.question_type || 'text',
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
        </div>
      )}

      {/* Modal des détails d'un feedback passé */}
      {showPastFeedbackDetails && selectedPastFeedback && selectedPastTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl max-h-[95vh] overflow-hidden w-full">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold">
                    Feedback de la semaine du {new Date(selectedPastFeedback.week_start).toLocaleDateString('fr-FR')}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPastFeedbackDetails(false)
                    setSelectedPastFeedback(null)
                    setSelectedPastTemplate(null)
                  }}
                >
                  <ChevronRight className="h-6 w-6 rotate-45" />
                </Button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
              {/* Informations du feedback */}
              <div className="mb-6 bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      {selectedPastFeedback.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : selectedPastFeedback.status === 'in_progress' ? (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Statut</p>
                    <p className="font-semibold">
                      {selectedPastFeedback.status === 'completed' ? 'Complété' : 
                       selectedPastFeedback.status === 'in_progress' ? 'En cours' : 
                       selectedPastFeedback.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Score global</p>
                    <p className="font-semibold">
                      {selectedPastFeedback.score ? `${selectedPastFeedback.score}/100` : 'Non évalué'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Période</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedPastFeedback.week_start).toLocaleDateString('fr-FR')} - {new Date(selectedPastFeedback.week_end).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions et réponses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span>Questions et réponses</span>
                </h3>
                
                {selectedPastTemplate.questions.map((question: any, index: number) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-2 py-1 rounded">
                          Question {index + 1}
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {question.question_type === 'text' ? '📝 Texte libre' :
                           question.question_type === 'scale_1_10' ? '📊 Échelle 1-10' :
                           question.question_type === 'multiple_choice' ? '☑️ Choix multiple' :
                           question.question_type === 'yes_no' ? '✅ Oui/Non' : '❓ Autre'}
                        </span>
                        {question.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                            Obligatoire
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold mb-3">{question.question_text}</p>
                      
                      {/* Affichage de la réponse */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="font-medium text-green-800">Votre réponse :</p>
                        </div>
                        
                        {question.question_type === 'scale_1_10' ? (
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-green-700">
                              {selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response || 'Non répondu'}
                            </div>
                            <div className="text-muted-foreground">/10</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response || 0) * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : question.question_type === 'multiple_choice' ? (
                          <div className="flex flex-wrap gap-2">
                            {(selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response || []).map((choice: string, i: number) => (
                              <span key={i} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                {choice}
                              </span>
                            ))}
                          </div>
                        ) : question.question_type === 'yes_no' ? (
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded text-sm font-semibold ${
                              selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response === 'yes' 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response === 'yes' ? '✅ Oui' : '❌ Non'}
                            </span>
                          </div>
                        ) : (
                          <p className="text-green-800 font-medium">
                            {selectedPastFeedback.responses?.find((r: any) => r.question_id === question.id)?.response || 'Non répondu'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientFeedbacksPage