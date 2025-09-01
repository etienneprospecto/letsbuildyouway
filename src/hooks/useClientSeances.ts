import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface Seance {
  id: string
  nom_seance: string
  date_seance: string
  statut: string
  intensite_ressentie?: number
  humeur?: string
  commentaire_client?: string
  exercices_termines?: number
  taux_reussite?: number
  reponse_coach?: string
}

export interface ExerciceSeance {
  id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string
  ordre: number
  completed: boolean
}

export interface WeeklySession {
  id: string
  day: string
  date: string
  activity: string
  status: 'completed' | 'missed' | 'current' | 'upcoming' | 'rest'
  isToday: boolean
  seance?: Seance
}

export const useClientSeances = (userEmail: string | undefined) => {
  const [seances, setSeances] = useState<Seance[]>([])
  const [weeklySessions, setWeeklySessions] = useState<WeeklySession[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Date de référence fixe : 1er Septembre 2025 à 7h19 Paris/FR
  const REFERENCE_DATE = new Date('2025-09-01T07:19:00+02:00')

  // Mettre à jour l'heure en temps réel
  useEffect(() => {
    const updateTime = () => {
      // Obtenir l'heure actuelle de Paris
      const now = new Date()
      const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
      setCurrentTime(parisTime)
    }

    // Mettre à jour immédiatement
    updateTime()
    
    // Mettre à jour toutes les secondes
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Récupérer les séances du client
  const fetchSeances = async () => {
    if (!userEmail) return
    
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (clientError) throw clientError

      const { data: seancesData, error: seancesError } = await supabase
        .from('seances')
        .select(`
          *,
          exercices_seance (
            id,
            nom_exercice,
            series,
            repetitions,
            temps_repos,
            ordre,
            completed
          )
        `)
        .eq('client_id', clientData.id)
        .order('date_seance', { ascending: true })

      if (seancesError) throw seancesError

      setSeances(seancesData || [])
      generateWeeklyData(seancesData || [])
    } catch (error) {
      console.error('Erreur récupération séances:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer tes séances",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Créer une nouvelle séance
  const createSeanceForDay = async (dayDate: Date, activityName: string): Promise<Seance | null> => {
    if (!userEmail) return null
    
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (clientError) throw clientError

      const { data: newSeance, error: createError } = await supabase
        .from('seances')
        .insert({
          client_id: clientData.id,
          nom_seance: activityName,
          date_seance: dayDate.toISOString().split('T')[0],
          statut: 'programmée',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError

      setSeances(prev => [...prev, newSeance])
      generateWeeklyData([...seances, newSeance])

      toast({
        title: "Séance créée",
        description: `Séance "${activityName}" programmée pour le ${dayDate.toLocaleDateString('fr-FR')}`,
      })

      return newSeance
    } catch (error) {
      console.error('Erreur création séance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la séance",
        variant: "destructive"
      })
      return null
    }
  }

  // Mettre à jour le statut d'une séance
  const updateSeanceStatus = async (seanceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('seances')
        .update({
          statut: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', seanceId)

      if (error) throw error

      setSeances(prev => prev.map(s => 
        s.id === seanceId ? { ...s, statut: newStatus } : s
      ))

      generateWeeklyData(seances.map(s => 
        s.id === seanceId ? { ...s, statut: newStatus } : s
      ))

      toast({
        title: "Statut mis à jour",
        description: `Séance marquée comme "${newStatus}"`,
      })
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      })
    }
  }

  // Navigation entre semaines
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
    generateWeeklyData(seances, newWeekStart)
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
    generateWeeklyData(seances, newWeekStart)
  }

  const goToCurrentWeek = () => {
    // Utiliser la date de référence pour déterminer la semaine actuelle
    const today = new Date(REFERENCE_DATE)
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1) // Lundi de cette semaine
    setCurrentWeekStart(currentWeekStart)
    generateWeeklyData(seances, currentWeekStart)
  }

  // Obtenir les séances de la semaine en cours
  const getCurrentWeekSeances = (): Seance[] => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    
    return seances.filter(seance => {
      const seanceDate = new Date(seance.date_seance)
      return seanceDate >= currentWeekStart && seanceDate <= weekEnd
    })
  }

  // Vérifier si une date est aujourd'hui (basé sur la date de référence)
  const isToday = (date: Date): boolean => {
    return date.toDateString() === REFERENCE_DATE.toDateString()
  }

  // Générer les données de la semaine
  const generateWeeklyData = (seancesData: Seance[], weekStart?: Date) => {
    const weekStartDate = weekStart || currentWeekStart
    const weekData: WeeklySession[] = []

    // Générer les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStartDate)
      dayDate.setDate(weekStartDate.getDate() + i)
      
      const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
      const dayName = dayNames[i]
      const dateNumber = dayDate.getDate()
      
      // Chercher une séance qui correspond à ce jour
      const matchingSeance = seancesData.find(s => {
        const seanceDate = new Date(s.date_seance)
        return seanceDate.toDateString() === dayDate.toDateString()
      })
      
      if (matchingSeance) {
        // Déterminer le statut basé sur la vraie séance
        let status: 'completed' | 'missed' | 'current' | 'upcoming' | 'rest' = 'upcoming'
        switch (matchingSeance.statut) {
          case 'terminée': status = 'completed'; break
          case 'manquée': status = 'missed'; break
          case 'en_cours': status = 'current'; break
          default: status = 'upcoming'
        }

        weekData.push({
          id: `${i + 1}`,
          day: dayName,
          date: dateNumber.toString(),
          activity: matchingSeance.nom_seance,
          status,
          isToday: isToday(dayDate),
          seance: matchingSeance
        })
      } else {
        // Pas de séance programmée pour ce jour
        weekData.push({
          id: `${i + 1}`,
          day: dayName,
          date: dateNumber.toString(),
          activity: 'Pas de séance',
          status: 'upcoming',
          isToday: isToday(dayDate)
        })
      }
    }

    setWeeklySessions(weekData)
  }

  // Actions rapides
  const markSeanceAsMissed = (seanceId: string) => updateSeanceStatus(seanceId, 'manquée')
  const markSeanceAsCompleted = (seanceId: string) => updateSeanceStatus(seanceId, 'terminée')

  // Calculs de progression
  const getCompletedSessions = () => weeklySessions.filter(session => session.status === 'completed').length
  const getTotalSessions = () => weeklySessions.filter(session => session.status !== 'rest').length
  const getProgressPercentage = () => {
    const total = getTotalSessions()
    return total > 0 ? (getCompletedSessions() / total) * 100 : 0
  }

  // Formater la période de la semaine
  const getWeekPeriod = () => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    
    const startFormatted = currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    const endFormatted = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    
    return `${startFormatted} au ${endFormatted}`
  }

  // Obtenir l'heure formatée (Paris/FR) - dynamique
  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris'
    })
  }

  // Obtenir la date formatée (Paris/FR) - dynamique
  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Paris'
    })
  }

  useEffect(() => {
    fetchSeances()
    goToCurrentWeek() // Commencer par la semaine actuelle
  }, [userEmail])

  return {
    seances,
    weeklySessions,
    loading,
    currentWeekStart,
    referenceDate: REFERENCE_DATE,
    currentTime,
    createSeanceForDay,
    updateSeanceStatus,
    markSeanceAsMissed,
    markSeanceAsCompleted,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    getCurrentWeekSeances,
    getCompletedSessions,
    getTotalSessions,
    getProgressPercentage,
    getWeekPeriod,
    getCurrentTime,
    getCurrentDate,
    refetch: fetchSeances
  }
}
