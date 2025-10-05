import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Target, MessageSquare } from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { useClientSeances, Seance, ExerciceSeance } from '@/hooks/useClientSeances'
import { useWeek } from '@/providers/WeekProvider'
import WorkoutTimeline from './WorkoutTimeline'
import { EnhancedSessionDisplay } from './EnhancedSessionDisplay'

const ClientSeances: React.FC = () => {
  const { user } = useAuth()
  const {
    loading,
    currentWeekStart,
    getCurrentWeekSeances,
    refetch
  } = useClientSeances(user?.email)
  
  const { goToCurrentWeek, formatWeekRange } = useWeek()

  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [exercices, setExercices] = useState<ExerciceSeance[]>([])
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState({
    intensite: 5,
    humeur: '😐',
    commentaire: ''
  })

  // États pour la session active
  const [activeSession, setActiveSession] = useState<Seance | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Obtenir les séances de la semaine en cours
  const currentWeekSeances = getCurrentWeekSeances()


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

  // Démarrer une session
  const handleSessionStart = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('seances')
        .update({
          session_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error

      toast({
        title: "Session démarrée",
        description: "Bonne séance ! 💪"
      })
    } catch (error) {
      console.error('Erreur démarrage session:', error)
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session",
        variant: "destructive"
      })
    }
  }

  // Terminer une session
  const handleSessionComplete = async (sessionId: string, feedbacks: any[]) => {
    try {
      console.log('🔄 Début de la finalisation de la session:', sessionId)
      console.log('📊 Feedbacks reçus:', feedbacks)

      // Mettre à jour la séance
      const { error: sessionError } = await supabase
        .from('seances')
        .update({
          statut: 'terminée',
          session_completed_at: new Date().toISOString(),
          exercices_termines: feedbacks.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (sessionError) {
        console.error('❌ Erreur mise à jour séance:', sessionError)
        throw sessionError
      }

      console.log('✅ Séance mise à jour avec succès')

      // Mettre à jour les feedbacks des exercices
      for (const feedback of feedbacks) {
        console.log('🔄 Mise à jour exercice:', feedback.exercise_id || feedback.id)
        
        const { error: exerciseError } = await supabase
          .from('exercices_seance')
          .update({
            sets_completed: feedback.sets_completed,
            reps_completed: feedback.reps_completed,
            difficulty_rating: feedback.difficulty_rating,
            form_rating: feedback.form_rating,
            energy_level: feedback.energy_level,
            pain_level: feedback.pain_level,
            exercise_notes: feedback.notes,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', feedback.exercise_id || feedback.id)

        if (exerciseError) {
          console.error('❌ Erreur mise à jour exercice:', exerciseError)
          throw exerciseError
        }
        
        console.log('✅ Exercice mis à jour avec succès')
      }

      console.log('🎉 Tous les exercices mis à jour avec succès')

      // Rafraîchir les données
      await refetch()

      toast({
        title: "Félicitations ! 🎉",
        description: "Séance terminée avec succès !"
      })

      setIsSessionActive(false)
      setActiveSession(null)
    } catch (error) {
      console.error('❌ Erreur fin session:', error)
      toast({
        title: "Erreur",
        description: `Impossible de terminer la session: ${error.message}`,
        variant: "destructive"
      })
    }
  }

  // Mettre à jour le feedback d'un exercice
  const handleExerciseComplete = async (sessionId: string, exerciseId: string, feedback: any) => {
    try {
      console.log('🔄 Mise à jour exercice individuel:', exerciseId, feedback)
      
      const { error } = await supabase
        .from('exercices_seance')
        .update({
          sets_completed: feedback.sets_completed,
          reps_completed: feedback.reps_completed,
          difficulty_rating: feedback.difficulty_rating,
          form_rating: feedback.form_rating,
          energy_level: feedback.energy_level,
          pain_level: feedback.pain_level,
          exercise_notes: feedback.notes,
          completed: feedback.completed,
          completed_at: feedback.completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', exerciseId)

      if (error) {
        console.error('❌ Erreur mise à jour exercice:', error)
        throw error
      }

      console.log('✅ Exercice individuel mis à jour avec succès')
      
      // Rafraîchir les données
      await refetch()
    } catch (error) {
      console.error('Erreur feedback exercice:', error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes séances</h1>
          <p className="text-gray-600">Suivi de ton programme hebdomadaire</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-2">
            Semaine du {formatWeekRange(currentWeekStart)}
          </div>
          <Button
            onClick={goToCurrentWeek}
            variant="outline"
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Semaine actuelle
          </Button>
        </div>
      </div>

      {/* Frise des semaines d'entraînement */}
      <WorkoutTimeline userEmail={user?.email} />

      {/* Liste des séances détaillées de la semaine en cours */}
      {currentWeekSeances.length > 0 && (
        <div className="space-y-4">
          {currentWeekSeances.map((seance: Seance, index: number) => (
            <EnhancedSessionDisplay
              key={seance.id}
              session={seance}
              onSessionStart={handleSessionStart}
              onSessionComplete={handleSessionComplete}
              onExerciseComplete={handleExerciseComplete}
            />
          ))}
        </div>
      )}

      {/* Message si aucune séance pour la semaine */}
      {currentWeekSeances.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aucune séance programmée
          </h4>
          <p className="text-gray-600 mb-4">
            Aucune séance n'est prévue pour cette semaine
          </p>
          <p className="text-sm text-gray-500">
            Utilise les flèches pour naviguer entre les semaines
          </p>
        </div>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedback(prev => ({ ...prev, intensite: parseInt(e.target.value) }))}
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


