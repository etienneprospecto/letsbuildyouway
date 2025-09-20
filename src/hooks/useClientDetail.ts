import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ClientBasicInfo, SeanceWithExercices, WeeklyFeedbackBasicInfo, ResourceBasicInfo, ProgressData } from '@/components/dashboard/__types__'
import ClientService from '@/services/clientService'
import SeanceService from '@/services/seanceService'
import HebdoFeedbackService from '@/services/hebdoFeedbackService'
import ResourceService from '@/services/resourceService'
import { useAuth } from '../providers/AuthProvider'

export const useClientDetail = (clientId?: string) => {
  const { profile } = useAuth();
  const [client, setClient] = useState<ClientBasicInfo | null>(null)
  const [seances, setSeances] = useState<SeanceWithExercices[]>([])
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedbackBasicInfo[]>([])
  const [resources, setResources] = useState<ResourceBasicInfo[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadClientData = async () => {
    try {
      setLoading(true)
      
      // Déterminer l'ID client à utiliser
      const effectiveClientId = clientId || profile?.client_id
      
      if (!effectiveClientId) {
        console.error('No client ID available')
        return
      }
      
      const clientData = await ClientService.getClientById(effectiveClientId)
      
      // Charger les autres données avec gestion d'erreur
      let seancesData: SeanceWithExercices[] = []
      let feedbacksData: WeeklyFeedbackBasicInfo[] = []
      let resourcesData: ResourceBasicInfo[] = []
      
      try {
        seancesData = await SeanceService.getSeancesByClient(effectiveClientId)
      } catch (error) {
        console.warn('Tables séances non disponibles:', error)
      }
      
      try {
        feedbacksData = await HebdoFeedbackService.getClientFeedbacks(effectiveClientId)
      } catch (error) {
        console.warn('Table weekly_feedbacks non disponible:', error)
      }
      
      try {
        resourcesData = await ResourceService.getClientResources(effectiveClientId)
      } catch (error) {
        console.warn('Table ressources_personnalisees non disponible:', error)
      }

      if (clientData) {
        setClient({
          id: clientData.id,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          photo_url: clientData.photo_url,
          objective: clientData.primary_goal,
          level: clientData.fitness_level as any,
          start_date: clientData.start_date,
          age: clientData.age || 0,
          contact: clientData.contact || clientData.email,
          mentality: clientData.mentality || clientData.notes || '',
          sports_history: clientData.sports_history || clientData.notes || '',
          coaching_type: clientData.coaching_type || 'Suivi personnalisé',
          constraints: clientData.constraints || clientData.medical_conditions,
          allergies: clientData.allergies || clientData.dietary_restrictions,
          morphotype: clientData.morphotype,
          equipment: clientData.equipment,
          lifestyle: clientData.lifestyle,
          poids_depart: clientData.poids_depart,
          poids_objectif: clientData.poids_objectif,
          poids_actuel: clientData.poids_actuel,
          coach_id: clientData.coach_id
        })
      }

      setSeances(seancesData)
      setFeedbacks(feedbacksData)
      setResources(resourcesData)
      
      // TODO: Remplacer par le vrai service de progression
      // Pour l'instant, on laisse un tableau vide
      setProgressData([])

    } catch (error) {
      console.error('Error loading client data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du client.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    const effectiveClientId = clientId || profile?.client_id
    if (!effectiveClientId) return () => {}
    
    // Abonnement aux changements de séances
    let seancesSubscription: any = null
    let feedbacksSubscription: any = null
    let resourcesSubscription: any = null
    
    try {
      seancesSubscription = SeanceService.subscribeToClientSeances(effectiveClientId, (payload) => {
        console.log('Seance change:', payload)
        loadClientData() // Recharger les données
      })
    } catch (error) {
      console.warn('Impossible de s\'abonner aux séances:', error)
    }

    try {
      feedbacksSubscription = HebdoFeedbackService.subscribeToClientFeedbacks(effectiveClientId, (payload) => {
        console.log('Feedback change:', payload)
        loadClientData() // Recharger les données
      })
    } catch (error) {
      console.warn('Impossible de s\'abonner aux feedbacks:', error)
    }

    try {
      resourcesSubscription = ResourceService.subscribeToClientResources(effectiveClientId, (payload) => {
        console.log('Resource change:', payload)
        loadClientData() // Recharger les données
      })
    } catch (error) {
      console.warn('Impossible de s\'abonner aux ressources:', error)
    }

    // Nettoyage des abonnements
    return () => {
      if (seancesSubscription) seancesSubscription.unsubscribe()
      if (feedbacksSubscription) feedbacksSubscription.unsubscribe()
      if (resourcesSubscription) resourcesSubscription.unsubscribe()
    }
  }

  const handleSaveClient = async (updatedClient: Partial<ClientBasicInfo>) => {
    const effectiveClientId = clientId || profile?.client_id
    if (!effectiveClientId) {
      console.error('No client ID available for update')
      return
    }
    
    try {
      setLoading(true)
      
      // Mapper objective vers primary_goal pour la base de données
      const { objective, ...restClient } = updatedClient
      const dbUpdateData = {
        ...restClient,
        primary_goal: objective, // Mapper objective vers primary_goal
        poids_depart: updatedClient.poids_depart || client?.poids_depart,
        poids_objectif: updatedClient.poids_objectif || client?.poids_objectif,
        poids_actuel: updatedClient.poids_actuel || client?.poids_actuel,
      }
      
      const result = await ClientService.updateClient(effectiveClientId, dbUpdateData)

      if (result && client) {
        const updatedClientData = {
          ...client,
          ...result,
          objective: result.primary_goal, // Mapper primary_goal vers objective pour l'interface
          poids_depart: result.poids_depart || client.poids_depart,
          poids_objectif: result.poids_objectif || client.poids_objectif,
          poids_actuel: result.poids_actuel || client.poids_actuel,
        }
        
        setClient(updatedClientData)

        toast({
          title: "Client mis à jour",
          description: "Les informations du client ont été sauvegardées avec succès.",
        })
        
        return updatedClientData
      }
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client.",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProgression = async (progressionData: { poids_depart: number | null, poids_objectif: number | null, poids_actuel: number | null }) => {
    const effectiveClientId = clientId || profile?.client_id
    if (!effectiveClientId) {
      console.error('No client ID available for progression update')
      return
    }
    
    try {
      setLoading(true)
      
      const result = await ClientService.updateClient(effectiveClientId, {
        poids_depart: progressionData.poids_depart,
        poids_objectif: progressionData.poids_objectif,
        poids_actuel: progressionData.poids_actuel,
      })

      if (result && client) {
        setClient({
          ...client,
          poids_depart: result.poids_depart,
          poids_objectif: result.poids_objectif,
          poids_actuel: result.poids_actuel,
        })

        toast({
          title: "Progression sauvegardée",
          description: "Les données de progression ont été mises à jour avec succès.",
        })
      }
    } catch (error) {
      console.error('Error updating progression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la progression.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSeanceUpdate = async (seanceId: string, updates: Partial<SeanceWithExercices>) => {
    try {
      await SeanceService.updateSeance(seanceId, updates)
      
      // Mettre à jour l'état local
      setSeances(prev => prev.map(s => 
        s.id === seanceId ? { ...s, ...updates } : s
      ))

      toast({
        title: "Séance mise à jour",
        description: "La séance a été modifiée avec succès.",
      })
    } catch (error) {
      console.error('Error updating seance:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la séance.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (clientId || profile?.client_id) {
      loadClientData()
      setupRealtimeSubscriptions()
    }
  }, [clientId, profile?.client_id])

  return {
    client,
    seances,
    feedbacks,
    resources,
    progressData,
    loading,
    handleSaveClient,
    handleSaveProgression,
    handleSeanceUpdate,
    refetch: loadClientData
  }
}
