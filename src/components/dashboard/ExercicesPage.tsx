import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dumbbell,
  Plus,
  Search,
  Clock,
  Target,
  Star,
  ChevronDown,
  Edit,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/AuthProvider'
import { WorkoutService, Exercise } from '@/services/workoutService'
import AddExerciseModal from './AddExerciseModal'

const ExercicesPage: React.FC = () => {
  const { profile } = useAuth()
  const { toast } = useToast()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)

  const fetchExercises = async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      const data = await WorkoutService.getExercises(profile.id)
      setExercises(data)
    } catch (err) {
      console.error('Error fetching exercises:', err)
      toast({ title: 'Erreur', description: "Impossible de charger les exercices", variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [profile?.id])

  const filteredExercises = exercises.filter((e) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || e.name.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || e.difficulty_level === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const formatCategory = (category: string) => {
    const map: Record<string, string> = {
      strength: 'Force',
      cardio: 'Cardio',
      flexibility: 'Flexibilité',
      balance: 'Équilibre',
      plyometric: 'Plyométrie',
    }
    return map[category] || category
  }

  const formatDifficulty = (difficulty: string) => {
    const map: Record<string, string> = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
    }
    return map[difficulty] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await WorkoutService.deleteExercise(exerciseId)
      toast({ title: 'Succès', description: 'Exercice supprimé' })
      fetchExercises()
    } catch (err) {
      toast({ title: 'Erreur', description: "Suppression impossible", variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des exercices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bibliothèque d'exercices</h1>
          <p className="text-muted-foreground">Gérez votre collection d'exercices</p>
        </div>
        <Button onClick={() => setShowAddExerciseModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un exercice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exercices</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">Dans votre bibliothèque</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publics</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.filter((e) => e.is_public).length}</div>
            <p className="text-xs text-muted-foreground">Partagés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(exercises.map((e) => e.category)).size}</div>
            <p className="text-xs text-muted-foreground">Types différents</p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Rechercher un exercice..."
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
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="strength">Force</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibilité</SelectItem>
                <SelectItem value="balance">Équilibre</SelectItem>
                <SelectItem value="plyometric">Plyométrie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercices ({filteredExercises.length})</CardTitle>
          <CardDescription>Tous vos exercices créés</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun exercice trouvé</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                      {exercise.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{exercise.description}</p>
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
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteExercise(exercise.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{formatCategory(exercise.category)}</Badge>
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>{formatDifficulty(exercise.difficulty_level)}</Badge>
                    {exercise.is_public && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" /> Public
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {exercise.estimated_duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.estimated_duration_minutes} min</span>
                      </div>
                    )}
                    {exercise.calories_burn_rate && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{exercise.calories_burn_rate} cal/min</span>
                      </div>
                    )}
                  </div>

                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Groupes musculaires :</p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscle_groups.slice(0, 3).map((g, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                        {exercise.muscle_groups.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{exercise.muscle_groups.length - 3} autres</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onExerciseAdded={fetchExercises}
        coachId={profile?.id || ''}
      />
    </div>
  )
}

export default ExercicesPage


