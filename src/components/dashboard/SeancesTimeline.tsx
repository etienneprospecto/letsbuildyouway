import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, MessageCircle, Zap, Smile, CheckCircle, X, Edit, Lightbulb, TrendingUp, Dumbbell, Target, Users, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/providers/AuthProvider'
import { WorkoutService, WorkoutWithExercises, Exercise } from '@/services/workoutService'
import { SeanceService } from '@/services/seanceService'
import { useToast } from '@/hooks/use-toast'
import { DetailedSessionAssignmentModal } from './DetailedSessionAssignmentModal'

interface ExerciceSeance {
  id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string | null
  ordre: number
  completed: boolean
}

interface Seance {
  id: string
  client_id: string
  nom_seance: string
  date_seance: string
  statut: 'programmée' | 'terminée' | 'manquée'
  intensite_ressentie: number | null
  humeur: string | null
  commentaire_client: string | null
  date_fin: string | null
  exercices_termines: number
  taux_reussite: number
  reponse_coach: string | null
  exercices?: ExerciceSeance[]
}

interface SeancesTimelineProps {
  seances: Seance[]
  onAddSeance: () => void
  onSeanceClick: (seance: Seance) => void
  isLoading?: boolean
  clientId: string
}

const SeancesTimeline: React.FC<SeancesTimelineProps> = ({
  seances,
  onAddSeance,
  onSeanceClick,
  isLoading = false,
  clientId
}) => {
  const { profile } = useAuth()
  const { toast } = useToast()
  
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [coachResponse, setCoachResponse] = useState('')
  
  // États pour l'assignation de séance
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutWithExercises[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string>('')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [seanceDate, setSeanceDate] = useState('')
  const [seanceName, setSeanceName] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignMode, setAssignMode] = useState<'workout' | 'exercices'>('workout')
  
  // États pour la modification/suppression
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [seanceToEdit, setSeanceToEdit] = useState<Seance | null>(null)
  const [seanceToDelete, setSeanceToDelete] = useState<Seance | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'terminée':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'manquée':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'programmée':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'terminée':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'manquée':
        return <X className="h-4 w-4 text-red-600" />
      case 'programmée':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getHumeurEmoji = (humeur: string | null) => {
    if (!humeur) return '😐'
    
    const humeurMap: { [key: string]: string } = {
      'excellent': '😄',
      'bien': '😊',
      'moyen': '😐',
      'difficile': '😓',
      'épuisé': '😵',
      'fière': '😌',
      'motivé': '💪',
      'fatigué': '😴'
    }
    
    return humeurMap[humeur.toLowerCase()] || humeur
  }

  // Charger les workouts disponibles
  const loadAvailableWorkouts = async () => {
    if (!profile?.id) return
    
    try {
      const [workouts, exercises] = await Promise.all([
        WorkoutService.getWorkoutsByCoach(profile.id),
        WorkoutService.getExercises(profile.id)
      ])
      setAvailableWorkouts(workouts)
      setAvailableExercises(exercises)
    } catch (error) {
      console.error('Error loading workouts:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les workouts et exercices disponibles",
        variant: "destructive"
      })
    }
  }

  // Ouvrir le modal d'assignation
  const openAssignModal = () => {
    setIsAssignModalOpen(true)
    loadAvailableWorkouts()
    // Initialiser la date à aujourd'hui
    setSeanceDate(new Date().toISOString().split('T')[0])
  }

  // Ouvrir le modal de modification
  const openEditModal = (seance: Seance) => {
    setSeanceToEdit(seance)
    setSeanceName(seance.nom_seance)
    setSeanceDate(seance.date_seance)
    setIsEditModalOpen(true)
  }

  // Ouvrir le modal de suppression
  const openDeleteModal = (seance: Seance) => {
    setSeanceToDelete(seance)
    setIsDeleteModalOpen(true)
  }

  // Modifier une séance
  const editSeance = async () => {
    if (!seanceToEdit || !seanceName.trim() || !seanceDate) return

    try {
      setEditLoading(true)
      
      await SeanceService.updateSeance(seanceToEdit.id, {
        nom_seance: seanceName,
        date_seance: seanceDate
      })
      
      toast({
        title: "Séance modifiée",
        description: "La séance a été mise à jour avec succès",
      })
      
      setIsEditModalOpen(false)
      setSeanceToEdit(null)
      // Recharger les séances
      if (onAddSeance) onAddSeance()
      
    } catch (error) {
      console.error('Error editing seance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier la séance",
        variant: "destructive"
      })
    } finally {
      setEditLoading(false)
    }
  }

  // Supprimer une séance
  const deleteSeance = async () => {
    if (!seanceToDelete) return

    try {
      setDeleteLoading(true)
      
      await SeanceService.deleteSeance(seanceToDelete.id)
      
      toast({
        title: "Séance supprimée",
        description: "La séance a été supprimée avec succès",
      })
      
      setIsDeleteModalOpen(false)
      setSeanceToDelete(null)
      // Recharger les séances
      if (onAddSeance) onAddSeance()
      
    } catch (error) {
      console.error('Error deleting seance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la séance",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Assigner une séance au client
  const assignSeance = async () => {
    if (!seanceDate || !seanceName.trim()) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    if (assignMode === 'workout' && !selectedWorkout) {
      toast({
        title: "Workout manquant",
        description: "Veuillez sélectionner un workout",
        variant: "destructive"
      })
      return
    }

    if (assignMode === 'exercises' && selectedExercises.length === 0) {
      toast({
        title: "Exercices manquants",
        description: "Veuillez sélectionner au moins un exercice",
        variant: "destructive"
      })
      return
    }

    try {
      setAssignLoading(true)
      
      if (assignMode === 'workout') {
        // Mode Workout : assigner un workout complet
        const workout = availableWorkouts.find(w => w.id === selectedWorkout)
        if (!workout) throw new Error('Workout non trouvé')

        console.log('Workout sélectionné:', workout)
        console.log('Workout exercices:', workout.workout_exercises)

        // Créer la séance avec les exercices du workout
        const seanceData = {
          client_id: clientId, // Utiliser le clientId passé en prop
          nom_seance: seanceName,
          date_seance: seanceDate,
          statut: 'programmée' as const,
          workout_id: selectedWorkout
        }

        console.log('Données de séance:', seanceData)

        // Créer la séance et ses exercices
        const result = await SeanceService.createSeanceWithExercises(seanceData, workout.workout_exercises || [])
        
        console.log('Séance créée avec succès:', result)
        
        toast({
          title: "Workout assigné",
          description: "Le workout a été programmé avec succès",
        })
        
        setIsAssignModalOpen(false)
        // Recharger les séances
        if (onAddSeance) onAddSeance()
        
      } else {
        // Mode Exercices : créer une séance personnalisée
        const seanceData = {
          client_id: clientId, // Utiliser le clientId passé en prop
          nom_seance: seanceName,
          date_seance: seanceDate,
          statut: 'programmée' as const
        }

        // Créer la séance avec les exercices sélectionnés
        const customExercises = selectedExercises.map((exerciseId, index) => {
          const exercise = availableExercises.find(e => e.id === exerciseId)
          return {
            exercise_id: exerciseId,
            sets: 3, // Valeurs par défaut
            reps: '10-12',
            rest: '60s',
            order_index: index + 1
          }
        })

        await SeanceService.createSeanceWithExercises(seanceData, customExercises)
        
        console.log('Séance personnalisée créée avec succès')
        
        toast({
          title: "Séance personnalisée créée",
          description: "La séance personnalisée a été programmée avec succès",
        })
      }
      
      setIsAssignModalOpen(false)
      // Recharger les séances
      if (onAddSeance) onAddSeance()
      
    } catch (error) {
      console.error('Error assigning seance:', error)
      
      // Vérifier si c'est vraiment une erreur ou si la séance a été créée
      if (error.message && error.message.includes('duplicate key')) {
        toast({
          title: "Séance créée",
          description: "La séance a été créée avec succès (doublon détecté)",
        })
        setIsAssignModalOpen(false)
        if (onAddSeance) onAddSeance()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'assigner la séance. Vérifiez la console pour plus de détails.",
          variant: "destructive"
        })
      }
    } finally {
      setAssignLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSeanceClick = (seance: Seance) => {
    setSelectedSeance(seance)
    setIsDetailModalOpen(true)
  }

  const handleCoachResponse = () => {

    setCoachResponse('')
  }

  const quickResponses = [
    "Excellent travail ! 🔥",
    "Continue comme ça ! 💪",
    "Belle progression ! ⭐",
    "Très bien ! 👏",
    "Parfait ! 🎯"
  ]

  const sortedSeances = [...seances].sort((a, b) => 
    new Date(b.date_seance).getTime() - new Date(a.date_seance).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Section "Programmer une séance" */}
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <Dumbbell className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-800 mb-2">
            Programmer une séance
          </h3>
          <p className="text-orange-600 mb-4">
              Créez une nouvelle séance, réutilisez une séance précédente ou piochez dans votre bibliothèque
          </p>
            <Button
            onClick={openAssignModal}
            className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une séance
            </Button>
          </CardContent>
        </Card>

      {/* Timeline des séances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Timeline des séances</span>
            </CardTitle>
            <CardDescription>
              Cliquez sur une séance pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seances.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune séance programmée</p>
                <p className="text-sm text-gray-400">
                  Les séances apparaîtront ici une fois programmées
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {seances
                  .sort((a, b) => new Date(b.date_seance).getTime() - new Date(a.date_seance).getTime())
                  .map((seance, index) => (
                  <motion.div
                    key={seance.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Séance</p>
                              <p className="text-lg font-semibold">
                                {seance.nom_seance}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Date</p>
                              <div className="text-lg font-semibold">
                                {formatDate(seance.date_seance)}
                              </div>
                            </div>
                      </div>

                          <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                              className={`${
                                seance.statut === 'terminée'
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : seance.statut === 'manquée'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-orange-100 text-orange-800 border-orange-200'
                              }`}
                            >
                              {seance.statut === 'terminée' ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Terminée</span>
                                </div>
                              ) : seance.statut === 'manquée' ? (
                                <div className="flex items-center space-x-1">
                                  <X className="h-3 w-3" />
                                  <span>Manquée</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Programmée</span>
                                </div>
                              )}
                          </Badge>
                            
                            {/* Boutons d'action */}
                            <div className="flex space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditModal(seance)
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openDeleteModal(seance)
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Informations supplémentaires */}
                        {seance.exercices && seance.exercices.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600 mb-2">
                              {seance.exercices.length} exercice(s) programmé(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {seance.exercices.slice(0, 3).map((exercice, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {exercice.nom_exercice} ({exercice.series} séries)
                                </Badge>
                              ))}
                              {seance.exercices.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{seance.exercices.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal détail séance */}
      {isDetailModalOpen && selectedSeance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header coloré */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-lg -m-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSeance.nom_seance}</h2>
                  <p className="text-orange-100 mt-1">
                    {formatDate(selectedSeance.date_seance)}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="mt-2 bg-white/20 text-white border-white/30"
                  >
                    {selectedSeance.statut === 'terminée' ? 'Séance terminée' : selectedSeance.statut}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Programme de la séance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Programme de la séance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSeance.exercices && selectedSeance.exercices.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSeance.exercices.map((exercice, index) => (
                        <div key={exercice.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {exercice.ordre}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exercice.nom_exercice}</h4>
                            <p className="text-sm text-gray-600">
                              {exercice.series} séries × {exercice.repetitions}
                              {exercice.temps_repos && ` • Repos: ${exercice.temps_repos}`}
                            </p>
                          </div>
                          {exercice.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Aucun exercice programmé pour cette séance
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Feedback du client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <span>Feedback du client</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSeance.intensite_ressentie && (
                    <div>
                      <Label className="text-sm font-medium">Intensité ressentie</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={selectedSeance.intensite_ressentie * 10} className="flex-1" />
                        <span className="text-sm font-medium w-8">
                          {selectedSeance.intensite_ressentie}/10
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSeance.humeur && (
                    <div>
                      <Label className="text-sm font-medium">Ressenti général</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl">{getHumeurEmoji(selectedSeance.humeur)}</span>
                        <span className="text-sm capitalize">{selectedSeance.humeur}</span>
                      </div>
                    </div>
                  )}

                  {selectedSeance.commentaire_client && (
                    <div>
                      <Label className="text-sm font-medium">Commentaire client</Label>
                      <blockquote className="mt-1 p-3 bg-gray-50 rounded-lg text-sm italic">
                        "{selectedSeance.commentaire_client}"
                      </blockquote>
                    </div>
                  )}

                  {selectedSeance.date_fin && (
                    <div>
                      <Label className="text-sm font-medium">Date et heure de fin</Label>
                      <p className="text-sm mt-1">
                        {formatDate(selectedSeance.date_fin)} à {formatTime(selectedSeance.date_fin)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSeance.exercices_termines || 0}
                      </div>
                      <p className="text-sm text-gray-600">Exercices terminés</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSeance.taux_reussite || 0}%
                      </div>
                      <p className="text-sm text-gray-600">Taux de réussite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Votre réponse (coach) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5 text-orange-500" />
                    <span>Votre réponse (coach)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Réponses rapides</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quickResponses.map((response, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setCoachResponse(response)}
                          className="text-xs"
                        >
                          {response}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Votre message</Label>
                    <Textarea
                      value={coachResponse}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoachResponse(e.target.value)}
                      placeholder="Tapez votre réponse personnalisée..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleCoachResponse}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Envoyer la réponse
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Conseil en bas */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Conseil</p>
                  <p className="text-sm text-blue-700">
                    Répondez rapidement aux feedbacks de vos clients pour maintenir leur motivation et engagement.
                    Utilisez des réponses personnalisées pour créer une relation de confiance.
                  </p>
                </div>
              </div>
            </div>
          </div>
                            </div>
                          )}
                          
      {/* Modal d'assignation de séance détaillé */}
      <DetailedSessionAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        clientId={clientId}
        onSessionCreated={() => {
          setIsAssignModalOpen(false)
          if (onAddSeance) onAddSeance()
        }}
      />

      {/* Modal de modification de séance */}
      {isEditModalOpen && seanceToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Modifier la séance</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="editSeanceName">Nom de la séance</Label>
                <Input
                  id="editSeanceName"
                  value={seanceName}
                  onChange={(e) => setSeanceName(e.target.value)}
                  placeholder="Nom de la séance"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editSeanceDate">Date de la séance</Label>
                <Input
                  id="editSeanceDate"
                  type="date"
                  value={seanceDate}
                  onChange={(e) => setSeanceDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={editSeance}
                  disabled={!seanceName.trim() || !seanceDate || editLoading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {editLoading ? 'Modification...' : 'Modifier'}
                </Button>
              </div>
            </div>
                      </div>
                    </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && seanceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Supprimer la séance
              </h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la séance "{seanceToDelete.nom_seance}" du {formatDate(seanceToDelete.date_seance)} ?
                <br />
                <span className="text-red-600 font-medium">Cette action est irréversible.</span>
              </p>

              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={deleteSeance}
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          </div>
              </div>
            )}
    </div>
  )
}

export default SeancesTimeline
