import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Scale, Trophy, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProgressionData {
  poids_depart: number | null
  poids_objectif: number | null
  poids_actuel: number | null
}

interface ProgressionChartProps {
  client: {
    first_name: string
    last_name: string
  } & ProgressionData
  progressHistory?: Array<{
    date: string
    weight: number | null
    body_fat?: number
    muscle_mass?: number
  }>
  onSave?: (data: ProgressionData) => Promise<void>
  isLoading?: boolean
}

const ProgressionChart: React.FC<ProgressionChartProps> = ({ 
  client, 
  progressHistory = [],
  onSave,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<ProgressionData>({
    poids_depart: client.poids_depart,
    poids_objectif: client.poids_objectif,
    poids_actuel: client.poids_actuel
  })

  const { poids_depart, poids_objectif, poids_actuel } = editData

  // Calculs de progression
  const hasValidData = poids_depart && poids_objectif && poids_actuel
  
  let progressPercentage = 0
  let remainingWeight = 0
  let isGainingWeight = false
  let progressMessage = ""

  if (hasValidData) {
    const totalChange = Math.abs(poids_objectif - poids_depart)
    const currentChange = Math.abs(poids_actuel - poids_depart)
    
    // Déterminer si c'est une prise ou perte de poids
    isGainingWeight = poids_objectif > poids_depart
    
    if (totalChange > 0) {
      progressPercentage = Math.min((currentChange / totalChange) * 100, 100)
    }
    
    remainingWeight = Math.abs(poids_objectif - poids_actuel)
    
    if (progressPercentage >= 100) {
      progressMessage = "🎉 Objectif atteint ! Félicitations !"
    } else {
      const action = isGainingWeight ? "prendre" : "perdre"
      progressMessage = `Plus que ${remainingWeight.toFixed(1)} kg à ${action} !`
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(editData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      poids_depart: client.poids_depart,
      poids_objectif: client.poids_objectif,
      poids_actuel: client.poids_actuel
    })
    setIsEditing(false)
  }

  const updateWeight = (field: keyof ProgressionData, value: number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Générer des étapes de progression pour le graphique
  const generateProgressSteps = () => {
    if (!hasValidData) return []
    
    const steps = []
    const totalSteps = 10
    const weightDiff = poids_objectif! - poids_depart!
    const stepSize = weightDiff / totalSteps
    
    for (let i = 0; i <= totalSteps; i++) {
      const stepWeight = poids_depart! + (stepSize * i)
      const stepDate = new Date()
      stepDate.setDate(stepDate.getDate() + (i * 7)) // +1 semaine par étape
      
      steps.push({
        step: i + 1,
        weight: stepWeight,
        date: stepDate,
        completed: stepWeight <= poids_actuel!
      })
    }
    
    return steps
  }

  const progressSteps = generateProgressSteps()

  return (
    <div className="space-y-6">
      {/* Cartes de métriques */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poids de départ</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_depart || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_depart', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_depart ? `${poids_depart} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Point de départ
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
              <CardTitle className="text-sm font-medium">Poids actuel</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_actuel || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_actuel', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_actuel ? `${poids_actuel} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Dernière mesure
              </p>
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
              <CardTitle className="text-sm font-medium">Objectif</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_objectif || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_objectif', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_objectif ? `${poids_objectif} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Cible à atteindre
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphique de progression vers l'objectif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  <span>Progression vers l'objectif</span>
                </CardTitle>
                <CardDescription>
                  Suivi de l'évolution du poids
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasValidData ? (
              <>
                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progression</span>
                    <span className="text-muted-foreground">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3"
                  />
                </div>

                {/* Message de progression */}
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-lg font-semibold text-orange-800">
                    {progressMessage}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    {progressPercentage.toFixed(1)}% de l'objectif atteint
                  </p>
                </div>

                {/* Graphique linéaire avec étapes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Étapes de progression</h4>
                  <div className="relative">
                    {/* Ligne de progression */}
                    <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200" />
                    
                    {/* Étapes */}
                    <div className="relative flex justify-between">
                      {progressSteps.map((step, index) => (
                        <div
                          key={step.step}
                          className="flex flex-col items-center relative z-10"
                        >
                          {/* Point d'étape */}
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              step.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                          
                          {/* Numéro d'étape */}
                          <span className="text-xs font-medium mt-1">
                            {step.step}
                          </span>
                          
                          {/* Poids */}
                          <span className="text-xs text-gray-500 mt-1">
                            {step.weight.toFixed(1)}kg
                          </span>
                          
                          {/* Date */}
                          <span className="text-xs text-gray-400 mt-1 transform -rotate-45">
                            {step.date.toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Données de progression manquantes</p>
                <p className="text-sm text-gray-400">
                  Renseignez les poids de départ, actuel et objectif pour voir la progression
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  Ajouter les données
                </Button>
              </div>
            )}

            {/* Boutons d'action si en mode édition */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Annuler
                </Button>
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                  Sauvegarder
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProgressionChart
