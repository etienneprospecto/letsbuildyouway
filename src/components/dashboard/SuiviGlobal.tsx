import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Clock, Utensils, Heart, Brain, X } from 'lucide-react'
import { WeeklyFeedbackBasicInfo } from './__types__'
import HebdoFeedbackService from '@/services/hebdoFeedbackService'

interface SuiviGlobalProps {
  clientId: string
}

interface FeedbackDetails {
  alimentation: {
    score: number
    comment?: string
  }
  lifestyle: {
    score: number
    comment?: string
  }
  feelings: {
    score: number
    comment?: string
  }
}

const SuiviGlobal: React.FC<SuiviGlobalProps> = ({ clientId }) => {
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedbackBasicInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<WeeklyFeedbackBasicInfo | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageScore: 0,
    lastFeedbackDate: null as string | null,
    completionRate: 0
  })

  useEffect(() => {
    loadFeedbacks()
  }, [clientId])

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const [feedbacksData, statsData] = await Promise.all([
        HebdoFeedbackService.getClientFeedbacks(clientId),
        HebdoFeedbackService.getClientFeedbackStats(clientId)
      ])
      
      setFeedbacks(feedbacksData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading feedbacks:', error)
      // En cas d'erreur, on initialise avec des données vides
      setFeedbacks([])
      setStats({
        totalFeedbacks: 0,
        averageScore: 0,
        lastFeedbackDate: null,
        completionRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart)
    const end = new Date(weekEnd)
    
    return `Semaine du ${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-blue-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const handleFeedbackClick = (feedback: WeeklyFeedbackBasicInfo) => {
    setSelectedFeedback(feedback)
    setIsDetailModalOpen(true)
  }

  const FeedbackCard: React.FC<{
    title: string
    score: number
    color: string
    icon: React.ElementType
    onClick: () => void
    submitted?: boolean
  }> = ({ title, score, color, icon: Icon, onClick, submitted = false }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`border-2 hover:border-${color}-300 transition-colors`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-center flex items-center justify-center space-x-2">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}/10
          </div>
          <Progress value={score * 10} className="h-2 mb-2" />
          <div className="flex items-center justify-center space-x-1">
            {submitted ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-xs ${submitted ? 'text-green-600' : 'text-gray-500'}`}>
              {submitted ? 'Soumis' : 'En attente'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du suivi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span>Vue d'ensemble du suivi</span>
            </CardTitle>
            <CardDescription>
              Statistiques des feedbacks hebdomadaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalFeedbacks}</div>
                <p className="text-sm text-muted-foreground">Feedbacks soumis</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageScore}/100</div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
                <p className="text-sm text-muted-foreground">Taux de completion</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.lastFeedbackDate ? '✓' : '✗'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.lastFeedbackDate ? 'À jour' : 'En retard'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedbacks hebdomadaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Feedbacks hebdomadaires</span>
            </CardTitle>
            <CardDescription>
              Cliquez sur une semaine pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucun feedback hebdomadaire</p>
                <p className="text-sm text-gray-400">
                  Les feedbacks apparaîtront ici une fois soumis par le client
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback, index) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Semaine</p>
                              <p className="text-lg font-semibold">
                                {formatWeekRange(feedback.week_start, feedback.week_end)}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Score global</p>
                              <div className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
                                {feedback.score}/100
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${
                                feedback.submitted_at 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {feedback.submitted_at ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Soumis</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>En attente</span>
                                </div>
                              )}
                            </Badge>
                            
                            {feedback.submitted_at && (
                              <p className="text-xs text-gray-500">
                                {new Date(feedback.submitted_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>{feedback.score}%</span>
                          </div>
                          <Progress 
                            value={feedback.score} 
                            className="h-2"
                          />
                        </div>

                        {/* 3 cartes de suivi */}
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <FeedbackCard
                            title="Alimentation"
                            score={Math.round(feedback.score * 0.3)}
                            color="green"
                            icon={Utensils}
                            onClick={() => handleFeedbackClick(feedback)}
                            submitted={!!feedback.submitted_at}
                          />
                          <FeedbackCard
                            title="Style de vie"
                            score={Math.round(feedback.score * 0.35)}
                            color="blue"
                            icon={Heart}
                            onClick={() => handleFeedbackClick(feedback)}
                            submitted={!!feedback.submitted_at}
                          />
                          <FeedbackCard
                            title="Ressentis"
                            score={Math.round(feedback.score * 0.35)}
                            color="purple"
                            icon={Brain}
                            onClick={() => handleFeedbackClick(feedback)}
                            submitted={!!feedback.submitted_at}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Conseils et recommandations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Conseils pour le coach</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Encouragez votre client à soumettre ses feedbacks hebdomadaires régulièrement</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Analysez les tendances pour adapter le programme d'entraînement</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Intervenez rapidement si les scores baissent de manière significative</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-600">•</span>
                <span>Utilisez les commentaires pour personnaliser votre accompagnement</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal détail feedback */}
      {isDetailModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {formatWeekRange(selectedFeedback.week_start, selectedFeedback.week_end)}
                </h2>
                <p className="text-gray-600">
                  Score global: {selectedFeedback.score}/100
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Détails des 3 catégories */}
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Utensils className="h-4 w-4 text-green-500" />
                      <span>Alimentation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {Math.round(selectedFeedback.score * 0.3)}/10
                      </div>
                      <Progress value={selectedFeedback.score * 3} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Heart className="h-4 w-4 text-blue-500" />
                      <span>Style de vie</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {Math.round(selectedFeedback.score * 0.35)}/10
                      </div>
                      <Progress value={selectedFeedback.score * 3.5} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>Ressentis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {Math.round(selectedFeedback.score * 0.35)}/10
                      </div>
                      <Progress value={selectedFeedback.score * 3.5} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedFeedback.submitted_at && (
                <div className="text-center text-sm text-gray-500">
                  Soumis le {new Date(selectedFeedback.submitted_at).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuiviGlobal
