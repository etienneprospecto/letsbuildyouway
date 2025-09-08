import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Clock,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/AuthProvider'
import { WorkoutService, WorkoutWithExercises, Exercise } from '@/services/workoutService'
import AddExerciseModal from './AddExerciseModal'
import AddWorkoutModal from './AddWorkoutModal'

const WorkoutsPage: React.FC = () => {
  const { profile } = useAuth()
  const { toast } = useToast()

  // États
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false)
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set())
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithExercises | null>(null)


  // Filtrage des données
  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || workout.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || workout.difficulty_level === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty_level === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Récupération des données
  const fetchData = async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      console.log('WorkoutsPage fetchData - profile.id:', profile.id)
      const [workoutsData, exercisesData] = await Promise.all([
        WorkoutService.getWorkoutsByCoach(profile.id),
        WorkoutService.getExercises(profile.id)
      ])

      console.log('Exercises fetched:', exercisesData)
      console.log('Exercises count:', exercisesData.length)

      setWorkouts(workoutsData)
      setExercises(exercisesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [profile?.id])

  // Gestion des actions
  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await WorkoutService.deleteWorkout(workoutId)
      toast({
        title: "Succès",
        description: "Workout supprimé avec succès"
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du workout",
        variant: "destructive"
      })
    }
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await WorkoutService.deleteExercise(exerciseId)
      toast({
        title: "Succès",
        description: "Exercice supprimé avec succès"
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'exercice",
        variant: "destructive"
      })
    }
  }

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId)
      } else {
        newSet.add(workoutId)
      }
      return newSet
    })
  }

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout)
    setShowAddWorkoutModal(true)
  }

  const formatCategory = (category: string) => {
    const categories: Record<string, string> = {
      'strength': 'Force',
      'cardio': 'Cardio',
      'flexibility': 'Flexibilité',
      'balance': 'Équilibre',
      'plyometric': 'Plyométrie',
      'general': 'Général',
      'recovery': 'Récupération',
      'custom': 'Personnalisé'
    }
    return categories[category] || category
  }

  const formatDifficulty = (difficulty: string) => {
    const difficulties: Record<string, string> = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé'
    }
    return difficulties[difficulty] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des workouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Workouts</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos workouts et exercices pour vos clients
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowAddExerciseModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un exercice
          </Button>
          <Button onClick={() => setShowAddWorkoutModal(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Créer un workout
          </Button>
        </div>
      </div>


      {/* Filtres et Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher workouts et exercices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="strength">Force</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibilité</SelectItem>
                <SelectItem value="general">Général</SelectItem>
                <SelectItem value="recovery">Récupération</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes difficultés</SelectItem>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Workouts ({filteredWorkouts.length})</CardTitle>
          <CardDescription>
            Liste de vos workouts avec leurs exercices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWorkouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun workout trouvé
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{workout.name}</h3>
                      {workout.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{workout.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleWorkoutExpansion(workout.id)}
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedWorkouts.has(workout.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{formatCategory(workout.category)}</Badge>
                    <Badge className={getDifficultyColor(workout.difficulty_level)}>{formatDifficulty(workout.difficulty_level)}</Badge>
                    {workout.is_template && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Template
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{workout.workout_exercises?.length || 0} exercices</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{workout.estimated_duration_minutes} min</span>
                    </div>
                  </div>

                  {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Exercices :</p>
                      <div className="flex flex-wrap gap-1">
                        {workout.workout_exercises.slice(0, 3).map((we) => (
                          <Badge key={we.id} variant="secondary" className="text-xs">
                            {we.exercises?.name || 'Exercice inconnu'}
                          </Badge>
                        ))}
                        {workout.workout_exercises.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{workout.workout_exercises.length - 3} autres</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section déroulée avec les détails de la séance */}
                  {expandedWorkouts.has(workout.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Détails du workout</h4>
                        
                        {/* Description complète */}
                        {workout.description && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                            <p className="text-sm text-gray-600">{workout.description}</p>
                          </div>
                        )}

                        {/* Métriques du workout */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h6 className="text-xs font-medium text-gray-500 mb-1">Durée estimée</h6>
                            <p className="text-sm font-semibold">{workout.estimated_duration_minutes} minutes</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h6 className="text-xs font-medium text-gray-500 mb-1">Nombre d'exercices</h6>
                            <p className="text-sm font-semibold">{workout.workout_exercises?.length || 0}</p>
                          </div>
                        </div>

                        {/* Exercices détaillés */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Séance concoctée par le coach</h5>
                          {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
                          <div className="space-y-3">
                            {workout.workout_exercises.map((we, index) => (
                              <div key={we.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">
                                    {index + 1}. {we.exercises?.name || 'Exercice inconnu'}
                                  </h5>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{we.sets} séries</span>
                                    <span>•</span>
                                    <span>{we.reps || 'max'} répétitions</span>
                                    {we.rest_seconds && (
                                      <>
                                        <span>•</span>
                                        <span>{we.rest_seconds}s de repos</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {we.exercises?.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {we.exercises.description}
                                  </p>
                                )}
                                
                                {we.notes && (
                                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                                    <p className="text-sm text-blue-800">
                                      <strong>Notes du coach :</strong> {we.notes}
                                    </p>
                                  </div>
                                )}
                                
                                {we.exercises?.muscle_groups && we.exercises.muscle_groups.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Groupes musculaires :</p>
                                    <div className="flex flex-wrap gap-1">
                                      {we.exercises.muscle_groups.map((group, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {group}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Aucun exercice dans ce workout</p>
                          )}
                        </div>
                        
                        {/* Actions du workout */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditWorkout(workout)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onExerciseAdded={fetchData}
        coachId={profile?.id || ''}
      />

      <AddWorkoutModal
        isOpen={showAddWorkoutModal}
        onClose={() => {
          setShowAddWorkoutModal(false)
          setEditingWorkout(null)
        }}
        onWorkoutAdded={fetchData}
        coachId={profile?.id || ''}
        exercises={exercises}
        editingWorkout={editingWorkout}
      />
    </div>
  )
}

export default WorkoutsPage
