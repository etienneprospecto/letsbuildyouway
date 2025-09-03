import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Target, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { useClientSeances, Seance, ExerciceSeance } from '@/hooks/useClientSeances'
import WeeklySessionCard from './WeeklySessionCard'

const ClientSeances: React.FC = () => {
  const { user } = useAuth()
  const {
    seances,
    weeklySessions,
    loading,
    currentWeekStart,
    createSeanceForDay,
    updateSeanceStatus,
    markSeanceAsMissed,
    markSeanceAsCompleted,
    goToPreviousWeek,
    goToNextWeek,
    getCurrentWeekSeances
  } = useClientSeances(user?.email)

  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [exercices, setExercices] = useState<ExerciceSeance[]>([])
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState({
    intensite: 5,
    humeur: '😐',
    commentaire: ''
  })

  // Obtenir les séances de la semaine en cours
  const currentWeekSeances = getCurrentWeekSeances()

  // Gérer le clic sur une carte du planning
  const handlePlanningCardClick = async (session: any, dayIndex: number) => {
    if (session.status === 'rest') return

    if (session.seance) {
      handleOpenSeance(session.seance)
    } else {
      const shouldCreate = window.confirm(
        `Aucune séance programmée pour le ${session.day} ${session.date}. Voulez-vous en créer une ?`
      )
      
      if (shouldCreate) {
        const dayDate = new Date(currentWeekStart)
        dayDate.setDate(currentWeekStart.getDate() + dayIndex)
        
        const newSeance = await createSeanceForDay(dayDate, session.activity)
        if (newSeance) {
          setSelectedSeance(newSeance)
          setOpen(true)
        }
      }
    }
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



      {/* Section "Planning de la semaine" */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Planning de la semaine</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[200px] text-center">
                {(() => {
                  // Calculer le dimanche de la semaine (6 jours après le lundi)
                  const weekEnd = new Date(currentWeekStart)
                  weekEnd.setDate(currentWeekStart.getDate() + 6)
                  const startDate = currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                  const endDate = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  return `${startDate} - ${endDate}`
                })()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {weeklySessions.map((session, index) => (
              <WeeklySessionCard
                key={session.id}
                session={session}
                index={index}
                onCardClick={handlePlanningCardClick}
                onOpenSeance={handleOpenSeance}
                onMarkCompleted={markSeanceAsCompleted}
                onMarkMissed={markSeanceAsMissed}
                onReprogram={(seanceId) => updateSeanceStatus(seanceId, 'programmée')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des séances détaillées de la semaine en cours */}
      {currentWeekSeances.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Détails des séances - {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </CardTitle>
            <CardDescription>
              Séances programmées pour cette semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {currentWeekSeances.map((seance) => (
                <Card key={seance.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {seance.nom_seance}
                      </CardTitle>
                      <Badge className={
                        seance.statut === 'terminée' ? 'bg-green-500' :
                        seance.statut === 'manquée' ? 'bg-red-500' : 'bg-orange-500'
                      }>
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

      {/* Message si aucune séance pour la semaine */}
      {currentWeekSeances.length === 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Détails des séances - {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Aucune séance programmée pour cette semaine
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Utilise les flèches pour naviguer entre les semaines
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de séance */}
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


