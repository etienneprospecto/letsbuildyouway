import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Target } from 'lucide-react'
import { useClientSeances, Seance } from '@/hooks/useClientSeances'
import { useWeek } from '@/providers/WeekProvider'

interface WorkoutTimelineProps {
  userEmail: string | undefined
}

const WorkoutTimeline: React.FC<WorkoutTimelineProps> = ({ userEmail }) => {
  const {
    seances,
    loading,
    getCurrentWeekSeances
  } = useClientSeances(userEmail)

  // Utiliser le contexte global pour la gestion de la semaine
  const { 
    currentWeekStart, 
    currentTime, 
    goToPreviousWeek, 
    goToNextWeek 
  } = useWeek()

  // Obtenir les 7 jours de la semaine actuelle
  const getWeekDays = () => {
    const days = []
    const weekStart = new Date(currentWeekStart)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      
      const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
      
      days.push({
        date: day,
        dayName: dayNames[i],
        dayNumber: day.getDate(),
        isToday: isToday(day)
      })
    }
    
    return days
  }

  // Obtenir les séances pour un jour donné
  const getSeancesForDay = (date: Date) => {
    return seances.filter(seance => {
      const seanceDate = new Date(seance.date_seance)
      return seanceDate.toDateString() === date.toDateString()
    })
  }

  // Vérifier si c'est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDays = getWeekDays()

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Planning de la semaine</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[200px] text-center">
              {(() => {
                const weekEnd = new Date(currentWeekStart)
                weekEnd.setDate(currentWeekStart.getDate() + 6)
                const startDate = currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                const endDate = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                return `${startDate} - ${endDate}`
              })()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grille des 7 jours */}
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, index) => {
            const daySeances = getSeancesForDay(day.date)
            
            return (
              <div key={index} className={`p-3 rounded-lg border-2 ${
                day.isToday 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {day.dayName}
                  </div>
                  <div className={`text-lg font-bold mb-2 ${
                    day.isToday ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    {day.dayNumber}
                  </div>
                  
                  {day.isToday && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      Aujourd'hui
                    </Badge>
                  )}
                  
                  <div className="space-y-1">
                    {daySeances.length > 0 ? (
                      daySeances.map((seance, seanceIndex) => (
                        <div key={seanceIndex} className="text-xs">
                          <div className={`flex items-center justify-center gap-1 p-1 rounded ${
                            seance.statut === 'terminée' ? 'bg-green-100 text-green-700' :
                            seance.statut === 'manquée' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            <Target className="h-3 w-3" />
                            <span className="truncate">
                              {seance.nom_seance}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">
                        Repos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default WorkoutTimeline
