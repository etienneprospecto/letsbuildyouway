import React, { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, TrendingUp, Award, Play, CheckCircle, Clock, Droplets, Activity, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/AuthProvider'
import { ClientService, Client } from '@/services/clientService'
import { NutritionService, NutritionStats } from '@/services/nutritionService'
import { SeanceService, SeanceWithExercices } from '@/services/seanceService'
import { progressService } from '@/services/progressService'
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardStats {
  currentWeight: number | null
  weightChange: number
  progressPercentage: number
  sessionsThisWeek: number
  sessionsCompleted: number
  totalSessions: number
  totalSessionsCompleted: number
  nutritionStats: NutritionStats | null
  nextSession: SeanceWithExercices | null
  recentProgress: any[]
}

const ClientDashboard: React.FC = memo(() => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    currentWeight: null,
    weightChange: 0,
    progressPercentage: 0,
    sessionsThisWeek: 0,
    sessionsCompleted: 0,
    totalSessions: 0,
    totalSessionsCompleted: 0,
    nutritionStats: null,
    nextSession: null,
    recentProgress: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.email || !profile?.client_id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log('🔄 Chargement dashboard pour client:', profile.client_id)

        // Récupérer les données du client
        let client = null
        try {
          client = await ClientService.getClientById(profile.client_id)
          console.log('👤 Client récupéré:', client)
        } catch (err) {
          console.warn('⚠️ Erreur récupération client:', err)
        }
        
        // Récupérer les données de progression
        let progressData = []
        try {
          progressData = await progressService.getClientProgress(profile.client_id)
          console.log('📊 Données progression:', progressData)
        } catch (err) {
          console.warn('⚠️ Erreur récupération progression:', err)
        }
        
        // Récupérer les séances
        let seances = []
        try {
          seances = await SeanceService.getSeancesByClient(profile.client_id)
          console.log('🏋️ Séances récupérées:', seances)
        } catch (err) {
          console.warn('⚠️ Erreur récupération séances:', err)
        }
        
        // Récupérer les stats nutrition
        let nutritionStats = null
        try {
          nutritionStats = await NutritionService.getNutritionStats(profile.client_id)
          console.log('🥗 Stats nutrition:', nutritionStats)
        } catch (err) {
          console.warn('⚠️ Erreur récupération nutrition:', err)
        }

        // Calculer les statistiques
        const currentWeight = progressData.length > 0 ? progressData[0].weight_kg : client?.weight_kg || null
        const previousWeight = progressData.length > 1 ? progressData[1].weight_kg : null
        const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : 0

        // Calculer les séances de la semaine
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        
        const sessionsThisWeek = seances.filter(seance => {
          const seanceDate = new Date(seance.date_seance)
          return isWithinInterval(seanceDate, { start: weekStart, end: weekEnd })
        }).length

        // Calculer les séances complétées de la semaine actuelle
        const sessionsCompletedThisWeek = seances.filter(seance => {
          const seanceDate = new Date(seance.date_seance)
          return seance.statut === 'terminée' && isWithinInterval(seanceDate, { start: weekStart, end: weekEnd })
        }).length

        // Calculer le total des séances complétées (toutes semaines confondues)
        const sessionsCompleted = seances.filter(seance => seance.statut === 'terminée').length

        // Prochaine séance
        const upcomingSeances = seances
          .filter(seance => new Date(seance.date_seance) > now)
          .sort((a, b) => new Date(a.date_seance).getTime() - new Date(b.date_seance).getTime())
        
        const nextSession = upcomingSeances.length > 0 ? upcomingSeances[0] : null

        console.log('📊 Stats calculées:', {
          sessionsCompletedThisWeek,
          sessionsCompleted,
          sessionsThisWeek,
          totalSeances: seances.length,
          clientSessionsCompleted: client?.sessions_completed
        })

        setStats({
          currentWeight,
          weightChange,
          progressPercentage: client?.progress_percentage || 0,
          sessionsThisWeek,
          sessionsCompleted: sessionsCompletedThisWeek, // Utiliser les séances de la semaine actuelle
          totalSessions: seances.length,
          totalSessionsCompleted: sessionsCompleted, // Total toutes semaines confondues
          nutritionStats,
          nextSession,
          recentProgress: progressData.slice(0, 3)
        })

      } catch (err) {
        console.error('❌ Erreur chargement dashboard:', err)
        console.error('❌ Détails erreur:', {
          message: err instanceof Error ? err.message : 'Erreur inconnue',
          stack: err instanceof Error ? err.stack : undefined,
          clientId: profile.client_id,
          userEmail: user?.email
        })
        setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.email, profile?.client_id])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue !</h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre parcours fitness
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poids actuel</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.currentWeight ? `${stats.currentWeight} kg` : '-- kg'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.weightChange !== 0 ? (
                  <span className={stats.weightChange > 0 ? 'text-destructive' : 'text-success'}>
                    {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
                  </span>
                ) : (
                  'Aucune donnée'
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
              <Progress value={stats.progressPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.sessionsThisWeek}/{stats.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Séances programmées
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Séances complétées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.sessionsCompleted}
              </div>
              <p className="text-xs text-muted-foreground">
                Cette semaine
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total réalisées</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSessionsCompleted}
              </div>
              <p className="text-xs text-muted-foreground">
                Toutes semaines
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Next Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Prochaine séance
            </CardTitle>
            <CardDescription>
              Votre prochain entraînement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.nextSession ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(stats.nextSession.date_seance), 'EEEE d MMMM', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{stats.nextSession.heure_debut}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.nextSession.exercices?.length || 0} exercices programmés
                  </div>
                  <Button className="w-full">
                    Voir les détails
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune séance programmée</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Votre coach programmera vos entraînements
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Nutrition du jour
            </CardTitle>
            <CardDescription>
              Votre suivi nutritionnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.nutritionStats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(stats.nutritionStats.totalCalories)}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                      <Progress 
                        value={stats.nutritionStats.progress.calories} 
                        className="mt-1 h-2" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.nutritionStats.waterGlasses}</div>
                      <div className="text-xs text-muted-foreground">Verres d'eau</div>
                      <Progress 
                        value={stats.nutritionStats.progress.water} 
                        className="mt-1 h-2" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-medium">{Math.round(stats.nutritionStats.totalProteins)}g</div>
                      <div className="text-xs text-muted-foreground">Protéines</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{Math.round(stats.nutritionStats.totalCarbs)}g</div>
                      <div className="text-xs text-muted-foreground">Glucides</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{Math.round(stats.nutritionStats.totalFats)}g</div>
                      <div className="text-xs text-muted-foreground">Lipides</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune donnée nutrition</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Commencez à suivre votre alimentation
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activités récentes
          </CardTitle>
          <CardDescription>
            Votre progression récente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentProgress.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProgress.map((progress, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <div className="font-medium">
                          {progress.weight_kg ? `${progress.weight_kg} kg` : 'Mesure ajoutée'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(progress.measurement_date), 'd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    {progress.weight_kg && (
                      <Badge variant="outline">
                        Poids
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune activité récente</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Commencez à suivre votre progression
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ClientDashboard.displayName = 'ClientDashboard'

export default ClientDashboard