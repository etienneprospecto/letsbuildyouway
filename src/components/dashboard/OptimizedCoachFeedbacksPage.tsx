import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Star,
  Target,
  Award,
  Zap,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Settings,
  Bell
} from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'

const OptimizedCoachFeedbacksPage: React.FC = () => {
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

  // États de filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')

  // Statistiques calculées
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalFeedbacks: 0,
    completedFeedbacks: 0,
    averageScore: 0,
    responseRate: 0,
    activeClients: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [templatesData, feedbacksData, clientsData] = await Promise.all([
        WeeklyFeedbackService.getCoachTemplates(user!.id),
        WeeklyFeedbackService.getCoachFeedbacks(user!.id),
        ClientService.getClientsByCoach(user!.id)
      ])

      setTemplates(templatesData)
      setFeedbacks(feedbacksData)
      setClients(clientsData)

      // Calculer les statistiques
      calculateStats(templatesData, feedbacksData, clientsData)
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

  const calculateStats = (templates: FeedbackTemplate[], feedbacks: WeeklyFeedback[], clients: any[]) => {
    const completedFeedbacks = feedbacks.filter(f => f.status === 'completed' && f.score)
    const totalFeedbacks = feedbacks.length
    const completedCount = completedFeedbacks.length
    
    const averageScore = completedCount > 0 
      ? Math.round(completedFeedbacks.reduce((sum, f) => sum + f.score, 0) / completedCount)
      : 0
    
    const responseRate = totalFeedbacks > 0 
      ? Math.round((completedCount / totalFeedbacks) * 100)
      : 0

    const activeClients = clients.length

    setStats({
      totalTemplates: templates.length,
      totalFeedbacks,
      completedFeedbacks: completedCount,
      averageScore,
      responseRate,
      activeClients
    })
  }

  // Gestion des modals
  const handleCreateTemplate = async (templateData: Omit<FeedbackTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTemplate = await WeeklyFeedbackService.createTemplate({
        ...templateData,
        coach_id: user!.id
      })
      
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
      const updatedTemplate = await WeeklyFeedbackService.updateTemplate(templateData.id, templateData)
      setTemplates(prev => prev.map(t => t.id === templateData.id ? updatedTemplate : t))
      setShowTemplateModal(false)
      setEditingTemplate(null)
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
      await WeeklyFeedbackService.deleteTemplate(templateId)
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
      await WeeklyFeedbackService.createAndSendWeeklyFeedbacks(
        user!.id,
        data.templateId,
        data.clientIds,
        data.weekStart,
        data.weekEnd
      )
      
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
      
      const { data: responses, error } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true })

      if (error) throw error

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

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = searchTerm === '' || 
      feedback.template?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.find(c => c.id === feedback.client_id)?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.find(c => c.id === feedback.client_id)?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus
    const matchesClient = filterClient === 'all' || feedback.client_id === filterClient
    
    return matchesSearch && matchesStatus && matchesClient
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedbacks Hebdomadaires</h1>
          <p className="text-muted-foreground">Gérez les feedbacks de vos clients</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
          <Button onClick={() => setShowSendModal(true)} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Envoyer Feedback
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{stats.totalTemplates}</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de réponse</p>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Cette semaine</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Réponses</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Clients actifs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun client trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.slice(0, 5).map(client => (
                      <div key={client.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {client.first_name?.[0]}{client.last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{client.first_name} {client.last_name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <Badge variant="outline">Actif</Badge>
                      </div>
                    ))}
                    {clients.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{clients.length - 5} autres clients
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Progression récente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de réponse</span>
                    <span className="text-2xl font-bold">{stats.responseRate}%</span>
                  </div>
                  <Progress value={stats.responseRate} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score moyen</span>
                    <span className="text-xl font-semibold text-green-600">{stats.averageScore}/100</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Feedbacks complétés</span>
                    <span className="text-xl font-semibold text-blue-600">{stats.completedFeedbacks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Templates de feedback</span>
                </CardTitle>
                <Button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun template créé</h3>
                  <p className="text-muted-foreground mb-4">Créez votre premier template de feedback</p>
                  <Button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                          <p className="text-muted-foreground mb-3">{template.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{template.questions.length} questions</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Cette semaine */}
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Feedbacks de cette semaine</span>
                </CardTitle>
                <Button onClick={() => setShowSendModal(true)} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFeedbacks.filter(f => f.status === 'sent' || f.status === 'in_progress').length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun feedback cette semaine</h3>
                  <p className="text-muted-foreground mb-4">Envoyez des feedbacks à vos clients</p>
                  <Button onClick={() => setShowSendModal(true)} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFeedbacks
                    .filter(f => f.status === 'sent' || f.status === 'in_progress')
                    .map((feedback, index) => {
                      const client = clients.find(c => c.id === feedback.client_id)
                      return (
                        <motion.div
                          key={feedback.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                          onClick={() => viewClientResponses(feedback.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {client?.first_name?.[0]}{client?.last_name?.[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant={
                                feedback.status === 'sent' ? 'secondary' : 'default'
                              }>
                                {feedback.status === 'sent' ? 'Envoyé' : 'En cours'}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
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
                  <Clock className="h-5 w-5 text-primary" />
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
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
                  <p className="text-muted-foreground">Vos feedbacks précédents apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFeedbacks.map((feedback, index) => {
                    const client = clients.find(c => c.id === feedback.client_id)
                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => viewClientResponses(feedback.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {client?.first_name?.[0]}{client?.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold group-hover:text-primary transition-colors">
                                {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
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
                              {feedback.status === 'completed' ? 'Complété' : 
                               feedback.status === 'in_progress' ? 'En cours' : 
                               feedback.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Réponses */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Réponses des clients</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFeedbacks.filter(f => f.status === 'completed').length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune réponse</h3>
                  <p className="text-muted-foreground">Les réponses des clients apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedbacks
                    .filter(f => f.status === 'completed')
                    .map((feedback, index) => {
                      const client = clients.find(c => c.id === feedback.client_id)
                      return (
                        <motion.div
                          key={feedback.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                          onClick={() => viewClientResponses(feedback.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')} au {new Date(feedback.week_end).toLocaleDateString('fr-FR')}
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
                              <Badge variant="default">Complété</Badge>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-hidden w-full mx-4"
          >
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Réponses du client</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResponsesModal(false)
                    setSelectedFeedback(null)
                    setClientResponses([])
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-6 w-6 rotate-45" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {clientResponses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune réponse trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientResponses.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 bg-muted/50"
                    >
                      <h4 className="font-semibold mb-2">{response.question_text}</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Type:</strong> {response.question_type}
                      </div>
                      <div className="mt-2">
                        <strong>Réponse:</strong>
                        <div className="mt-1 p-2 bg-background border rounded">
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
                      <div className="text-xs text-muted-foreground mt-2">
                        Répondu le {new Date(response.created_at).toLocaleDateString('fr-FR')} à {new Date(response.created_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OptimizedCoachFeedbacksPage
