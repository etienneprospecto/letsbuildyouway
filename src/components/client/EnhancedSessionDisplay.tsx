import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target, 
  Heart, 
  Zap, 
  Brain,
  Calendar,
  Timer,
  MessageSquare,
  Star,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react'
import { ExerciseFeedbackInterface } from './ExerciseFeedbackInterface'
import { ExerciseDetailModal } from './ExerciseDetailModal'

interface Exercise {
  id: string
  exercise_id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string
  ordre: number
  completed: boolean
  notes?: string
  estimated_duration?: number
  feedback?: {
    difficulty_rating: number
    form_rating: number
    energy_level: number
    pain_level: number
    notes: string
  }
}

interface Session {
  id: string
  nom_seance: string
  date_seance: string
  statut: 'programmée' | 'terminée' | 'manquée'
  notes_coach?: string
  intensite_ressentie?: number
  humeur?: string
  commentaire_client?: string
  exercices?: Exercise[]
  created_at: string
  updated_at: string
}

interface EnhancedSessionDisplayProps {
  session: Session
  onSessionStart: (sessionId: string) => void
  onSessionComplete: (sessionId: string, feedback: any[]) => void
  onExerciseComplete: (sessionId: string, exerciseId: string, feedback: any) => void
}

export const EnhancedSessionDisplay: React.FC<EnhancedSessionDisplayProps> = ({
  session,
  onSessionStart,
  onSessionComplete,
  onExerciseComplete
}) => {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terminée':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'manquée':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'programmée':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'terminée':
        return <CheckCircle className="h-4 w-4" />
      case 'manquée':
        return <AlertCircle className="h-4 w-4" />
      case 'programmée':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio': return <Heart className="h-4 w-4 text-red-500" />
      case 'musculation': return <Target className="h-4 w-4 text-blue-500" />
      case 'flexibilité': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'équilibre': return <Brain className="h-4 w-4 text-purple-500" />
      default: return <Target className="h-4 w-4 text-gray-500" />
    }
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

  const calculateSessionProgress = () => {
    if (!session.exercices || session.exercices.length === 0) return 0
    const completedExercises = session.exercices.filter(ex => ex.completed).length
    return (completedExercises / session.exercices.length) * 100
  }

  const calculateTotalDuration = () => {
    if (!session.exercices) return 0
    return session.exercices.reduce((total, exercise) => {
      const exerciseTime = exercise.estimated_duration || 5
      const restTime = parseInt(exercise.temps_repos) || 60
      return total + exerciseTime + (restTime / 60)
    }, 0)
  }

  const getAverageDifficulty = () => {
    if (!session.exercices || session.exercices.length === 0) return 0
    const exercisesWithFeedback = session.exercices.filter(ex => ex.feedback)
    if (exercisesWithFeedback.length === 0) return 0
    
    const totalDifficulty = exercisesWithFeedback.reduce((sum, ex) => 
      sum + (ex.feedback?.difficulty_rating || 0), 0
    )
    return totalDifficulty / exercisesWithFeedback.length
  }

  const getAverageEnergy = () => {
    if (!session.exercices || session.exercices.length === 0) return 0
    const exercisesWithFeedback = session.exercices.filter(ex => ex.feedback)
    if (exercisesWithFeedback.length === 0) return 0
    
    const totalEnergy = exercisesWithFeedback.reduce((sum, ex) => 
      sum + (ex.feedback?.energy_level || 0), 0
    )
    return totalEnergy / exercisesWithFeedback.length
  }

  const handleStartSession = () => {
    setIsSessionActive(true)
    onSessionStart(session.id)
  }

  const handleSessionComplete = (feedback: any[]) => {
    setIsSessionActive(false)
    setShowFeedback(true)
    onSessionComplete(session.id, feedback)
  }

  const handleExerciseComplete = (exerciseId: string, feedback: any) => {
    onExerciseComplete(session.id, exerciseId, feedback)
  }

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsDetailModalOpen(true)
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

  if (isSessionActive) {
    return (
      <ExerciseFeedbackInterface
        sessionId={session.id}
        exercises={session.exercices || []}
        onSessionComplete={handleSessionComplete}
        onExerciseComplete={handleExerciseComplete}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la séance */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {session.nom_seance}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(session.date_seance)}
                </div>
              </div>
              
              <Badge className={getStatusColor(session.statut)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(session.statut)}
                  <span className="capitalize">{session.statut}</span>
                </div>
              </Badge>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(calculateTotalDuration())} min
              </div>
              <div className="text-sm text-gray-600">Durée estimée</div>
            </div>
          </div>

          {/* Barre de progression */}
          {session.statut === 'programmée' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progression de la séance</span>
                <span>{Math.round(calculateSessionProgress())}%</span>
              </div>
              <Progress value={calculateSessionProgress()} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statistiques de la séance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {session.exercices?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Exercices</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {session.exercices?.filter(ex => ex.completed).length || 0}
              </div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Timer className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(calculateTotalDuration())}
              </div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(getAverageDifficulty())}/10
              </div>
              <div className="text-sm text-gray-600">Difficulté</div>
            </div>
          </div>

          {/* Notes du coach */}
          {session.notes_coach && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span>Instructions du coach</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{session.notes_coach}</p>
              </CardContent>
            </Card>
          )}

          {/* Liste des exercices */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Exercices de la séance</h3>
            {session.exercices?.map((exercise, index) => (
              <Card 
                key={exercise.id} 
                className={`transition-all cursor-pointer hover:shadow-md ${
                  exercise.completed 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            exercise.completed 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {exercise.ordre}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{exercise.nom_exercice}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{exercise.series} séries</span>
                            <span>•</span>
                            <span>{exercise.repetitions}</span>
                            <span>•</span>
                            <span>Repos: {exercise.temps_repos}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {exercise.completed ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Terminé</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm">En attente</span>
                        </div>
                      )}
                      
                      {/* Bouton pour voir les détails */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExerciseClick(exercise)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Feedback de l'exercice */}
                  {exercise.feedback && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <h5 className="font-medium mb-2">Votre ressenti :</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Difficulté:</span>
                          <span className={`ml-2 font-medium ${getDifficultyColor(exercise.feedback.difficulty_rating)}`}>
                            {exercise.feedback.difficulty_rating}/10
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Énergie:</span>
                          <span className={`ml-2 font-medium ${getEnergyColor(exercise.feedback.energy_level)}`}>
                            {exercise.feedback.energy_level}/10
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Forme:</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {exercise.feedback.form_rating}/10
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Douleur:</span>
                          <span className={`ml-2 font-medium ${exercise.feedback.pain_level > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {exercise.feedback.pain_level}/10
                          </span>
                        </div>
                      </div>
                      {exercise.feedback.notes && (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Notes:</strong> {exercise.feedback.notes}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            {session.statut === 'programmée' && (
              <Button
                onClick={handleStartSession}
                size="lg"
                variant="default" className="px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Commencer la séance
              </Button>
            )}

            {session.statut === 'terminée' && (
              <div className="text-center space-y-2">
                <div className="text-lg font-medium text-green-600">
                  Séance terminée avec succès ! 🎉
                </div>
                <div className="text-sm text-gray-600">
                  Durée totale: {Math.round(calculateTotalDuration())} minutes
                </div>
              </div>
            )}

            {session.statut === 'manquée' && (
              <div className="text-center space-y-2">
                <div className="text-lg font-medium text-red-600">
                  Séance manquée
                </div>
                <Button
                  onClick={handleStartSession}
                  variant="outline"
                  className="mt-2"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Reprendre la séance
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détail d'exercice */}
      <ExerciseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedExercise(null)
        }}
        exercise={selectedExercise}
      />
    </div>
  )
}
