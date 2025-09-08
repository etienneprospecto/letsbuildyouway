import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Target, MessageSquare } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { useClientSeances, Seance, ExerciceSeance } from '@/hooks/useClientSeances'
import WorkoutTimeline from './WorkoutTimeline'

const ClientSeances: React.FC = () => {
  const { user } = useAuth()
  const {
    loading,
    currentWeekStart,
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

      {/* Frise des semaines d'entraînement */}
      <WorkoutTimeline userEmail={user?.email} />

      {/* Liste des séances détaillées de la semaine en cours */}
      {currentWeekSeances.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header compact */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails des séances
                </h3>
                <p className="text-sm text-gray-600">
                  {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Badge variant="outline" className="bg-white text-orange-600 border-orange-300">
                {currentWeekSeances.length} séance{currentWeekSeances.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Liste compacte des séances */}
          <div className="divide-y divide-gray-100">
            {currentWeekSeances.map((seance: Seance, index: number) => (
              <div key={seance.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        seance.statut === 'terminée' ? 'bg-green-500' :
                        seance.statut === 'manquée' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                      <h4 className="font-semibold text-gray-900">{seance.nom_seance}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          seance.statut === 'terminée' ? 'bg-green-50 text-green-700 border-green-200' :
                          seance.statut === 'manquée' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {seance.statut}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(seance.date_seance).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      
                      {seance.statut === 'terminée' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {seance.intensite_ressentie}/10
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{seance.humeur || '😐'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Réponse du coach (compacte) */}
                    {seance.reponse_coach && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-blue-900 mb-1">Réponse du coach</p>
                            <p className="text-sm text-blue-800 line-clamp-2">{seance.reponse_coach}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action */}
                  <div className="ml-4">
                    <Button 
                      onClick={() => handleOpenSeance(seance)}
                      size="sm"
                      className={`${
                        seance.statut === 'programmée' 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {seance.statut === 'programmée' ? 'Commencer' : 'Détails'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucune séance pour la semaine */}
      {currentWeekSeances.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header compact */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails des séances
                </h3>
                <p className="text-sm text-gray-600">
                  {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Badge variant="outline" className="bg-white text-orange-600 border-orange-300">
                0 séance
              </Badge>
            </div>
          </div>

          {/* État vide */}
          <div className="p-8 text-center">
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


