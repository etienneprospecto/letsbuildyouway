import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientBasicInfo, SeanceWithExercices } from './__types__'
import ClientHeader from './ClientHeader'
import ClientTabs from './ClientTabs'
import InfosPersonnelles from './InfosPersonnelles'
import ProgressionChart from './ProgressionChart'
import SeancesTimeline from './SeancesTimeline'
import SeanceModal from './SeanceModal'
import SuiviGlobal from './SuiviGlobal'
import RessourcesPersonnalisees from './RessourcesPersonnalisees'
import SeanceService from '@/services/seanceService'
import { useClientDetail } from '@/hooks/useClientDetail'

interface ClientDetailPageProps {
  clientId: string
  onClose: () => void
  openInEditMode?: boolean
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ clientId, onClose, openInEditMode = false }) => {
  const [selectedSeance, setSelectedSeance] = useState<SeanceWithExercices | null>(null)
  const [isSeanceModalOpen, setIsSeanceModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const {
    client,
    seances,
    progressData,
    loading,
    handleSaveClient,
    handleSaveProgression,
    handleSeanceUpdate
  } = useClientDetail(clientId)

  // Ouvrir automatiquement la modal d'édition si demandé
  useEffect(() => {
    if (openInEditMode && client) {
      setIsEditModalOpen(true)
    }
  }, [openInEditMode, client])

  const handleSeanceClick = (seance: SeanceWithExercices) => {
    setSelectedSeance(seance)
    setIsSeanceModalOpen(true)
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
        <ClientHeader client={client} />

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
                      // Note: Le hook gère déjà la mise à jour
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
