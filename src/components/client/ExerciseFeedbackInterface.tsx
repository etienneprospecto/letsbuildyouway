import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target, 
  Heart, 
  Zap, 
  Brain,
  Timer,
  ArrowRight,
  ArrowLeft,
  Star,
  AlertCircle,
  Trophy
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Exercise {
  id: string
  exercise_id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string
  ordre: number
  completed: boolean
  sets_completed?: number
  reps_completed?: string
  difficulty_rating?: number
  form_rating?: number
  energy_level?: number
  pain_level?: number
  exercise_notes?: string
  exercise_duration?: number
  started_at?: string
  completed_at?: string
}

interface ExerciseFeedbackInterfaceProps {
  sessionId: string
  exercises: Exercise[]
  onSessionComplete: (sessionId: string, feedback: any[]) => void
  onExerciseComplete: (sessionId: string, exerciseId: string, feedback: any) => void
}

export const ExerciseFeedbackInterface: React.FC<ExerciseFeedbackInterfaceProps> = ({
  sessionId,
  exercises,
  onSessionComplete,
  onExerciseComplete
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isExerciseActive, setIsExerciseActive] = useState(false)
  const [exerciseStartTime, setExerciseStartTime] = useState<Date | null>(null)
  const [exerciseDuration, setExerciseDuration] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({
    sets_completed: 0,
    reps_completed: '',
    difficulty_rating: 5,
    form_rating: 5,
    energy_level: 5,
    pain_level: 1,
    notes: ''
  })
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [exerciseFeedbacks, setExerciseFeedbacks] = useState<Map<string, any>>(new Map())

  // Vérifications de sécurité
  if (!exercises || exercises.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun exercice trouvé
          </h3>
          <p className="text-gray-600">
            Cette séance ne contient aucun exercice.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exercises.length - 1
  const isFirstExercise = currentExerciseIndex === 0

  // Vérification supplémentaire
  if (!currentExercise) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Exercice non trouvé
          </h3>
          <p className="text-gray-600">
            L'exercice demandé n'existe pas.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Timer pour la durée de l'exercice
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isExerciseActive && exerciseStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - exerciseStartTime.getTime()) / 1000)
        setExerciseDuration(duration)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isExerciseActive, exerciseStartTime])

  const startExercise = () => {
    setIsExerciseActive(true)
    setExerciseStartTime(new Date())
    setExerciseDuration(0)
  }

  const pauseExercise = () => {
    setIsExerciseActive(false)
  }

  const resumeExercise = () => {
    setIsExerciseActive(true)
  }

  const completeExercise = () => {
    setIsExerciseActive(false)
    setShowFeedback(true)
  }

  const submitFeedback = async () => {
    try {
      const exerciseFeedback = {
        ...feedback,
        completed: true,
        exercise_duration: exerciseDuration,
        completed_at: new Date().toISOString()
      }

      // Stocker le feedback de cet exercice
      setExerciseFeedbacks(prev => new Map(prev.set(currentExercise.id, exerciseFeedback)))
      
      await onExerciseComplete(sessionId, currentExercise.id, exerciseFeedback)
      
      setCompletedExercises(prev => new Set([...prev, currentExercise.id]))
      setShowFeedback(false)
      setFeedback({
        sets_completed: 0,
        reps_completed: '',
        difficulty_rating: 5,
        form_rating: 5,
        energy_level: 5,
        pain_level: 1,
        notes: ''
      })

      if (isLastExercise) {
        // Toutes les séances sont terminées
        // Créer un tableau avec tous les exercices complétés en utilisant les feedbacks stockés
        const allFeedbacks = Array.from(completedExercises).map(exerciseId => {
          const storedFeedback = exerciseFeedbacks.get(exerciseId)
          return {
            exercise_id: exerciseId,
            sets_completed: storedFeedback?.sets_completed || 0,
            reps_completed: storedFeedback?.reps_completed || '',
            difficulty_rating: storedFeedback?.difficulty_rating || 5,
            form_rating: storedFeedback?.form_rating || 5,
            energy_level: storedFeedback?.energy_level || 5,
            pain_level: storedFeedback?.pain_level || 1,
            notes: storedFeedback?.notes || '',
            completed: true,
            exercise_duration: storedFeedback?.exercise_duration || 0,
            completed_at: storedFeedback?.completed_at || new Date().toISOString()
          }
        })
        
        // Ajouter l'exercice actuel s'il n'est pas déjà dans la liste
        if (!completedExercises.has(currentExercise.id)) {
          allFeedbacks.push({
            exercise_id: currentExercise.id,
            ...exerciseFeedback
          })
        }
        
        console.log('🎯 Finalisation de session - Feedbacks:', allFeedbacks)
        onSessionComplete(sessionId, allFeedbacks)
      } else {
        // Passer à l'exercice suivant
        setCurrentExerciseIndex(prev => prev + 1)
      }

      toast({
        title: "Exercice terminé ! 🎉",
        description: "Feedback sauvegardé avec succès"
      })
    } catch (error) {
      console.error('Erreur sauvegarde feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le feedback",
        variant: "destructive"
      })
    }
  }

  const goToNextExercise = () => {
    if (!isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1)
    }
  }

  const goToPreviousExercise = () => {
    if (!isFirstExercise) {
      setCurrentExerciseIndex(prev => prev - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((currentExerciseIndex + 1) / exercises.length) * 100
  }

  const getDifficultyColor = (rating: number) => {
    if (rating <= 3) return 'text-green-600'
    if (rating <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'text-green-600'
    if (level >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (showFeedback) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span>Feedback - {currentExercise.nom_exercice}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Durée de l'exercice */}
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {formatTime(exerciseDuration)}
            </div>
            <div className="text-sm text-gray-600">Durée de l'exercice</div>
          </div>

          {/* Feedback form */}
          <div className="space-y-6">
            {/* Séries et répétitions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Séries réalisées</label>
                <input
                  type="number"
                  min="0"
                  max={currentExercise.series}
                  value={feedback.sets_completed}
                  onChange={(e) => setFeedback(prev => ({ 
                    ...prev, 
                    sets_completed: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full mt-1 p-2 border rounded-md"
                />
                <div className="text-xs text-gray-500">
                  sur {currentExercise.series} séries
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Répétitions réalisées</label>
                <input
                  type="text"
                  value={feedback.reps_completed}
                  onChange={(e) => setFeedback(prev => ({ 
                    ...prev, 
                    reps_completed: e.target.value 
                  }))}
                  placeholder={currentExercise.repetitions}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
            </div>

            {/* Évaluations */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Difficulté ressentie: {feedback.difficulty_rating}/10
                </label>
                <Slider
                  value={[feedback.difficulty_rating]}
                  onValueChange={([value]) => setFeedback(prev => ({ 
                    ...prev, 
                    difficulty_rating: value 
                  }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Très facile</span>
                  <span>Très difficile</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Niveau d'énergie: {feedback.energy_level}/10
                </label>
                <Slider
                  value={[feedback.energy_level]}
                  onValueChange={([value]) => setFeedback(prev => ({ 
                    ...prev, 
                    energy_level: value 
                  }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Très fatigué</span>
                  <span>Très énergique</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Qualité de la forme: {feedback.form_rating}/10
                </label>
                <Slider
                  value={[feedback.form_rating]}
                  onValueChange={([value]) => setFeedback(prev => ({ 
                    ...prev, 
                    form_rating: value 
                  }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Forme médiocre</span>
                  <span>Forme parfaite</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Niveau de douleur: {feedback.pain_level}/10
                </label>
                <Slider
                  value={[feedback.pain_level]}
                  onValueChange={([value]) => setFeedback(prev => ({ 
                    ...prev, 
                    pain_level: value 
                  }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Aucune douleur</span>
                  <span>Douleur intense</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Textarea
                value={feedback.notes}
                onChange={(e) => setFeedback(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Comment s'est passé cet exercice ?"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'exercice
            </Button>
            <Button
              onClick={submitFeedback}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLastExercise ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Terminer la séance
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Exercice suivant
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header de progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Séance en cours</CardTitle>
              <p className="text-gray-600">
                Exercice {currentExerciseIndex + 1} sur {exercises.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(getProgressPercentage())}%
              </div>
              <div className="text-sm text-gray-600">Progression</div>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Exercice actuel */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentExercise.nom_exercice}</CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span>{currentExercise.series} séries</span>
                <span>•</span>
                <span>{currentExercise.repetitions}</span>
                <span>•</span>
                <span>Repos: {currentExercise.temps_repos}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentExercise.ordre}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer et contrôles */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-orange-600">
              {formatTime(exerciseDuration)}
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isExerciseActive ? (
                <Button
                  onClick={startExercise}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Commencer l'exercice
                </Button>
              ) : (
                <div className="flex space-x-4">
                  <Button
                    onClick={pauseExercise}
                    variant="outline"
                    size="lg"
                  >
                    <Pause className="h-6 w-6 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={completeExercise}
                    size="lg"
                    variant="default" className="px-8"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Terminer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation entre exercices */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousExercise}
              disabled={isFirstExercise}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={goToNextExercise}
              disabled={isLastExercise}
            >
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des exercices */}
      <Card>
        <CardHeader>
          <CardTitle>Plan de la séance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === currentExerciseIndex
                    ? 'bg-orange-50 border-orange-200'
                    : completedExercises.has(exercise.id)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === currentExerciseIndex
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : completedExercises.has(exercise.id)
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {exercise.ordre}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{exercise.nom_exercice}</h4>
                    <div className="text-sm text-gray-600">
                      {exercise.series} séries × {exercise.repetitions}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {index === currentExerciseIndex && (
                    <Badge className="bg-orange-500 text-white">
                      En cours
                    </Badge>
                  )}
                  {completedExercises.has(exercise.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}