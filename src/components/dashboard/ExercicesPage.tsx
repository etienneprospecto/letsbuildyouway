import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Clock,
  Target,
  ChevronDown,
  Edit,
  Trash2,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/OptimizedAuthProvider'
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
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

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
    const matchesCategory = categoryFilter === 'all' || e.type === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || e.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const formatCategory = (category: string) => {
    const map: Record<string, string> = {
      'Musculation': 'Musculation',
      'Cardio': 'Cardio',
      'Étirement': 'Étirement',
      'Pilates': 'Pilates',
      'Yoga': 'Yoga',
      'CrossFit': 'CrossFit',
      'Fonctionnel': 'Fonctionnel',
      'Autre': 'Autre',
    }
    return map[category] || category
  }

  const formatDifficulty = (difficulty: string) => {
    const map: Record<string, string> = {
      'Facile': 'Facile',
      'Intermédiaire': 'Intermédiaire',
      'Difficile': 'Difficile',
    }
    return map[difficulty] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return 'bg-green-100 text-green-800'
      case 'Intermédiaire':
        return 'bg-yellow-100 text-yellow-800'
      case 'Difficile':
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

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setShowAddExerciseModal(true)
  }

  const toggleExerciseExpansion = (exerciseId: string) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
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
                <SelectItem value="Musculation">Musculation</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
                <SelectItem value="Étirement">Étirement</SelectItem>
                <SelectItem value="Pilates">Pilates</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="CrossFit">CrossFit</SelectItem>
                <SelectItem value="Fonctionnel">Fonctionnel</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleExerciseExpansion(exercise.id)}
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedExercises.has(exercise.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{formatCategory(exercise.type)}</Badge>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>{formatDifficulty(exercise.difficulty)}</Badge>
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

                  {/* Section déroulée avec les détails de l'exercice */}
                  {expandedExercises.has(exercise.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Détails de l'exercice</h4>
                        
                        {/* Description complète */}
                        {exercise.description && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                            <p className="text-sm text-gray-600">{exercise.description}</p>
                          </div>
                        )}


                        {/* Équipement nécessaire */}
                        {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Équipement nécessaire</h5>
                            <div className="flex flex-wrap gap-1">
                              {exercise.equipment_needed.map((equipment, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {equipment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Groupes musculaires complets */}
                        {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Groupes musculaires ciblés</h5>
                            <div className="flex flex-wrap gap-1">
                              {exercise.muscle_groups.map((group, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}


                        {/* Liens vidéo/image */}
                        {(exercise.video_url || exercise.image_url) && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Ressources</h5>
                            <div className="space-y-2">
                              {exercise.video_url && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Vidéo :</span>
                                  <a 
                                    href={exercise.video_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Voir la vidéo
                                  </a>
                                </div>
                              )}
                              {exercise.image_url && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Image :</span>
                                  <a 
                                    href={exercise.image_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Voir l'image
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions de l'exercice */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditExercise(exercise)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteExercise(exercise.id)}
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

      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => {
          setShowAddExerciseModal(false)
          setEditingExercise(null)
        }}
        onExerciseAdded={fetchExercises}
        coachId={profile?.id || ''}
        exercises={[]}
        editingExercise={editingExercise}
      />
    </div>
  )
}

export default ExercicesPage


