import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ClientBasicInfo, SeanceWithExercices, WeeklyFeedbackBasicInfo, ResourceBasicInfo, ProgressData } from './__types__'
import ClientHeader from './ClientHeader'
import ClientTabs from './ClientTabs'
import InfosPersonnelles from './InfosPersonnelles'
import ProgressionChart from './ProgressionChart'
import SeancesTimeline from './SeancesTimeline'
import SeanceModal from './SeanceModal'
import SuiviGlobal from './SuiviGlobal'
import RessourcesPersonnalisees from './RessourcesPersonnalisees'
import SeanceService from '@/services/seanceService'
import HebdoFeedbackService from '@/services/hebdoFeedbackService'
import ResourceService from '@/services/resourceService'
import ClientService from '@/services/clientService'

interface ClientDetailPageProps {
  clientId: string
  onClose: () => void
  openInEditMode?: boolean
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ clientId, onClose, openInEditMode = false }) => {
  const [client, setClient] = useState<ClientBasicInfo | null>(null)
  const [seances, setSeances] = useState<SeanceWithExercices[]>([])
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedbackBasicInfo[]>([])
  const [resources, setResources] = useState<ResourceBasicInfo[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeance, setSelectedSeance] = useState<SeanceWithExercices | null>(null)
  const [isSeanceModalOpen, setIsSeanceModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadClientData()
    setupRealtimeSubscriptions()
  }, [clientId])

  // Ouvrir automatiquement la modal d'édition si demandé
  useEffect(() => {
    if (openInEditMode && client) {
      setIsEditModalOpen(true)
    }
  }, [openInEditMode, client])

  const loadClientData = async () => {
    try {
      setLoading(true)
      
      const clientData = await ClientService.getClientById(clientId)
      
      // Charger les autres données avec gestion d'erreur
      let seancesData: SeanceWithExercices[] = []
      let feedbacksData: WeeklyFeedbackBasicInfo[] = []
      let resourcesData: ResourceBasicInfo[] = []
      
      try {
        seancesData = await SeanceService.getSeancesByClient(clientId)
      } catch (error) {
        console.warn('Tables séances non disponibles:', error)
      }
      
      try {
        feedbacksData = await HebdoFeedbackService.getClientFeedbacks(clientId)
      } catch (error) {
        console.warn('Table weekly_feedbacks non disponible:', error)
      }
      
      try {
        resourcesData = await ResourceService.getClientResources(clientId)
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
          contact: clientData.email,
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
          poids_actuel: clientData.poids_actuel
        })
      }

      setSeances(seancesData)
      setFeedbacks(feedbacksData)
      setResources(resourcesData)
      
      // Simuler des données de progression (à remplacer par le vrai service)
      setProgressData([
        { date: '2025-01-01', weight: 75, body_fat: 20, muscle_mass: 60 },
        { date: '2025-01-08', weight: 74.5, body_fat: 19.5, muscle_mass: 60.5 },
        { date: '2025-01-15', weight: 74, body_fat: 19, muscle_mass: 61 },
        { date: '2025-01-22', weight: 73.5, body_fat: 18.5, muscle_mass: 61.5 }
      ])

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
    // Abonnement aux changements de séances
    let seancesSubscription: any = null
    let feedbacksSubscription: any = null
    let resourcesSubscription: any = null
    
    try {
      seancesSubscription = SeanceService.subscribeToClientSeances(clientId, (payload) => {
        console.log('Seance change:', payload)
        loadClientData() // Recharger les données
      })
    } catch (error) {
      console.warn('Impossible de s\'abonner aux séances:', error)
    }

    try {
      feedbacksSubscription = HebdoFeedbackService.subscribeToClientFeedbacks(clientId, (payload) => {
        console.log('Feedback change:', payload)
        loadClientData() // Recharger les données
      })
    } catch (error) {
      console.warn('Impossible de s\'abonner aux feedbacks:', error)
    }

    try {
      resourcesSubscription = ResourceService.subscribeToClientResources(clientId, (payload) => {
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
    try {
      setLoading(true)
      
      // Mettre à jour le client via le service
      const result = await ClientService.updateClient(clientId, {
        ...updatedClient,
        poids_depart: updatedClient.poids_depart || client.poids_depart,
        poids_objectif: updatedClient.poids_objectif || client.poids_objectif,
        poids_actuel: updatedClient.poids_actuel || client.poids_actuel,
      })

      if (result) {
        // Mettre à jour l'état local
        setClient(prev => ({
          ...prev!,
          ...result,
          poids_depart: result.poids_depart || prev!.poids_depart,
          poids_objectif: result.poids_objectif || prev!.poids_objectif,
          poids_actuel: result.poids_actuel || prev!.poids_actuel,
        }))

        toast({
          title: "Client mis à jour",
          description: "Les informations du client ont été sauvegardées avec succès.",
        })
      }
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProgression = async (progressionData: { poids_depart: number | null, poids_objectif: number | null, poids_actuel: number | null }) => {
    try {
      setLoading(true)
      
      // Mettre à jour uniquement les données de progression
      const result = await ClientService.updateClient(clientId, {
        poids_depart: progressionData.poids_depart,
        poids_objectif: progressionData.poids_objectif,
        poids_actuel: progressionData.poids_actuel,
      })

      if (result) {
        // Mettre à jour l'état local
        setClient(prev => ({
          ...prev!,
          poids_depart: result.poids_depart,
          poids_objectif: result.poids_objectif,
          poids_actuel: result.poids_actuel,
        }))

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

  const handleSeanceClick = (seance: SeanceWithExercices) => {
    setSelectedSeance(seance)
    setIsSeanceModalOpen(true)
  }

  const handleSeanceUpdate = async (seanceId: string, updates: Partial<SeanceWithExercices>) => {
    try {
      await SeanceService.updateSeance(seanceId, updates)
      
      // Mettre à jour l'état local
      setSeances(prev => prev.map(s => 
        s.id === seanceId ? { ...s, ...updates } : s
      ))

      // Mettre à jour la séance sélectionnée
      if (selectedSeance && selectedSeance.id === seanceId) {
        setSelectedSeance(prev => prev ? { ...prev, ...updates } : null)
      }

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

  if (loading || !client) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil client...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header avec bouton retour */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à la liste</span>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header du client */}
        <ClientHeader 
          client={client}
        />

        {/* Onglets */}
        <ClientTabs>
          {{
            infosPersonnelles: (
              <InfosPersonnelles
                client={client}
                onSave={handleSaveClient}
                isLoading={loading}
              />
            ),
            progression: (
              <ProgressionChart
                client={client}
                clientId={clientId}
                progressHistory={progressData}
                onSave={handleSaveProgression}
                isLoading={loading}
              />
            ),
            seances: (
              <div>
                <SeancesTimeline
                  seances={seances}
                  onAddSeance={async () => {
                    // Recharger les séances après ajout
                    try {
                      const seancesData = await SeanceService.getSeancesByClient(clientId)
                      setSeances(seancesData)
                    } catch (error) {
                      console.error('Error reloading seances:', error)
                    }
                  }}
                  onSeanceClick={handleSeanceClick}
                  isLoading={loading}
                  clientId={clientId}
                />
              </div>
            ),
            suiviGlobal: (
              <div>
                <SuiviGlobal clientId={clientId} />
              </div>
            ),
            ressources: (
              <div>
                <RessourcesPersonnalisees clientId={clientId} />
              </div>
            )
          }}
        </ClientTabs>
      </div>

      {/* Modal de séance */}
      <SeanceModal
        seance={selectedSeance}
        isOpen={isSeanceModalOpen}
        onClose={() => {
          setIsSeanceModalOpen(false)
          setSelectedSeance(null)
        }}
        onUpdate={handleSeanceUpdate}
      />

      {/* Modal d'édition du client */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Modifier le profil client</h2>
              <Button
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <InfosPersonnelles
              client={client}
              onSave={async (updatedClient) => {
                await handleSaveClient(updatedClient)
                setIsEditModalOpen(false)
              }}
              isLoading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDetailPage
