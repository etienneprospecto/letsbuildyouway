import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

interface ProgressData {
  id: string
  client_id: string
  measurement_date: string
  weight_kg?: number
  waist_circumference?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  measurements?: any
  photos_urls?: string[]
  notes?: string
}

interface WeightChartProps {
  data: ProgressData[]
}

interface HoveredPoint {
  entry: ProgressData
  x: number
  y: number
  index: number
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const [showWeight, setShowWeight] = useState(true)
  const [showWaist, setShowWaist] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)

  // Filtrer les données avec poids et/ou tour de taille valides et les trier par date
  const validData = data
    .filter(entry => 
      (entry.weight_kg !== null && entry.weight_kg !== undefined) || 
      (entry.waist_circumference !== null && entry.waist_circumference !== undefined)
    )
    .sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime())

  console.log('WeightChart reçoit:', data.length, 'données totales')
  console.log('WeightChart valides:', validData.length, 'données avec mesures')

  // Créer le graphique
  const createChart = () => {
    if (!chartRef.current || !validData.length) return

    const canvas = chartRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Obtenir la taille réelle du canvas
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Ajuster la taille du canvas pour la résolution
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = 40
    const chartWidth = rect.width - (padding * 2)
    const chartHeight = rect.height - (padding * 2)

    // Calculer les min/max pour chaque axe
    const weights = validData.map(d => d.weight_kg).filter(w => w !== null && w !== undefined) as number[]
    const waists = validData.map(d => d.waist_circumference).filter(w => w !== null && w !== undefined) as number[]
    
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const minWaist = Math.min(...waists)
    const maxWaist = Math.max(...waists)
    
    const weightRange = maxWeight - minWeight
    const waistRange = maxWaist - minWaist
    
    // Ajouter une marge de 5% de chaque côté
    const weightMargin = weightRange * 0.05
    const waistMargin = waistRange * 0.05
    
    const weightMin = minWeight - weightMargin
    const weightMax = maxWeight + weightMargin
    const waistMin = minWaist - waistMargin
    const waistMax = maxWaist + waistMargin

    // Fonction pour convertir les coordonnées
    const getX = (index: number) => padding + (index / (validData.length - 1)) * chartWidth
    const getWeightY = (weight: number) => padding + chartHeight - ((weight - weightMin) / (weightMax - weightMin)) * chartHeight
    const getWaistY = (waist: number) => padding + chartHeight - ((waist - waistMin) / (waistMax - waistMin)) * chartHeight

    // Dessiner la grille horizontale
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Calculer les labels de dates optimisés
    const maxLabels = 8
    const labelInterval = Math.max(1, Math.floor(validData.length / maxLabels))
    let dateLabels = validData.filter((_, index) => index % labelInterval === 0)
    
    // Si on a trop peu de labels, prendre les premiers et derniers
    if (dateLabels.length < 3 && validData.length > 2) {
      dateLabels = []
      dateLabels.push(validData[0])
      if (validData.length > 1) {
        dateLabels.push(validData[validData.length - 1])
      }
      if (validData.length > 2) {
        const midIndex = Math.floor(validData.length / 2)
        dateLabels.push(validData[midIndex])
      }
    }
    
    // Dessiner la grille verticale pour les dates
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    dateLabels.forEach((entry) => {
      const dataIndex = validData.indexOf(entry)
      const x = getX(dataIndex)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + chartHeight)
      ctx.stroke()
    })

    // Dessiner les axes
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + chartHeight)
    ctx.lineTo(padding + chartWidth, padding + chartHeight)
    ctx.stroke()

    // Dessiner la courbe de poids
    if (showWeight && weights.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      validData.forEach((entry, index) => {
        if (entry.weight_kg !== null && entry.weight_kg !== undefined) {
          const x = getX(index)
          const y = getWeightY(entry.weight_kg)
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      
      ctx.stroke()

      // Dessiner les points de poids
      ctx.fillStyle = '#3b82f6'
      validData.forEach((entry, index) => {
        if (entry.weight_kg !== null && entry.weight_kg !== undefined) {
          const x = getX(index)
          const y = getWeightY(entry.weight_kg)
          
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    // Dessiner la courbe de tour de taille
    if (showWaist && waists.length > 0) {
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      validData.forEach((entry, index) => {
        if (entry.waist_circumference !== null && entry.waist_circumference !== undefined) {
          const x = getX(index)
          const y = getWaistY(entry.waist_circumference)
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      
      ctx.stroke()

      // Dessiner les points de tour de taille
      ctx.fillStyle = '#f97316'
      validData.forEach((entry, index) => {
        if (entry.waist_circumference !== null && entry.waist_circumference !== undefined) {
          const x = getX(index)
          const y = getWaistY(entry.waist_circumference)
          
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    // Dessiner les légendes
    ctx.font = '14px Inter, sans-serif'
    ctx.fillStyle = '#374151'
    
    // Légende poids
    if (showWeight && weights.length > 0) {
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(padding + chartWidth - 200, padding + 20, 15, 3)
      ctx.fillStyle = '#374151'
      ctx.fillText('Poids (kg)', padding + chartWidth - 180, padding + 25)
    }
    
    // Légende tour de taille
    if (showWaist && waists.length > 0) {
      ctx.fillStyle = '#f97316'
      ctx.fillRect(padding + chartWidth - 200, padding + 40, 15, 3)
      ctx.fillStyle = '#374151'
      ctx.fillText('Tour de taille (cm)', padding + chartWidth - 180, padding + 45)
    }

    // Dessiner les étiquettes des axes
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = '#6b7280'
    
    // Axe Y gauche (poids)
    if (showWeight && weights.length > 0) {
      for (let i = 0; i <= 5; i++) {
        const value = weightMin + (i / 5) * (weightMax - weightMin)
        const y = padding + chartHeight - (i / 5) * chartHeight
        ctx.fillText(value.toFixed(1), 5, y + 4)
      }
    }
    
    // Axe Y droit (tour de taille)
    if (showWaist && waists.length > 0) {
      for (let i = 0; i <= 5; i++) {
        const value = waistMin + (i / 5) * (waistMax - waistMin)
        const y = padding + chartHeight - (i / 5) * chartHeight
        ctx.fillText(value.toFixed(0), padding + chartWidth + 5, y + 4)
      }
    }

    // Dessiner les étiquettes des dates (utilise la même logique que la grille)
    dateLabels.forEach((entry) => {
      const dataIndex = validData.indexOf(entry)
      const x = getX(dataIndex)
      const date = new Date(entry.measurement_date)
      
      // Format de date plus lisible
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      // Afficher l'année seulement si c'est différent de l'année actuelle
      const currentYear = new Date().getFullYear()
      const dateStr = year !== currentYear ? `${day}/${month}/${year}` : `${day}/${month}`
      
      // Centrer le texte sur le point
      const textWidth = ctx.measureText(dateStr).width
      const textX = x - (textWidth / 2)
      
      // Dessiner un fond semi-transparent pour la lisibilité
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillRect(textX - 4, padding + chartHeight + 15, textWidth + 8, 20)
      
      // Dessiner le texte
      ctx.fillStyle = '#374151'
      ctx.fillText(dateStr, textX, padding + chartHeight + 28)
    })
  }

  // Gérer le survol de la souris pour afficher les tooltips
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !validData.length) {
      return
    }

    const canvas = chartRef.current
    const rect = canvas.getBoundingClientRect()
    const padding = 40
    const chartWidth = rect.width - (padding * 2)
    const chartHeight = rect.height - (padding * 2)

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Vérifier si la souris est dans la zone du graphique
    if (mouseX < padding || mouseX > padding + chartWidth || 
        mouseY < padding || mouseY > padding + chartHeight) {
      setHoveredPoint(null)
      return
    }

    // Calculer l'index du point le plus proche
    const pointIndex = Math.round(((mouseX - padding) / chartWidth) * (validData.length - 1))
    const clampedIndex = Math.max(0, Math.min(pointIndex, validData.length - 1))
    const hoveredEntry = validData[clampedIndex]

    if (hoveredEntry) {
      setHoveredPoint({
        entry: hoveredEntry,
        x: mouseX,
        y: mouseY,
        index: clampedIndex
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  // Redessiner le graphique quand les données ou les options changent
  useEffect(() => {
    const timer = setTimeout(() => {
      createChart()
    }, 100) // Petit délai pour s'assurer que le canvas est rendu
    
    return () => clearTimeout(timer)
  }, [validData, showWeight, showWaist])

  // Redessiner le graphique quand la fenêtre est redimensionnée
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        createChart()
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution des mesures
          </CardTitle>
          <CardDescription>Courbe de progression de votre poids et tour de taille</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucune donnée disponible</h3>
            <p className="text-sm text-muted-foreground">
              Commencez à enregistrer vos mesures pour voir votre progression
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution des mesures
        </CardTitle>
        <CardDescription>Courbe de progression de votre poids et tour de taille</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contrôles d'affichage */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showWeight ? "default" : "outline"}
              size="sm"
              onClick={() => setShowWeight(!showWeight)}
              className="flex items-center gap-2"
            >
              {showWeight ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Poids
            </Button>
            <Button
              variant={showWaist ? "default" : "outline"}
              size="sm"
              onClick={() => setShowWaist(!showWaist)}
              className="flex items-center gap-2"
            >
              {showWaist ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Tour de taille
            </Button>
          </div>

          {/* Graphique */}
          <div className="relative">
            <canvas
              ref={chartRef}
              width={800}
              height={400}
              className="w-full h-full border rounded-lg cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none z-10 min-w-[200px]"
                style={{
                  left: Math.min(hoveredPoint.x + 10, window.innerWidth - 250),
                  top: Math.max(hoveredPoint.y - 10, 10),
                }}
              >
                <div className="space-y-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {new Date(hoveredPoint.entry.measurement_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  
                  {hoveredPoint.entry.weight_kg && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">
                        Poids: <strong>{hoveredPoint.entry.weight_kg} kg</strong>
                      </span>
                    </div>
                  )}
                  
                  {hoveredPoint.entry.waist_circumference && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">
                        Tour de taille: <strong>{hoveredPoint.entry.waist_circumference} cm</strong>
                      </span>
                    </div>
                  )}
                  
                  {hoveredPoint.entry.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
                      {hoveredPoint.entry.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {showWeight && validData.some(d => d.weight_kg) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Poids</h4>
                <div className="space-y-1 text-sm">
                  <div>Actuel: <strong>{validData[validData.length - 1]?.weight_kg} kg</strong></div>
                  <div>Initial: <strong>{validData[0]?.weight_kg} kg</strong></div>
                  <div className="text-blue-700 dark:text-blue-300">
                    Évolution: {((validData[validData.length - 1]?.weight_kg || 0) - (validData[0]?.weight_kg || 0)) > 0 ? '+' : ''}
                    {((validData[validData.length - 1]?.weight_kg || 0) - (validData[0]?.weight_kg || 0)).toFixed(1)} kg
            </div>
          </div>
            </div>
            )}
            
            {showWaist && validData.some(d => d.waist_circumference) && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Tour de taille</h4>
                <div className="space-y-1 text-sm">
                  <div>Actuel: <strong>{validData[validData.length - 1]?.waist_circumference} cm</strong></div>
                  <div>Initial: <strong>{validData[0]?.waist_circumference} cm</strong></div>
                  <div className="text-orange-700 dark:text-orange-300">
                    Évolution: {((validData[validData.length - 1]?.waist_circumference || 0) - (validData[0]?.waist_circumference || 0)) > 0 ? '+' : ''}
                    {((validData[validData.length - 1]?.waist_circumference || 0) - (validData[0]?.waist_circumference || 0)).toFixed(1)} cm
          </div>
            </div>
          </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WeightChart