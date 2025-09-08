import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { WorkoutService, CreateWorkoutData, Exercise, AddExerciseToWorkoutData } from '@/services/workoutService'

interface AddWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onWorkoutAdded: () => void
  coachId: string
  exercises: Exercise[]
  editingWorkout?: any | null
}

interface FormData {
  name: string
  description: string
  category: string
  difficulty_level: string
  estimated_duration_minutes: string
  target_audience: string[]
  tags: string[]
  is_template: boolean
}

interface WorkoutExerciseData extends AddExerciseToWorkoutData {
  exercise: Exercise
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({
  isOpen,
  onClose,
  onWorkoutAdded,
  coachId,
  exercises,
  editingWorkout
}) => {
  console.log('AddWorkoutModal received exercises:', exercises)
  console.log('Exercises count in modal:', exercises.length)
  
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'general',
    difficulty_level: 'beginner',
    estimated_duration_minutes: '',
    target_audience: [],
    tags: [],
    is_template: false
  })
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseData[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [exerciseForm, setExerciseForm] = useState({
    sets: 1,
    reps: '',
    duration_seconds: '',
    rest_seconds: 60,
    weight_kg: '',
    notes: ''
  })

  // Initialiser le formulaire avec les données d'édition
  React.useEffect(() => {
    if (editingWorkout) {
      setFormData({
        name: editingWorkout.name || '',
        description: editingWorkout.description || '',
        category: editingWorkout.category || 'general',
        difficulty_level: editingWorkout.difficulty_level || 'beginner',
        estimated_duration_minutes: editingWorkout.estimated_duration_minutes?.toString() || '',
        target_audience: editingWorkout.target_audience || [],
        tags: editingWorkout.tags || [],
        is_template: editingWorkout.is_template || false
      })
      
      // Convertir les exercices du workout en format WorkoutExerciseData
      if (editingWorkout.workout_exercises) {
        const exercisesData = editingWorkout.workout_exercises.map((we: any, index: number) => ({
          exercise_id: we.exercise_id,
          order_index: we.order_index || index, // Utiliser order_index existant ou l'index comme fallback
          sets: we.sets,
          reps: we.reps,
          duration_seconds: we.duration_seconds,
          rest_seconds: we.rest_seconds,
          weight_kg: we.weight_kg,
          notes: we.notes,
          exercise: we.exercises
        }))
        setWorkoutExercises(exercisesData)
      }
    } else {
      // Reset form for new workout
      setFormData({
        name: '',
        description: '',
        category: 'general',
        difficulty_level: 'beginner',
        estimated_duration_minutes: '',
        target_audience: [],
        tags: [],
        is_template: false
      })
      setWorkoutExercises([])
    }
  }, [editingWorkout])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'target_audience' | 'tags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: 'target_audience' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const addExerciseToWorkout = () => {
    if (!selectedExerciseId) return

    const exercise = exercises.find(e => e.id === selectedExerciseId)
    if (!exercise) return

    const newExercise: WorkoutExerciseData = {
      exercise_id: selectedExerciseId,
      exercise,
      order_index: workoutExercises.length,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps ? parseInt(exerciseForm.reps) : undefined,
      duration_seconds: exerciseForm.duration_seconds ? parseInt(exerciseForm.duration_seconds) : undefined,
      rest_seconds: exerciseForm.rest_seconds,
      weight_kg: exerciseForm.weight_kg ? parseFloat(exerciseForm.weight_kg) : undefined,
      notes: exerciseForm.notes || undefined
    }

    setWorkoutExercises(prev => [...prev, newExercise])

    // Reset form
    setSelectedExerciseId('')
    setExerciseForm({
      sets: 1,
      reps: '',
      duration_seconds: '',
      rest_seconds: 60,
      weight_kg: '',
      notes: ''
    })
  }

  const removeExerciseFromWorkout = (index: number) => {
    setWorkoutExercises(prev => prev.filter((_, i) => i !== index))
  }

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    const newExercises = [...workoutExercises]
    const [movedExercise] = newExercises.splice(fromIndex, 1)
    newExercises.splice(toIndex, 0, movedExercise)

    // Update order_index
    newExercises.forEach((exercise, index) => {
      exercise.order_index = index
    })

    setWorkoutExercises(newExercises)
  }

  const handleSubmit = async () => {
    if (!formData.name || workoutExercises.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom du workout et ajouter au moins un exercice",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Étape 1: Créer le workout
      const workoutData: CreateWorkoutData = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        estimated_duration_minutes: formData.estimated_duration_minutes ? parseInt(formData.estimated_duration_minutes) : undefined,
        target_audience: formData.target_audience.length > 0 ? formData.target_audience : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        is_template: formData.is_template
      }

      if (editingWorkout) {
        // Mode édition
        console.log('Updating workout with data:', workoutData)
        await WorkoutService.updateWorkout(editingWorkout.id, workoutData)
        
        // Supprimer tous les exercices existants et les recréer
        await WorkoutService.removeAllExercisesFromWorkout(editingWorkout.id)
        
        // Ajouter les nouveaux exercices
        for (const exerciseData of workoutExercises) {
          console.log('Adding exercise:', exerciseData.exercise.name)
          const reps = exerciseData.reps ? parseInt(exerciseData.reps) : undefined
          const duration_seconds = exerciseData.duration_seconds ? parseInt(exerciseData.duration_seconds) : undefined
          const final_duration = duration_seconds || (reps ? undefined : 60)
          
          await WorkoutService.addExerciseToWorkout(editingWorkout.id, {
            exercise_id: exerciseData.exercise_id,
            order_index: exerciseData.order_index,
            sets: exerciseData.sets,
            reps: reps,
            duration_seconds: final_duration,
            rest_seconds: exerciseData.rest_seconds,
            weight_kg: exerciseData.weight_kg,
            notes: exerciseData.notes
          })
        }

        toast({
          title: "Succès !",
          description: "Workout modifié avec succès",
        })
      } else {
        // Mode création
        console.log('Creating workout with data:', workoutData)
        const newWorkout = await WorkoutService.createWorkout(coachId, workoutData)
        console.log('Workout created:', newWorkout)

        // Ajouter les exercices au workout
        console.log('Adding exercises to workout:', workoutExercises.length)
        for (const exerciseData of workoutExercises) {
          console.log('Adding exercise:', exerciseData.exercise.name)
          const reps = exerciseData.reps ? parseInt(exerciseData.reps) : undefined
          const duration_seconds = exerciseData.duration_seconds ? parseInt(exerciseData.duration_seconds) : undefined
          const final_duration = duration_seconds || (reps ? undefined : 60)
          
          await WorkoutService.addExerciseToWorkout(newWorkout.id, {
            exercise_id: exerciseData.exercise_id,
            order_index: exerciseData.order_index,
            sets: exerciseData.sets,
            reps: reps,
            duration_seconds: final_duration,
            rest_seconds: exerciseData.rest_seconds,
            weight_kg: exerciseData.weight_kg,
            notes: exerciseData.notes
          })
        }

        toast({
          title: "Succès !",
          description: "Workout créé avec succès",
        })
      }

      onWorkoutAdded()
      handleClose()

    } catch (error) {
      console.error('Error creating workout:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du workout",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      difficulty_level: 'beginner',
      estimated_duration_minutes: '',
      target_audience: [],
      tags: [],
      is_template: false
    })
    setWorkoutExercises([])
    setStep(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">
                {editingWorkout ? "Modifier le workout" : "Créer un nouveau workout"}
              </h2>
              <p className="text-muted-foreground">
                {step === 1 ? "Configurez votre workout" : "Ajoutez des exercices"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              /* Étape 1: Configuration du workout */
              <div className="space-y-6">
                {/* Informations de base */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      Informations du workout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom du workout *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Entraînement Débutant, Cardio Intense..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Description du workout..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strength">Force</SelectItem>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="flexibility">Flexibilité</SelectItem>
                            <SelectItem value="recovery">Récupération</SelectItem>
                            <SelectItem value="general">Général</SelectItem>
                            <SelectItem value="custom">Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="difficulty_level">Niveau *</Label>
                        <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Débutant</SelectItem>
                            <SelectItem value="intermediate">Intermédiaire</SelectItem>
                            <SelectItem value="advanced">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="estimated_duration_minutes">Durée estimée (minutes)</Label>
                      <Input
                        id="estimated_duration_minutes"
                        type="number"
                        value={formData.estimated_duration_minutes}
                        onChange={(e) => handleInputChange('estimated_duration_minutes', e.target.value)}
                        placeholder="30"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_template"
                        checked={formData.is_template}
                        onChange={(e) => handleInputChange('is_template', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="is_template">Sauvegarder comme template</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button onClick={() => setStep(2)} disabled={!formData.name}>
                    Suivant
                  </Button>
                </div>
              </div>
            ) : (
              /* Étape 2: Ajout d'exercices */
              <div className="space-y-6">
                {/* Sélection d'exercice */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ajouter un exercice</CardTitle>
                    <CardDescription>
                      Sélectionnez un exercice et configurez ses paramètres
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Exercice</Label>
                        <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un exercice" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map(exercise => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Nombre de séries</Label>
                        <Input
                          type="number"
                          value={exerciseForm.sets}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Répétitions (ou laissez vide pour durée)</Label>
                        <Input
                          type="number"
                          value={exerciseForm.reps}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <Label>Durée en secondes (si pas de reps)</Label>
                        <Input
                          type="number"
                          value={exerciseForm.duration_seconds}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, duration_seconds: e.target.value }))}
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Temps de repos (secondes)</Label>
                        <Input
                          type="number"
                          value={exerciseForm.rest_seconds}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, rest_seconds: parseInt(e.target.value) || 60 }))}
                          min="0"
                        />
                      </div>

                      <div>
                        <Label>Poids (kg) - optionnel</Label>
                        <Input
                          type="number"
                          value={exerciseForm.weight_kg}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, weight_kg: e.target.value }))}
                          placeholder="0"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Notes - optionnel</Label>
                      <Input
                        value={exerciseForm.notes}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes sur l'exercice..."
                      />
                    </div>

                    <Button
                      onClick={addExerciseToWorkout}
                      disabled={!selectedExerciseId}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter au workout
                    </Button>
                  </CardContent>
                </Card>

                {/* Liste des exercices du workout */}
                <Card>
                  <CardHeader>
                    <CardTitle>Exercices du workout ({workoutExercises.length})</CardTitle>
                    <CardDescription>
                      Réorganisez les exercices en les glissant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {workoutExercises.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun exercice ajouté
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workoutExercises.map((workoutExercise, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

                            <div className="flex-1">
                              <h4 className="font-medium">{workoutExercise.exercise.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{workoutExercise.sets} séries</span>
                                {workoutExercise.reps && <span>{workoutExercise.reps} reps</span>}
                                {workoutExercise.duration_seconds && <span>{workoutExercise.duration_seconds}s</span>}
                                <span>Repos: {workoutExercise.rest_seconds}s</span>
                                {workoutExercise.weight_kg && <span>{workoutExercise.weight_kg}kg</span>}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExerciseFromWorkout(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Retour
                  </Button>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || workoutExercises.length === 0}>
                      {isLoading ? "Création..." : "Créer le workout"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddWorkoutModal
