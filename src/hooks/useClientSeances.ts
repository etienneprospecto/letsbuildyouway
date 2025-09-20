import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { useWeek } from '@/providers/WeekProvider'

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
  exercices?: ExerciceSeance[]
}

export interface ExerciceSeance {
  id: string
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
  
  // Utiliser le contexte global pour la gestion de la semaine
  const { 
    currentWeekStart, 
    currentTime, 
    goToPreviousWeek, 
    goToNextWeek, 
    getWeekStart, 
    getWeekEnd 
  } = useWeek()

  // Date actuelle pour déterminer "aujourd'hui" (fuseau horaire français)
  const getTodayDate = () => {
    // Utiliser l'heure du contexte global
    return currentTime
  }

  // Récupérer les séances du client
  const fetchSeances = async () => {
    if (!userEmail) return
    
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('contact', userEmail)
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
            completed,
            sets_completed,
            reps_completed,
            difficulty_rating,
            form_rating,
            energy_level,
            pain_level,
            exercise_notes,
            exercise_duration,
            started_at,
            completed_at
          )
        `)
        .eq('client_id', clientData.id)
        .order('date_seance', { ascending: true })

      if (seancesError) throw seancesError

      console.log('📊 Séances récupérées:', seancesData?.length || 0)
      if (seancesData && seancesData.length > 0) {
        console.log('📋 Détails des séances:', seancesData.map(s => ({
          nom: s.nom_seance,
          date: s.date_seance,
          statut: s.statut
        })))
        
        // Vérifier spécifiquement la séance "myabe not" du dimanche 7
        const maybeNotSeance = seancesData.find(s => s.nom_seance === 'myabe not')
        if (maybeNotSeance) {
          console.log('🎯 Séance "myabe not" trouvée:', {
            nom: maybeNotSeance.nom_seance,
            date: maybeNotSeance.date_seance,
            statut: maybeNotSeance.statut
          })
        } else {
          console.log('❌ Séance "myabe not" non trouvée dans les données')
        }
      }

      // Mapper les données pour que exercices_seance devienne exercices
      const mappedSeances = (seancesData || []).map(seance => ({
        ...seance,
        exercices: seance.exercices_seance || []
      }))
      
      console.log('🔄 Séances mappées:', mappedSeances.map(s => ({
        nom: s.nom_seance,
        exercices: s.exercices?.length || 0
      })))
      
      setSeances(mappedSeances)
      generateWeeklyData(mappedSeances)
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
        .eq('contact', userEmail)
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

      // Si la séance est marquée comme terminée, mettre à jour le compteur client
      if (newStatus === 'terminée') {
        await updateClientSessionsCompleted(seanceId)
      }

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

  // Mettre à jour le compteur de séances complétées pour un client
  const updateClientSessionsCompleted = async (seanceId: string) => {
    try {
      // Récupérer l'ID du client depuis la séance
      const seance = seances.find(s => s.id === seanceId)
      if (!seance) return

      // Compter les séances terminées pour ce client
      const { count, error: countError } = await supabase
        .from('seances')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', seance.client_id)
        .eq('statut', 'terminée')

      if (countError) throw countError

      // Mettre à jour le compteur dans la table clients
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          sessions_completed: count || 0,
          last_session_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', seance.client_id)

      if (updateError) throw updateError

      console.log(`✅ Compteur sessions_completed mis à jour: ${count || 0}`)
    } catch (error) {
      console.error('Erreur mise à jour compteur sessions:', error)
    }
  }




  // Obtenir les séances de la semaine en cours
  const getCurrentWeekSeances = (): Seance[] => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999) // Fin de journée
    
    console.log('🔍 Filtrage des séances pour la semaine:', {
      weekStart: currentWeekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalSeances: seances.length
    })
    
    const filteredSeances = seances.filter(seance => {
      const seanceDate = new Date(seance.date_seance)
      const isInWeek = seanceDate >= currentWeekStart && seanceDate <= weekEnd
      
      console.log(`📅 Séance "${seance.nom_seance}" (${seance.date_seance}):`, {
        seanceDate: seanceDate.toISOString(),
        isInWeek,
        weekStart: currentWeekStart.toISOString(),
        weekEnd: weekEnd.toISOString()
      })
      
      return isInWeek
    })
    
    console.log('✅ Séances filtrées:', filteredSeances.length, filteredSeances.map(s => s.nom_seance))
    
    return filteredSeances
  }

  // Vérifier si une date est aujourd'hui (basé sur la date actuelle)
  const isToday = (date: Date, weekStart?: Date): boolean => {
    // Utiliser la date actuelle du contexte global
    const today = new Date(currentTime)
    today.setHours(0, 0, 0, 0)
    
    const dateToCheck = new Date(date)
    dateToCheck.setHours(0, 0, 0, 0)
    
    return dateToCheck.getTime() === today.getTime()
  }

  // Générer les données de la semaine
  const generateWeeklyData = (seancesData: Seance[], weekStart?: Date) => {
    const weekStartDate = weekStart || currentWeekStart
    const weekData: WeeklySession[] = []

    // Générer les 7 jours de la semaine en partant du début de semaine
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStartDate)
      dayDate.setDate(weekStartDate.getDate() + i)
      dayDate.setHours(0, 0, 0, 0)
      weekDates.push(dayDate)
    }

    // Générer les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      const dayDate = weekDates[i]
      
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
          isToday: isToday(dayDate, weekStartDate),
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

  // Charger les séances et générer les données de la semaine
  useEffect(() => {
    fetchSeances()
  }, [userEmail])

  // Générer les données de la semaine quand les séances ou la semaine changent
  useEffect(() => {
    if (seances.length > 0) {
      generateWeeklyData(seances, currentWeekStart)
    }
  }, [seances, currentWeekStart])

  return {
    seances,
    weeklySessions,
    loading,
    currentWeekStart,
    getTodayDate,
    currentTime,
    createSeanceForDay,
    updateSeanceStatus,
    markSeanceAsMissed,
    markSeanceAsCompleted,
    goToPreviousWeek,
    goToNextWeek,
    getCurrentWeekSeances,
    getCurrentTime,
    getCurrentDate,
    refetch: fetchSeances
  }
}
