import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  X,
  Target,
  Clock,
  CheckCircle,
  Star,
  Heart,
  Zap,
  Brain,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Timer
} from 'lucide-react'

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

interface ExerciseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise | null
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exercise
}) => {
  if (!exercise) return null

  const getDifficultyColor = (rating: number) => {
    if (rating <= 3) return 'text-green-600 bg-green-50'
    if (rating <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'text-green-600 bg-green-50'
    if (level >= 5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getPainColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-50'
    if (level <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getFormColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-50'
    if (rating >= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-orange-500" />
            <span>Détails de l'exercice</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales de l'exercice */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{exercise.nom_exercice}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    exercise.completed 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {exercise.ordre}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paramètres de l'exercice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {exercise.series}
                  </div>
                  <div className="text-sm text-gray-600">Séries</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {exercise.repetitions}
                  </div>
                  <div className="text-sm text-gray-600">Répétitions</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {exercise.temps_repos}
                  </div>
                  <div className="text-sm text-gray-600">Repos</div>
                </div>
              </div>

              {/* Statut de l'exercice */}
              <div className="flex items-center justify-center">
                {exercise.completed ? (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Exercice terminé</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">En attente</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Retours du client */}
          {exercise.completed && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <MessageSquare className="h-5 w-5" />
                  <span>Retours du client</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance réalisée */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Performance réalisée</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Séries réalisées:</span>
                        <span className="font-medium">
                          {exercise.sets_completed || 0} / {exercise.series}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Répétitions:</span>
                        <span className="font-medium">
                          {exercise.reps_completed || exercise.repetitions}
                        </span>
                      </div>
                      {exercise.exercise_duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Durée:</span>
                          <span className="font-medium">
                            {formatTime(exercise.exercise_duration)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Timing</h4>
                    <div className="space-y-2">
                      {exercise.started_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Début:</span>
                          <span className="font-medium text-sm">
                            {formatDate(exercise.started_at)}
                          </span>
                        </div>
                      )}
                      {exercise.completed_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fin:</span>
                          <span className="font-medium text-sm">
                            {formatDate(exercise.completed_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Évaluations du client */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Évaluations du client</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Difficulté */}
                    <div className={`p-4 rounded-lg ${getDifficultyColor(exercise.difficulty_rating || 0)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Difficulté ressentie</span>
                        <Star className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">
                        {exercise.difficulty_rating || 0}/10
                      </div>
                      <div className="text-sm opacity-75">
                        {exercise.difficulty_rating && exercise.difficulty_rating <= 3 ? 'Très facile' :
                         exercise.difficulty_rating && exercise.difficulty_rating <= 6 ? 'Modéré' :
                         exercise.difficulty_rating && exercise.difficulty_rating <= 8 ? 'Difficile' : 'Très difficile'}
                      </div>
                    </div>

                    {/* Niveau d'énergie */}
                    <div className={`p-4 rounded-lg ${getEnergyColor(exercise.energy_level || 0)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Niveau d'énergie</span>
                        <Heart className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">
                        {exercise.energy_level || 0}/10
                      </div>
                      <div className="text-sm opacity-75">
                        {exercise.energy_level && exercise.energy_level >= 8 ? 'Très énergique' :
                         exercise.energy_level && exercise.energy_level >= 5 ? 'Modéré' : 'Fatigué'}
                      </div>
                    </div>

                    {/* Qualité de la forme */}
                    <div className={`p-4 rounded-lg ${getFormColor(exercise.form_rating || 0)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Qualité de la forme</span>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">
                        {exercise.form_rating || 0}/10
                      </div>
                      <div className="text-sm opacity-75">
                        {exercise.form_rating && exercise.form_rating >= 8 ? 'Forme parfaite' :
                         exercise.form_rating && exercise.form_rating >= 6 ? 'Bonne forme' : 'À améliorer'}
                      </div>
                    </div>

                    {/* Niveau de douleur */}
                    <div className={`p-4 rounded-lg ${getPainColor(exercise.pain_level || 0)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Niveau de douleur</span>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">
                        {exercise.pain_level || 0}/10
                      </div>
                      <div className="text-sm opacity-75">
                        {exercise.pain_level && exercise.pain_level <= 3 ? 'Aucune douleur' :
                         exercise.pain_level && exercise.pain_level <= 6 ? 'Douleur légère' : 'Douleur importante'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes du client */}
                {exercise.exercise_notes && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Notes du client</h4>
                    <p className="text-gray-700 italic">"{exercise.exercise_notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message si exercice non terminé */}
          {!exercise.completed && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Exercice non terminé
                </h3>
                <p className="text-gray-600">
                  Les retours du client seront disponibles une fois l'exercice terminé.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
