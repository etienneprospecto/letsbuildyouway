import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, Play, Bed, Calendar, Target, MessageSquare } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface Seance {
  id: string
  nom_seance: string
  date_seance: string
  statut: string
  intensite_ressentie?: number
  humeur?: string
  commentaire_client?: string
  exercices_termines?: number
  taux_reussite?: number
  reponse_coach?: string
}

interface ExerciceSeance {
  id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string
  ordre: number
  completed: boolean
}

interface WeeklySession {
  id: string
  day: string
  date: string
  activity: string
  status: 'completed' | 'missed' | 'current' | 'upcoming' | 'rest'
  isToday: boolean
  seance?: Seance
}

const ClientSeances: React.FC = () => {
  const { user } = useAuth()
  const [seances, setSeances] = useState<Seance[]>([])
  const [weeklySessions, setWeeklySessions] = useState<WeeklySession[]>([])
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [exercices, setExercices] = useState<ExerciceSeance[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({
    intensite: 5,
    humeur: '😐',
    commentaire: ''
  })

  // Récupérer les séances du client depuis Supabase
  useEffect(() => {
    const fetchSeances = async () => {
      if (!user?.email) return
      
      try {
        // Récupérer l'ID du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('email', user.email)
          .single()

        if (clientError) throw clientError

        // Récupérer les séances avec plus de détails
        const { data: seancesData, error: seancesError } = await supabase
          .from('seances')
          .select(`
            *,
            exercices_seance (
              id,
              nom_exercice,
              series,
              repetitions,
              temps_repos,
              ordre,
              completed
            )
          `)
          .eq('client_id', clientData.id)
          .order('date_seance', { ascending: true })

        if (seancesError) throw seancesError

        setSeances(seancesData || [])
        generateWeeklyData(seancesData || [])
      } catch (error) {
        console.error('Erreur récupération séances:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer tes séances",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSeances()
  }, [user?.email])

  // Créer une nouvelle séance pour un jour donné
  const createSeanceForDay = async (dayDate: Date, activityName: string) => {
    if (!user?.email) return null
    
    try {
      // Récupérer l'ID du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) throw clientError

      // Créer la nouvelle séance
      const { data: newSeance, error: createError } = await supabase
        .from('seances')
        .insert({
          client_id: clientData.id,
          nom_seance: activityName,
          date_seance: dayDate.toISOString().split('T')[0],
          statut: 'programmée',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError

      // Mettre à jour la liste des séances
      setSeances(prev => [...prev, newSeance])
      
      // Régénérer les données de la semaine
      generateWeeklyData([...seances, newSeance])

      toast({
        title: "Séance créée",
        description: `Séance "${activityName}" programmée pour le ${dayDate.toLocaleDateString('fr-FR')}`,
      })

      return newSeance
    } catch (error) {
      console.error('Erreur création séance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la séance",
        variant: "destructive"
      })
      return null
    }
  }

  // Mettre à jour le statut d'une séance
  const updateSeanceStatus = async (seanceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('seances')
        .update({
          statut: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', seanceId)

      if (error) throw error

      // Mettre à jour la liste des séances
      setSeances(prev => prev.map(s => 
        s.id === seanceId ? { ...s, statut: newStatus } : s
      ))

      // Régénérer les données de la semaine
      generateWeeklyData(seances.map(s => 
        s.id === seanceId ? { ...s, statut: newStatus } : s
      ))

      toast({
        title: "Statut mis à jour",
        description: `Séance marquée comme "${newStatus}"`,
      })
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      })
    }
  }

  // Marquer une séance comme manquée
  const markSeanceAsMissed = async (seanceId: string) => {
    await updateSeanceStatus(seanceId, 'manquée')
  }

  // Marquer une séance comme terminée
  const markSeanceAsCompleted = async (seanceId: string) => {
    await updateSeanceStatus(seanceId, 'terminée')
  }

  // Gérer le clic sur une carte du planning
  const handlePlanningCardClick = async (session: WeeklySession, dayIndex: number) => {
    if (session.status === 'rest') return

    if (session.seance) {
      // Séance existante : ouvrir les détails
      handleOpenSeance(session.seance)
    } else {
      // Pas de séance : proposer d'en créer une
      const shouldCreate = window.confirm(
        `Aucune séance programmée pour le ${session.day} ${session.date}. Voulez-vous en créer une ?`
      )
      
      if (shouldCreate) {
        const dayDate = new Date('2025-08-25T10:00:00+02:00')
        dayDate.setDate(dayDate.getDate() - dayDate.getDay() + 1 + dayIndex)
        
        const newSeance = await createSeanceForDay(dayDate, session.activity)
        if (newSeance) {
          // Ouvrir directement la nouvelle séance
          setSelectedSeance(newSeance)
          setOpen(true)
        }
      }
    }
  }

  // Générer les données de la semaine basées sur les vraies séances
  const generateWeeklyData = (seancesData: Seance[]) => {
    // Date fixe : 25 août 2025 à 10h (heure de Paris/France)
    const fixedDate = new Date('2025-08-25T10:00:00+02:00') // UTC+2 pour l'été en France
    const currentWeekStart = new Date(fixedDate)
    currentWeekStart.setDate(fixedDate.getDate() - fixedDate.getDay() + 1) // Lundi de cette semaine

    // Créer un template de semaine avec des activités par défaut
    const weekData: WeeklySession[] = [
      { 
        id: '1', 
        day: 'LUN', 
        date: '18', 
        activity: 'Full Body', 
        status: 'upcoming', 
        isToday: false 
      },
      { 
        id: '2', 
        day: 'MAR', 
        date: '19', 
        activity: 'Cardio', 
        status: 'upcoming', 
        isToday: false 
      },
      { 
        id: '3', 
        day: 'MER', 
        date: '20', 
        activity: 'Upper Body', 
        status: 'upcoming', 
        isToday: false 
      },
      { 
        id: '4', 
        day: 'JEU', 
        date: '21', 
        activity: 'Core', 
        status: 'upcoming', 
        isToday: false 
      },
      { 
        id: '5', 
        day: 'VEN', 
        date: '22', 
        activity: 'Lower Body', 
        status: 'upcoming', 
        isToday: false 
      },
      { 
        id: '6', 
        day: 'SAM', 
        date: '23', 
        activity: 'Repos', 
        status: 'rest', 
        isToday: false 
      },
      { 
        id: '7', 
        day: 'DIM', 
        date: '24', 
        activity: 'Yoga', 
        status: 'upcoming', 
        isToday: false 
      }
    ]

    // Mapper les vraies séances avec le planning de la semaine
    weekData.forEach((day, index) => {
      if (day.status !== 'rest') {
        const dayDate = new Date(currentWeekStart)
        dayDate.setDate(currentWeekStart.getDate() + index)
        
        // Chercher une séance qui correspond à ce jour
        const matchingSeance = seancesData.find(s => {
          const seanceDate = new Date(s.date_seance)
          return seanceDate.toDateString() === dayDate.toDateString()
        })
        
        if (matchingSeance) {
          day.seance = matchingSeance
          day.activity = matchingSeance.nom_seance
          
          // Déterminer le statut basé sur la vraie séance
          switch (matchingSeance.statut) {
            case 'terminée':
              day.status = 'completed'
              break
            case 'manquée':
              day.status = 'missed'
              break
            case 'programmée':
              day.status = 'upcoming'
              break
            case 'en_cours':
              day.status = 'current'
              break
            default:
              day.status = 'upcoming'
          }
        } else {
          // Pas de séance programmée pour ce jour, marquer comme "pas de séance"
          day.activity = 'Pas de séance'
          day.status = 'upcoming'
        }
      }
    })

    setWeeklySessions(weekData)
  }

  // Récupérer les exercices d'une séance
  const fetchExercices = async (seanceId: string) => {
    try {
      const { data, error } = await supabase
        .from('exercices_seance')
        .select('*')
        .eq('seance_id', seanceId)
        .order('ordre')

      if (error) throw error
      setExercices(data || [])
    } catch (error) {
      console.error('Erreur récupération exercices:', error)
    }
  }

  // Ouvrir une séance
  const handleOpenSeance = (seance: Seance) => {
    setSelectedSeance(seance)
    fetchExercices(seance.id)
    setOpen(true)
  }

  // Sauvegarder le feedback
  const handleSaveFeedback = async () => {
    if (!selectedSeance) return

    try {
      const { error } = await supabase
        .from('seances')
        .update({
          intensite_ressentie: feedback.intensite,
          humeur: feedback.humeur,
          commentaire_client: feedback.commentaire,
          statut: 'terminée',
          date_fin: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSeance.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Feedback sauvegardé avec succès"
      })

      // Mettre à jour la liste des séances
      setSeances(prev => prev.map(s => 
        s.id === selectedSeance.id 
          ? { ...s, ...feedback, statut: 'terminée' }
          : s
      ))

      // Régénérer les données de la semaine
      generateWeeklyData(seances.map(s => 
        s.id === selectedSeance.id 
          ? { ...s, ...feedback, statut: 'terminée' }
          : s
      ))

      setOpen(false)
      setFeedback({ intensite: 5, humeur: '😐', commentaire: '' })
    } catch (error) {
      console.error('Erreur sauvegarde feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le feedback",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-white" />
      case 'missed':
        return <X className="h-5 w-5 text-white" />
      case 'current':
        return <Clock className="h-5 w-5 text-white" />
      case 'rest':
        return <Bed className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'missed':
        return 'bg-red-500'
      case 'current':
        return 'bg-orange-500'
      case 'rest':
        return 'bg-gray-200'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Validée'
      case 'missed':
        return 'Manquée'
      case 'current':
        return 'À faire'
      case 'rest':
        return '🛌 Repos'
      default:
        return 'À venir'
    }
  }

  const getCompletedSessions = () => {
    return weeklySessions.filter(session => session.status === 'completed').length
  }

  const getTotalSessions = () => {
    return weeklySessions.filter(session => session.status !== 'rest').length
  }

  const getProgressPercentage = () => {
    return (getCompletedSessions() / getTotalSessions()) * 100
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de ton planning...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes séances</h1>
        <p className="text-gray-600">Suivi de ton programme hebdomadaire</p>
      </div>

      {/* Section "Cette semaine" */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Cette semaine</CardTitle>
              <p className="text-gray-600 text-sm">Du 18 au 24 août 2025</p>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
              Semaine 12/16
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          {/* Séances validées */}
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600">
              {getCompletedSessions()}/{getTotalSessions()}
            </div>
            <div className="text-sm text-gray-600">Séances validées</div>
          </div>
        </CardContent>
      </Card>

      {/* Section "Planning de la semaine" */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Planning de la semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {weeklySessions.map((session, index) => (
              <div key={session.id} className="text-center space-y-2">
                {/* Jour et date */}
                <div className="text-xs font-medium text-gray-600 uppercase">
                  {session.day}
                </div>
                
                {/* Carte de la session */}
                <div className={`
                  relative w-16 h-16 mx-auto rounded-lg flex items-center justify-center cursor-pointer
                  ${getStatusColor(session.status)}
                  ${session.status === 'rest' ? 'bg-gray-200' : ''}
                  hover:opacity-80 transition-opacity
                  ${session.seance ? 'ring-2 ring-blue-200' : ''}
                `}
                onClick={() => handlePlanningCardClick(session, index)}>
                  {session.status === 'rest' ? (
                    <span className="text-gray-600 text-xs">{session.date}</span>
                  ) : (
                    getStatusIcon(session.status)
                  )}
                  
                  {/* Indicateur de séance connectée */}
                  {session.seance && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                
                {/* Activité */}
                <div className="text-xs font-medium text-gray-900 leading-tight">
                  {session.activity}
                </div>
                
                {/* Statut */}
                <div className="text-xs text-gray-600">
                  {getStatusText(session.status)}
                </div>
                
                {/* Bouton "C'est parti !" pour la session actuelle */}
                {session.status === 'current' && session.seance && (
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 h-auto"
                    size="sm"
                    onClick={() => handleOpenSeance(session.seance!)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    C'est parti !
                  </Button>
                )}
                
                {/* Bouton "Voir détails" pour les séances avec données */}
                {session.seance && session.status !== 'current' && session.status !== 'rest' && (
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 h-auto"
                    size="sm"
                    onClick={() => handleOpenSeance(session.seance!)}
                  >
                    Voir détails
                  </Button>
                )}
                
                {/* Actions rapides pour les séances programmées */}
                {session.seance && session.status === 'upcoming' && (
                  <div className="space-y-1">
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 h-auto"
                      size="sm"
                      onClick={() => markSeanceAsCompleted(session.seance!.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Terminée
                    </Button>
                    <Button 
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 h-auto"
                      size="sm"
                      onClick={() => markSeanceAsMissed(session.seance!.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Manquée
                    </Button>
                  </div>
                )}
                
                {/* Actions rapides pour les séances terminées */}
                {session.seance && session.status === 'completed' && (
                  <Button 
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 h-auto"
                    size="sm"
                    onClick={() => handleOpenSeance(session.seance!)}
                  >
                    Voir feedback
                  </Button>
                )}
                
                {/* Actions rapides pour les séances manquées */}
                {session.seance && session.status === 'missed' && (
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 h-auto"
                    size="sm"
                    onClick={() => updateSeanceStatus(session.seance!.id, 'programmée')}
                  >
                    Reprogrammer
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des séances détaillées (ancienne interface) */}
      {seances.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Détails des séances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {seances.map((seance) => (
                <Card key={seance.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {seance.nom_seance}
                      </CardTitle>
                      <Badge className={getStatusColor(seance.statut === 'terminée' ? 'completed' : 
                                                    seance.statut === 'manquée' ? 'missed' : 'current')}>
                        {seance.statut}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(seance.date_seance).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {seance.statut === 'terminée' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Intensité:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Target className="h-4 w-4" />
                            {seance.intensite_ressentie}/10
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Humeur:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{seance.humeur || '😐'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {seance.reponse_coach && (
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm font-medium">Réponse du coach:</span>
                        </div>
                        <p className="text-sm">{seance.reponse_coach}</p>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleOpenSeance(seance)}
                      variant={seance.statut === 'programmée' ? 'default' : 'secondary'}
                      className="w-full"
                    >
                      {seance.statut === 'programmée' ? 'Commencer la séance' : 'Voir les détails'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de séance (gardé de l'ancienne version) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSeance?.nom_seance}</DialogTitle>
          </DialogHeader>
          
          {selectedSeance && (
            <div className="space-y-6">
              {/* Programme de la séance */}
              <div>
                <h3 className="font-medium mb-3">Programme de la séance</h3>
                <div className="space-y-3">
                  {exercices.map((exercice) => (
                    <div key={exercice.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{exercice.nom_exercice}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercice.series} séries × {exercice.repetitions} reps
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Repos: {exercice.temps_repos}</p>
                        <Badge variant={exercice.completed ? 'default' : 'secondary'}>
                          {exercice.completed ? 'Terminé' : 'À faire'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback si séance pas encore terminée */}
              {selectedSeance.statut !== 'terminée' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Feedback de la séance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Intensité ressentie (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={feedback.intensite}
                        onChange={(e) => setFeedback(prev => ({ ...prev, intensite: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-center text-sm">{feedback.intensite}/10</div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Humeur</label>
                      <div className="flex gap-2">
                        {['😊', '🙂', '😐', '😕', '😢'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setFeedback(prev => ({ ...prev, humeur: emoji }))}
                            className={`text-2xl p-2 rounded ${
                              feedback.humeur === emoji ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaire (optionnel)</label>
                    <Textarea
                      value={feedback.commentaire}
                      onChange={(e) => setFeedback(prev => ({ ...prev, commentaire: e.target.value }))}
                      placeholder="Comment s'est passée ta séance ?"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveFeedback}>
                      Terminer ma séance
                    </Button>
                  </div>
                </div>
              )}

              {/* Réponse du coach si séance terminée */}
              {selectedSeance.statut === 'terminée' && selectedSeance.reponse_coach && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Réponse de ton coach</h3>
                  <p className="text-sm">{selectedSeance.reponse_coach}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientSeances


