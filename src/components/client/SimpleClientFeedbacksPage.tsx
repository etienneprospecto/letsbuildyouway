import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useWeek } from '@/providers/WeekProvider'
import { WeeklyFeedbackService } from '@/services/weeklyFeedbackService'
import { ClientService } from '@/services/clientService'
import { WeeklyFeedback, FeedbackTemplate } from '@/types/feedback'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import SimpleFeedbackForm from './SimpleFeedbackForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Star,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Target,
  Award,
  Zap,
  ArrowRight,
  Eye,
  Edit,
  Send,
  Download,
  Filter,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react'

const SimpleClientFeedbacksPage: React.FC = () => {
  const { user } = useAuth()
  const { 
    currentWeekStart, 
    goToPreviousWeek, 
    goToNextWeek, 
    formatWeekRange,
    isCurrentWeek
  } = useWeek()
  
  const [loading, setLoading] = useState(true)
  const [currentFeedback, setCurrentFeedback] = useState<WeeklyFeedback | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<FeedbackTemplate | null>(null)
  const [pastFeedbacks, setPastFeedbacks] = useState<WeeklyFeedback[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showPastFeedbackDetails, setShowPastFeedbackDetails] = useState(false)
  const [selectedPastFeedback, setSelectedPastFeedback] = useState<WeeklyFeedback | null>(null)
  const [selectedPastTemplate, setSelectedPastTemplate] = useState<FeedbackTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('current')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Statistiques calculées
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    completedFeedbacks: 0,
    averageScore: 0,
    currentStreak: 0,
    bestScore: 0,
    improvement: 0
  })

  const loadFeedbacks = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const client = await ClientService.getClientByEmail(user.email || '')
      if (!client) {
        console.error('❌ Client non trouvé')
        return
      }

      // Récupérer tous les feedbacks
      const { data: allFeedbacks, error } = await supabase
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
        .order('week_start', { ascending: false })

      if (error) throw error

      // Filtrer les feedbacks de la semaine courante
      const weekStart = currentWeekStart
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(currentWeekStart.getDate() + 6)
      
      const currentFeedbacks = allFeedbacks?.filter((feedback: any) => {
        const feedbackWeekStart = feedback.week_start
        return feedbackWeekStart === weekStart.toISOString().split('T')[0]
      }) || []

      const pastFeedbacksData = allFeedbacks?.filter((feedback: any) => {
        const feedbackWeekStart = feedback.week_start
        return feedbackWeekStart < weekStart.toISOString().split('T')[0]
      }) || []

      setPastFeedbacks(pastFeedbacksData)

      // Définir le feedback courant
      if (currentFeedbacks.length > 0) {
        const current = currentFeedbacks[0]
        setCurrentFeedback(current)
        
        // Récupérer le template complet
        if (current.template_id) {
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
        }
      } else {
        setCurrentFeedback(null)
        setCurrentTemplate(null)
      }

      // Calculer les statistiques
      calculateStats(allFeedbacks || [])

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

  const calculateStats = (feedbacks: any[]) => {
    const completedFeedbacks = feedbacks.filter(f => f.status === 'completed' && f.score)
    const totalFeedbacks = feedbacks.length
    const completedCount = completedFeedbacks.length
    
    const averageScore = completedCount > 0 
      ? Math.round(completedFeedbacks.reduce((sum, f) => sum + f.score, 0) / completedCount)
      : 0
    
    const bestScore = completedCount > 0 
      ? Math.max(...completedFeedbacks.map(f => f.score))
      : 0

    // Calculer l'amélioration (comparaison des 2 dernières semaines)
    const recentFeedbacks = completedFeedbacks.slice(0, 2)
    const improvement = recentFeedbacks.length === 2 
      ? recentFeedbacks[0].score - recentFeedbacks[1].score
      : 0

    // Calculer la série actuelle
    let currentStreak = 0
    for (let i = 0; i < completedFeedbacks.length; i++) {
      if (completedFeedbacks[i].status === 'completed') {
        currentStreak++
      } else {
        break
      }
    }

    setStats({
      totalFeedbacks,
      completedFeedbacks: completedCount,
      averageScore,
      currentStreak,
      bestScore,
      improvement
    })
  }

  useEffect(() => {
    loadFeedbacks()
  }, [user, currentWeekStart])

  const handlePastFeedbackClick = async (feedback: WeeklyFeedback) => {
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
        .eq('id', feedback.template_id)
        .single()

      if (templateError) throw templateError

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

  const filteredFeedbacks = pastFeedbacks.filter(feedback => {
    const matchesSearch = searchTerm === '' || 
      feedback.template?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.week_start?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || feedback.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback Hebdomadaire</h1>
            <p className="text-muted-foreground">Partagez votre expérience et suivez votre progression</p>
          </div>
          <Button onClick={loadFeedbacks} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complétés</p>
                  <p className="text-2xl font-bold">{stats.completedFeedbacks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score moyen</p>
                  <p className="text-2xl font-bold">{stats.averageScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amélioration</p>
                  <p className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation hebdomadaire améliorée */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPreviousWeek} className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Semaine précédente</span>
            </Button>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {isCurrentWeek(currentWeekStart) ? 'Semaine actuelle' : 'Semaine sélectionnée'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{formatWeekRange(currentWeekStart)}</p>
              {isCurrentWeek(currentWeekStart) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="h-3 w-3 mr-1" />
                  En cours
                </Badge>
              )}
            </div>
            
            <Button variant="outline" onClick={goToNextWeek} className="flex items-center space-x-2">
              <span>Semaine suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Cette semaine</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analyses</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Cette semaine */}
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Feedback de cette semaine</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentFeedback ? (
                <div className="space-y-4">
                  {currentFeedback.status === 'completed' ? (
                    <div 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                      onClick={() => handlePastFeedbackClick(currentFeedback)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-green-800">Feedback complété !</h3>
                          <p className="text-green-600">Cliquez pour voir vos réponses</p>
                        </div>
                      </div>
                      
                      {currentFeedback.score && (
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Score global</span>
                            <div className="flex items-center space-x-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <span className="text-2xl font-bold text-gray-900">{currentFeedback.score}/100</span>
                            </div>
                          </div>
                          <Progress value={currentFeedback.score} className="h-3" />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">Voir les détails</span>
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-blue-800">Feedback disponible</h3>
                          <p className="text-blue-600">Partagez votre expérience de cette semaine</p>
                        </div>
                      </div>
                      
                      <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Remplir le formulaire
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun feedback cette semaine</h3>
                  <p className="text-muted-foreground">Votre coach n'a pas encore créé de feedback pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Historique des feedbacks</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">Tous</option>
                    <option value="completed">Complétés</option>
                    <option value="in_progress">En cours</option>
                    <option value="sent">Envoyés</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFeedbacks.length > 0 ? (
                <div className="space-y-3">
                  {filteredFeedbacks.map((feedback, index) => (
                    <div
                      key={feedback.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => handlePastFeedbackClick(feedback)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            feedback.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : feedback.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {feedback.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : feedback.status === 'in_progress' ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold group-hover:text-primary transition-colors">
                              {feedback.template?.name || 'Feedback hebdomadaire'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {feedback.score && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">{feedback.score}/100</span>
                            </div>
                          )}
                          <Badge variant={
                            feedback.status === 'completed' ? 'default' :
                            feedback.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {feedback.status === 'completed' ? 'Terminé' : 
                             feedback.status === 'in_progress' ? 'En cours' : 
                             feedback.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
                  <p className="text-muted-foreground">Vos feedbacks précédents apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyses */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Progression</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score moyen</span>
                    <span className="text-2xl font-bold">{stats.averageScore}/100</span>
                  </div>
                  <Progress value={stats.averageScore} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meilleur score</span>
                    <span className="text-xl font-semibold text-green-600">{stats.bestScore}/100</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Série actuelle</span>
                    <span className="text-xl font-semibold text-blue-600">{stats.currentStreak} semaines</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Réalisations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Feedbacks complétés</p>
                      <p className="text-sm text-muted-foreground">{stats.completedFeedbacks} sur {stats.totalFeedbacks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Score exceptionnel</p>
                      <p className="text-sm text-muted-foreground">Meilleur: {stats.bestScore}/100</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Série en cours</p>
                      <p className="text-sm text-muted-foreground">{stats.currentStreak} semaines consécutives</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal du formulaire */}
      {showForm && currentTemplate && currentFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl max-h-[95vh] overflow-hidden w-full">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Formulaire de feedback</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-6 w-6 rotate-45" />
                </Button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
              <SimpleFeedbackForm
                template={currentTemplate}
                onSubmit={async (responses) => {
                  try {
                    const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
                      question_id: questionId,
                      question_text: currentTemplate.questions.find((q: any) => q.id === questionId)?.question_text || '',
                      question_type: currentTemplate.questions.find((q: any) => q.id === questionId)?.question_type || 'text',
                      response
                    }))
                    
                    await WeeklyFeedbackService.submitClientResponses(currentFeedback.id, responsesArray)
                    
                    toast({
                      title: "Succès",
                      description: "Feedback soumis avec succès !"
                    })
                    
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
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
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
                  className="h-8 w-8 p-0"
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
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Questions et réponses</span>
                </h3>
                
                {selectedPastTemplate.questions.map((question: any, index: number) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded">
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

export default SimpleClientFeedbacksPage
