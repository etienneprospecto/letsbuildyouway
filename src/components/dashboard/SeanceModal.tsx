import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Smile, 
  MessageCircle, 
  Lightbulb,
  Play,
  Pause,
  Target
} from 'lucide-react'
import { SeanceModalProps, SeanceWithExercices } from './__types__'
import { useToast } from '@/hooks/use-toast'

const SeanceModal: React.FC<SeanceModalProps> = ({
  seance,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [reponseCoach, setReponseCoach] = useState(seance?.reponse_coach || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (!seance) return null

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
        return <CheckCircle className="h-4 w-4" />
      case 'manquée':
        return <XCircle className="h-4 w-4" />
      case 'programmée':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getHumeurEmoji = (humeur: string | null) => {
    if (!humeur) return '😐'
    
    const humeurMap: { [key: string]: string } = {
      'excellent': '😄',
      'bien': '😊',
      'moyen': '😐',
      'difficile': '😓',
      'épuisé': '😵'
    }
    
    return humeurMap[humeur.toLowerCase()] || humeur
  }

  const handleSubmitReponse = async () => {
    if (!reponseCoach.trim()) return

    try {
      setIsSubmitting(true)
      await onUpdate(seance.id, { reponse_coach: reponseCoach })
      
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été enregistrée avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reponsesRapides = [
    "Excellent travail ! 🔥",
    "Continue comme ça ! 💪",
    "Belle progression ! ⭐",
    "N'oublie pas de bien récupérer 😴",
    "Prochaine séance encore plus forte ! 🚀"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(seance.statut)}`}>
              {getStatusIcon(seance.statut)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{seance.nom_seance}</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(seance.date_seance)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header de la séance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Informations de la séance</span>
                <Badge variant="outline" className={getStatusColor(seance.statut)}>
                  {seance.statut}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(seance.date_seance)}
                  </p>
                </div>
                
                {seance.date_fin && (
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Terminée à</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(seance.date_fin)}
                    </p>
                  </div>
                )}

                {seance.intensite_ressentie && (
                  <div className="text-center">
                    <Zap className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Intensité</p>
                    <p className="text-xs text-muted-foreground">
                      {seance.intensite_ressentie}/10
                    </p>
                  </div>
                )}

                {seance.humeur && (
                  <div className="text-center">
                    <Smile className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Humeur</p>
                    <p className="text-xs text-muted-foreground">
                      {getHumeurEmoji(seance.humeur)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Programme de la séance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Programme de la séance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seance.exercices && seance.exercices.length > 0 ? (
                <div className="space-y-3">
                  {seance.exercices.map((exercice, index) => (
                    <div
                      key={exercice.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        exercice.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{exercice.nom_exercice}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercice.series} séries × {exercice.repetitions}
                          {exercice.temps_repos && ` • Repos: ${exercice.temps_repos}`}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {exercice.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun exercice programmé pour cette séance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          {seance.statut === 'terminée' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {seance.exercices_termines}
                    </p>
                    <p className="text-sm text-muted-foreground">Exercices terminés</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {seance.taux_reussite}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback du client */}
          {seance.commentaire_client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Feedback du client</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getHumeurEmoji(seance.humeur)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 italic">
                        "{seance.commentaire_client}"
                      </p>
                      {seance.date_fin && (
                        <p className="text-xs text-blue-600 mt-2">
                          Terminé le {formatDate(seance.date_fin)} à {formatTime(seance.date_fin)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Réponse du coach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Votre réponse</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seance.reponse_coach ? (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">{seance.reponse_coach}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Écrivez votre réponse au client..."
                    value={reponseCoach}
                    onChange={(e) => setReponseCoach(e.target.value)}
                    rows={3}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {reponsesRapides.map((reponse, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setReponseCoach(reponse)}
                        className="text-xs"
                      >
                        {reponse}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleSubmitReponse}
                    disabled={!reponseCoach.trim() || isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer la réponse'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SeanceModal
