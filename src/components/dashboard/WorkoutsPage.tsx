import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Target,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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

  // Statistiques
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    activeWorkouts: 0,
    totalExercises: 0,
    averageDuration: 0
  })

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
      const [workoutsData, exercisesData, statsData] = await Promise.all([
        WorkoutService.getWorkoutsByCoach(profile.id),
        WorkoutService.getExercises(profile.id),
        WorkoutService.getWorkoutStats(profile.id)
      ])

      console.log('Exercises fetched:', exercisesData)
      console.log('Exercises count:', exercisesData.length)

      setWorkouts(workoutsData)
      setExercises(exercisesData)
      setStats(statsData)
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

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeWorkouts} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exercices</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExercises}</div>
            <p className="text-xs text-muted-foreground">
              Dans votre bibliothèque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDuration}min</div>
            <p className="text-xs text-muted-foreground">
              Par workout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workouts.filter(w => w.is_template).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Workouts sauvegardés
            </p>
          </CardContent>
        </Card>
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
            <div className="space-y-4">
              {filteredWorkouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{workout.name}</h3>
                        {workout.is_template && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Template
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {formatCategory(workout.category)}
                        </Badge>
                        <Badge className={getDifficultyColor(workout.difficulty_level)}>
                          {formatDifficulty(workout.difficulty_level)}
                        </Badge>
                      </div>

                      {workout.description && (
                        <p className="text-muted-foreground mb-3">{workout.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          <span>{workout.workout_exercises?.length || 0} exercices</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{workout.estimated_duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Créé le {new Date(workout.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Exercices :</p>
                          <div className="flex flex-wrap gap-1">
                            {workout.workout_exercises.slice(0, 3).map((we) => (
                              <Badge key={we.id} variant="secondary" className="text-xs">
                                {we.exercises?.name || 'Exercice inconnu'} ({we.sets}×{we.reps || 'max'})
                              </Badge>
                            ))}
                            {workout.workout_exercises.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{workout.workout_exercises.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Démarrer session
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
        onClose={() => setShowAddWorkoutModal(false)}
        onWorkoutAdded={fetchData}
        coachId={profile?.id || ''}
        exercises={exercises}
      />
    </div>
  )
}

export default WorkoutsPage
