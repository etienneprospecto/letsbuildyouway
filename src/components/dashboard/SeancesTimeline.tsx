import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, MessageCircle, Zap, Smile, CheckCircle, X, Edit, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
}

const SeancesTimeline: React.FC<SeancesTimelineProps> = ({
  seances,
  onAddSeance,
  onSeanceClick,
  isLoading = false
}) => {
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [coachResponse, setCoachResponse] = useState('')

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
    // TODO: Sauvegarder la réponse du coach
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
      {/* Section Programmer une séance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Programmer une séance</CardTitle>
            <CardDescription className="text-orange-600">
              Créez une nouvelle séance, réutilisez une séance précédente ou piochez dans votre bibliothèque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onAddSeance}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une séance
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline des séances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Timeline des séances</span>
            </CardTitle>
            <CardDescription>
              Historique et programmation des séances d'entraînement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedSeances.length > 0 ? (
              <div className="space-y-4">
                {sortedSeances.map((seance, index) => (
                  <motion.div
                    key={seance.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Ligne de timeline */}
                    {index < sortedSeances.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                    )}
                    
                    <div
                      className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSeanceClick(seance)}
                    >
                      {/* Indicateur de statut */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                        {getStatusIcon(seance.statut)}
                      </div>

                      {/* Contenu de la séance */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {seance.nom_seance}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(seance.statut)} font-medium`}
                          >
                            {seance.statut}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {formatDate(seance.date_seance)}
                        </p>

                        {/* Métriques de la séance */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {seance.intensite_ressentie && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-4 w-4" />
                              <span>{seance.intensite_ressentie}/10</span>
                            </div>
                          )}
                          
                          {seance.humeur && (
                            <div className="flex items-center space-x-1">
                              <Smile className="h-4 w-4" />
                              <span>{getHumeurEmoji(seance.humeur)}</span>
                            </div>
                          )}
                          
                          {seance.commentaire_client && (
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>Commentaire</span>
                            </div>
                          )}
                          
                          {seance.statut === 'terminée' && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{seance.taux_reussite}% réussite</span>
                            </div>
                          )}
                        </div>

                        {/* Aperçu du commentaire */}
                        {seance.commentaire_client && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 italic">
                            "{seance.commentaire_client.length > 100 
                              ? seance.commentaire_client.substring(0, 100) + '...'
                              : seance.commentaire_client}"
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune séance programmée</p>
                <p className="text-sm text-gray-400 mb-4">
                  Commencez par programmer la première séance de votre client
                </p>
                <Button
                  onClick={onAddSeance}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Programmer une séance
                </Button>
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
    </div>
  )
}

export default SeancesTimeline
