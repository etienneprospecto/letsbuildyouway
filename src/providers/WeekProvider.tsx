import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WeekContextType {
  currentWeekStart: Date
  currentTime: Date
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  goToCurrentWeek: () => void
  getWeekStart: (date: Date) => Date
  getWeekEnd: (date: Date) => Date
  formatWeekRange: (date: Date) => string
  isCurrentWeek: (date: Date) => boolean
}

const WeekContext = createContext<WeekContextType | undefined>(undefined)

interface WeekProviderProps {
  children: ReactNode
}

export const WeekProvider: React.FC<WeekProviderProps> = ({ children }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Mettre à jour l'heure en temps réel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
      setCurrentTime(parisTime)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialiser la semaine actuelle
  useEffect(() => {
    // Utiliser la vraie date actuelle pour déterminer la semaine courante
    const today = new Date()
    const weekStart = getWeekStart(today)
    console.log('🗓️ Initialisation de la semaine actuelle:', {
      today: today.toISOString(),
      weekStart: weekStart.toISOString(),
      weekRange: formatWeekRange(weekStart)
    })
    setCurrentWeekStart(weekStart)
  }, [])

  // Fonction pour obtenir le début de semaine (lundi)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuster pour lundi
    const monday = new Date(d.setDate(diff))
    monday.setHours(0, 0, 0, 0) // Réinitialiser l'heure
    return monday
  }

  // Fonction pour obtenir la fin de semaine (dimanche)
  const getWeekEnd = (date: Date): Date => {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999) // Fin de journée
    return end
  }

  // Formater la plage de semaine
  const formatWeekRange = (date: Date): string => {
    const start = getWeekStart(date)
    const end = getWeekEnd(date)
    
    const startStr = start.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
    const endStr = end.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
    
    return `${startStr} - ${endStr}`
  }

  // Vérifier si une date est dans la semaine actuelle
  const isCurrentWeek = (date: Date): boolean => {
    const today = new Date()
    const currentWeekStart = getWeekStart(today)
    const currentWeekEnd = getWeekEnd(today)
    
    const dateWeekStart = getWeekStart(date)
    
    // Comparer les débuts de semaine pour déterminer si c'est la même semaine
    return dateWeekStart.getTime() === currentWeekStart.getTime()
  }

  // Navigation entre les semaines
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const weekStart = getWeekStart(today)
    setCurrentWeekStart(weekStart)
  }

  // Vérifier si la semaine actuelle a changé et mettre à jour automatiquement
  useEffect(() => {
    const checkWeekChange = () => {
      const today = new Date()
      const currentWeekStartToday = getWeekStart(today)
      
      // Si on est dans une nouvelle semaine
      if (currentWeekStartToday.getTime() !== currentWeekStart.getTime()) {
        console.log('📅 Changement de semaine détecté:', {
          ancienneSemaine: formatWeekRange(currentWeekStart),
          nouvelleSemaine: formatWeekRange(currentWeekStartToday)
        })
        setCurrentWeekStart(currentWeekStartToday)
      }
    }

    // Vérifier toutes les minutes
    const interval = setInterval(checkWeekChange, 60000)
    return () => clearInterval(interval)
  }, [currentWeekStart, formatWeekRange])

  const value: WeekContextType = {
    currentWeekStart,
    currentTime,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    getWeekStart,
    getWeekEnd,
    formatWeekRange,
    isCurrentWeek
  }

  return (
    <WeekContext.Provider value={value}>
      {children}
    </WeekContext.Provider>
  )
}

export const useWeek = (): WeekContextType => {
  const context = useContext(WeekContext)
  if (context === undefined) {
    throw new Error('useWeek must be used within a WeekProvider')
  }
  return context
}
