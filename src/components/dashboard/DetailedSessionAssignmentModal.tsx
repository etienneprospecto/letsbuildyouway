import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dumbbell, 
  Target, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  X, 
  CheckCircle,
  Timer,
  Users,
  Zap,
  Heart,
  Brain
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SeanceService } from '@/services/seanceService'
import { WorkoutService } from '@/services/workoutService'
import { exerciseService } from '@/services/exerciseService'
import { supabase } from '@/lib/supabase'

interface DetailedSessionAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  onSessionCreated: () => void
}

interface Exercise {
  id: string
  name: string
  category: string
  description?: string
  muscle_groups?: string[]
  difficulty_level?: string
}

interface WorkoutWithExercises {
  id: string
  name: string
  description?: string
  difficulty_level: string
  workout_exercises?: Array<{
    id: string
    exercise_id: string
    sets: number
    reps: string
    rest: string
    order_index: number
    exercise?: Exercise
  }>
}

interface SessionExercise {
  id: string
  exercise_id: string
  name: string
  category: string
  sets: number
  reps: string
  rest: string
  order: number
  notes?: string
  estimated_duration?: number // en minutes
}

export const DetailedSessionAssignmentModal: React.FC<DetailedSessionAssignmentModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onSessionCreated
}) => {
  const { toast } = useToast()
  
  // États principaux
  const [sessionName, setSessionName] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [loading, setLoading] = useState(false)
  
  // États pour les exercices
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutWithExercises[]>([])
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string>('')
  
  // États pour l'édition d'exercice
  const [editingExercise, setEditingExercise] = useState<SessionExercise | null>(null)
  const [showExerciseEditor, setShowExerciseEditor] = useState(false)
  
  // États pour les paramètres d'exercice
  const [exerciseSets, setExerciseSets] = useState<number>(3)
  const [exerciseReps, setExerciseReps] = useState<string>('10-12')
  const [exerciseRest, setExerciseRest] = useState<string>('60s')
  const [exerciseNotes, setExerciseNotes] = useState<string>('')
  const [exerciseDuration, setExerciseDuration] = useState<number>(5)

  useEffect(() => {
    if (isOpen) {
      loadData()
      // Initialiser la date à aujourd'hui
      setSessionDate(new Date().toISOString().split('T')[0])
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      // Récupérer l'ID du coach depuis le contexte d'auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      console.log('Chargement des données pour le coach:', user.id)

      const [exercises, workouts] = await Promise.all([
        exerciseService.getExercises(),
        WorkoutService.getWorkoutsByCoach(user.id)
      ])
      
      console.log('Exercices chargés:', exercises)
      console.log('Workouts chargés:', workouts)
      
      setAvailableExercises(exercises || [])
      setAvailableWorkouts(workouts || [])
      
      if ((exercises || []).length === 0) {
        toast({
          title: "Aucun exercice trouvé",
          description: "Aucun exercice n'est disponible. Créez d'abord des exercices.",
          variant: "destructive"
        })
      }
      
      if ((workouts || []).length === 0) {
        toast({
          title: "Aucun workout trouvé",
          description: "Aucun workout n'est disponible. Créez d'abord des workouts.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast({
        title: "Erreur",
        description: `Impossible de charger les exercices et workouts: ${error.message}`,
        variant: "destructive"
      })
    }
  }

  const handleWorkoutSelect = (workoutId: string) => {
    const workout = availableWorkouts.find(w => w.id === workoutId)
    if (!workout) return

    setSelectedWorkout(workoutId)
    setSessionName(workout.name)
    
    // Convertir les exercices du workout en exercices de séance
    const exercises: SessionExercise[] = (workout.workout_exercises || []).map((we, index) => ({
      id: `temp-${Date.now()}-${index}`,
      exercise_id: we.exercise_id,
      name: we.exercise?.name || `Exercice ${index + 1}`,
      category: we.exercise?.category || 'Général',
      sets: we.sets,
      reps: we.reps,
      rest: we.rest,
      order: we.order_index,
      notes: '',
      estimated_duration: 5
    }))
    
    setSessionExercises(exercises)
  }

  const addExercise = (exerciseId: string) => {
    const exercise = availableExercises.find(e => e.id === exerciseId)
    if (!exercise) return

    const newExercise: SessionExercise = {
      id: `temp-${Date.now()}`,
      exercise_id: exerciseId,
      name: exercise.name,
      category: exercise.type || 'Musculation',
      sets: 3,
      reps: '10-12',
      rest: '60s',
      order: sessionExercises.length + 1,
      notes: '',
      estimated_duration: 5
    }

    setSessionExercises([...sessionExercises, newExercise])
  }

  const removeExercise = (exerciseId: string) => {
    setSessionExercises(sessionExercises.filter(e => e.id !== exerciseId))
  }

  const editExercise = (exercise: SessionExercise) => {
    setEditingExercise(exercise)
    setExerciseSets(exercise.sets || 3)
    setExerciseReps(exercise.reps || '10-12')
    setExerciseRest(exercise.rest || '60s')
    setExerciseNotes(exercise.notes || '')
    setExerciseDuration(exercise.estimated_duration || 5)
    setShowExerciseEditor(true)
  }

  const saveExerciseEdit = () => {
    if (!editingExercise) return

    setSessionExercises(sessionExercises.map(e => 
      e.id === editingExercise.id 
        ? {
            ...e,
            sets: exerciseSets,
            reps: exerciseReps,
            rest: exerciseRest,
            notes: exerciseNotes,
            estimated_duration: exerciseDuration
          }
        : e
    ))

    setShowExerciseEditor(false)
    setEditingExercise(null)
  }

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = sessionExercises.findIndex(e => e.id === exerciseId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sessionExercises.length) return

    const newExercises = [...sessionExercises]
    const [movedExercise] = newExercises.splice(currentIndex, 1)
    newExercises.splice(newIndex, 0, movedExercise)

    // Mettre à jour les ordres
    const updatedExercises = newExercises.map((exercise, index) => ({
      ...exercise,
      order: index + 1
    }))

    setSessionExercises(updatedExercises)
  }

  const calculateTotalDuration = () => {
    return sessionExercises.reduce((total, exercise) => {
      const exerciseTime = exercise.estimated_duration || 5
      const restTime = parseInt(exercise.rest) || 60
      return total + exerciseTime + (restTime / 60) // Convertir les secondes en minutes
    }, 0)
  }

  const handleSubmit = async () => {
    if (!sessionName.trim() || !sessionDate || sessionExercises.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un exercice",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      const sessionData = {
        client_id: clientId,
        nom_seance: sessionName,
        date_seance: sessionDate,
        statut: 'programmée' as const,
        notes_coach: sessionNotes || null
      }

      // Convertir les exercices au format attendu par le service
      const exercisesData = sessionExercises.map(exercise => ({
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        order_index: exercise.order,
        notes: exercise.notes
      }))

      console.log('Données de séance:', sessionData)
      console.log('Données d\'exercices:', exercisesData)

      await SeanceService.createSeanceWithExercises(sessionData, exercisesData)

      toast({
        title: "Succès",
        description: "Séance créée avec succès !"
      })

      onSessionCreated()
      onClose()
      
      // Reset form
      setSessionName('')
      setSessionDate('')
      setSessionNotes('')
      setSessionExercises([])
      setSelectedWorkout('')

    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la séance",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'débutant': return 'bg-green-100 text-green-800'
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-800'
      case 'avancé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio': return <Heart className="h-4 w-4" />
      case 'musculation': return <Dumbbell className="h-4 w-4" />
      case 'étirement': return <Zap className="h-4 w-4" />
      case 'pilates': return <Brain className="h-4 w-4" />
      case 'yoga': return <Brain className="h-4 w-4" />
      case 'crossfit': return <Target className="h-4 w-4" />
      case 'fonctionnel': return <Target className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-orange-500" />
            <span>Créer une séance détaillée</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Configurez une séance personnalisée avec exercices, repos et feedbacks détaillés
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionName">Nom de la séance *</Label>
                  <Input
                    id="sessionName"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Ex: Full Body, Cardio HIIT, Upper Body..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionDate">Date de la séance *</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="sessionNotes">Notes pour le client (optionnel)</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Instructions spéciales, objectifs, conseils..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sélection des exercices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exercices de la séance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="workout" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="workout" className="flex items-center space-x-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workout existant</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Création personnalisée</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="workout" className="space-y-4">
                  <div>
                    <Label htmlFor="workoutSelect">Sélectionner un workout</Label>
                    <Select value={selectedWorkout} onValueChange={handleWorkoutSelect}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choisissez un workout existant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWorkouts.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Aucun workout disponible. Créez d'abord des workouts.
                          </div>
                        ) : (
                          availableWorkouts.map((workout) => (
                            <SelectItem key={workout.id} value={workout.id}>
                              <div className="flex items-center space-x-2">
                                <Dumbbell className="h-4 w-4" />
                                <span>{workout.name}</span>
                                <Badge className={getDifficultyColor(workout.difficulty_level)}>
                                  {workout.difficulty_level}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label htmlFor="exerciseSelect">Ajouter un exercice</Label>
                    <Select value="" onValueChange={addExercise}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choisissez un exercice à ajouter" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableExercises.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Aucun exercice disponible. Créez d'abord des exercices.
                          </div>
                        ) : (
                          availableExercises.map((exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(exercise.type || 'Musculation')}
                                <span>{exercise.name}</span>
                                <Badge variant="outline">{exercise.type || 'Musculation'}</Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Liste des exercices de la séance */}
              {sessionExercises.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Exercices de la séance ({sessionExercises.length})</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Timer className="h-4 w-4" />
                      <span>Durée estimée: {Math.round(calculateTotalDuration())} min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sessionExercises.map((exercise, index) => (
                      <Card key={exercise.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                                  {exercise.order}
                                </Badge>
                                <div>
                                  <h5 className="font-medium">{exercise.name}</h5>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    {getCategoryIcon(exercise.category)}
                                    <span>{exercise.category}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4 text-blue-500" />
                                  <span>{exercise.sets} séries</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Play className="h-4 w-4 text-green-500" />
                                  <span>{exercise.reps}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Pause className="h-4 w-4 text-orange-500" />
                                  <span>{exercise.rest}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Timer className="h-4 w-4 text-purple-500" />
                                  <span>{exercise.estimated_duration}min</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExercise(exercise.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExercise(exercise.id, 'down')}
                                disabled={index === sessionExercises.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editExercise(exercise)}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(exercise.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {exercise.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <strong>Notes:</strong> {exercise.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !sessionName.trim() || !sessionDate || sessionExercises.length === 0}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? 'Création...' : 'Créer la séance'}
            </Button>
          </div>
        </div>

        {/* Modal d'édition d'exercice */}
        {showExerciseEditor && editingExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Modifier l'exercice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nom de l'exercice</Label>
                  <Input value={editingExercise?.name || ''} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de séries</Label>
                    <Input
                      type="number"
                      value={exerciseSets}
                      onChange={(e) => setExerciseSets(parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Répétitions</Label>
                    <Input
                      value={exerciseReps}
                      onChange={(e) => setExerciseReps(e.target.value)}
                      placeholder="10-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temps de repos</Label>
                    <Input
                      value={exerciseRest}
                      onChange={(e) => setExerciseRest(e.target.value)}
                      placeholder="60s"
                    />
                  </div>
                  <div>
                    <Label>Durée estimée (min)</Label>
                    <Input
                      type="number"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes (optionnel)</Label>
                  <Textarea
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    placeholder="Instructions spéciales..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowExerciseEditor(false)}>
                    Annuler
                  </Button>
                  <Button onClick={saveExerciseEdit}>
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
