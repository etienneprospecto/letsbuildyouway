import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddButton, SecondaryActionButton } from '@/components/ui/standard-buttons'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/providers/AuthProvider'
import ClientService, { Client } from '@/services/clientService'
import SeanceService from '@/services/seanceService'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import AddClientModal from './AddClientModal'
import ClientDetailPage from './ClientDetailPage'



const ClientsPage: React.FC = () => {
  const { profile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editedClient, setEditedClient] = useState<Partial<Client>>({})
  const [clientMetrics, setClientMetrics] = useState<Record<string, {
    progressPercentage: number
    sessionsCompleted: number
    totalSessions: number
    lastActivity: string | null
  }>>({})
  const [refreshingMetrics, setRefreshingMetrics] = useState(false)

  // Charger les métriques d'un client
  const fetchClientMetrics = async (clientId: string) => {
    try {
      console.log(`Chargement métriques pour client ${clientId}`)
      
      // Récupérer les données du client pour avoir l'objectif
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('poids_depart, poids_objectif, poids_actuel')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      console.log(`Données client pour ${clientId}:`, clientData)
      
      // Récupérer les données de progression
      const { data: progressData, error: progressError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })

      if (progressError) throw progressError
      console.log(`Données progression pour ${clientId}:`, progressData)

      // Récupérer les séances
      const seances = await SeanceService.getSeancesByClient(clientId)
      console.log(`Séances pour ${clientId}:`, seances)
      
      // Calculer les métriques
      const sessionsCompleted = seances.filter(s => s.status === 'completed').length
      const totalSessions = seances.length
      
      // Dernière activité = dernière séance terminée (la plus récente)
      const completedSeances = seances.filter(s => s.status === 'completed')
      // Trier par date décroissante pour avoir la plus récente en premier
      const sortedCompletedSeances = completedSeances.sort((a, b) => new Date(b.date_seance).getTime() - new Date(a.date_seance).getTime())
      const lastActivity = sortedCompletedSeances.length > 0 ? sortedCompletedSeances[0].date_seance : null

      // Calculer la progression basée sur l'objectif réel du client
      let progressPercentage = 0
      
      // Utiliser les données de progression si disponibles, sinon les données du client
      if (progressData && progressData.length > 0) {
        const firstWeight = progressData[progressData.length - 1]?.weight_kg
        const currentWeight = progressData[0]?.weight_kg
        
        if (firstWeight && currentWeight && clientData.poids_objectif) {
          const targetLoss = Math.abs(firstWeight - clientData.poids_objectif)
          const actualLoss = Math.abs(currentWeight - firstWeight)
          progressPercentage = targetLoss > 0 ? Math.min((actualLoss / targetLoss) * 100, 100) : 0
        }
      } else if (clientData.poids_depart && clientData.poids_actuel && clientData.poids_objectif) {
        // Fallback sur les données du client si pas de progression_data
        const targetLoss = Math.abs(clientData.poids_depart - clientData.poids_objectif)
        const actualLoss = Math.abs(clientData.poids_actuel - clientData.poids_depart)
        progressPercentage = targetLoss > 0 ? Math.min((actualLoss / targetLoss) * 100, 100) : 0
      }

      const metrics = {
        progressPercentage: Math.round(progressPercentage),
        sessionsCompleted,
        totalSessions,
        lastActivity
      }
      
      console.log(`Métriques calculées pour ${clientId}:`, metrics)
      return metrics
    } catch (error) {
      console.error('Erreur chargement métriques client:', error)
      return {
        progressPercentage: 0,
        sessionsCompleted: 0,
        totalSessions: 0,
        lastActivity: null
      }
    }
  }

  // Rafraîchir les métriques
  const refreshMetrics = async () => {
    if (!profile?.id || clients.length === 0) return
    
    setRefreshingMetrics(true)
    try {
      const metricsPromises = clients.map(async (client) => {
        const metrics = await fetchClientMetrics(client.id)
        return { clientId: client.id, metrics }
      })

      const metricsResults = await Promise.all(metricsPromises)
      const metricsMap = metricsResults.reduce((acc, { clientId, metrics }) => {
        acc[clientId] = metrics
        return acc
      }, {} as Record<string, any>)

      setClientMetrics(metricsMap)
      
      toast({
        title: "Succès",
        description: "Métriques mises à jour"
      })
    } catch (error) {
      console.error('Erreur rafraîchissement métriques:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les métriques",
        variant: "destructive"
      })
    } finally {
      setRefreshingMetrics(false)
    }
  }

  // Charger les clients depuis le service
  const fetchClients = async () => {
    try {
      setLoading(true)
      if (profile?.id) {
        const data = await ClientService.getClientsByCoach(profile.id)
        setClients(data)

        // Charger les métriques pour chaque client
        const metricsPromises = data.map(async (client) => {
          const metrics = await fetchClientMetrics(client.id)
          return { clientId: client.id, metrics }
        })

        const metricsResults = await Promise.all(metricsPromises)
        const metricsMap = metricsResults.reduce((acc, { clientId, metrics }) => {
          acc[clientId] = metrics
          return acc
        }, {} as Record<string, any>)

        setClientMetrics(metricsMap)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      fetchClients()
    } else if (profile === null) {
      // Si profile est null (pas encore chargé), on attend
      setLoading(false)
    }
  }, [profile?.id, profile])

  // Filtrer les clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact || client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fonction de sauvegarde du client
  const handleSaveClient = async () => {
    if (!selectedClient) return
    
    try {
      await ClientService.updateClient(selectedClient.id, editedClient)
      
      // Mettre à jour la liste des clients
      await fetchClients()
      
      // Fermer le modal
      setIsClientModalOpen(false)
      setSelectedClient(null)
      setEditedClient({})
      
      // Afficher un message de succès
      alert('Client mis à jour avec succès !')
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Erreur lors de la mise à jour du client')
    }
  }

  // Formater les données
  const formatGoal = (goal: string) => {
    const goals: Record<string, string> = {
      'weight_loss': 'Perte de poids',
      'muscle_gain': 'Prise de muscle',
      'general_fitness': 'Forme générale',
      'endurance': 'Endurance',
      'strength': 'Force'
    }
    return goals[goal] || goal
  }

  const formatLevel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé'
    }
    return levels[level] || level
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'paused': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'paused': 'En pause'
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et suivez leur progression
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={refreshMetrics} 
            disabled={refreshingMetrics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingMetrics ? 'animate-spin' : ''}`} />
            {refreshingMetrics ? 'Mise à jour...' : 'Actualiser'}
          </Button>
          <AddButton onClick={() => setIsAddModalOpen(true)} label="Ajouter un client" />
        </div>
      </div>


      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="paused">En pause</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun client trouvé</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Commencez par ajouter votre premier client'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedClient(client)
                    setIsClientModalOpen(true)
                  }}
                >
                  {/* Informations client */}
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {client.first_name} {client.last_name}
                        </p>
                        <Badge variant="outline" className={getStatusColor(client.status)}>
                          {getStatusText(client.status)}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-muted-foreground">
                          Cliquer pour voir le profil
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{client.contact || client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{formatGoal(client.primary_goal)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{formatLevel(client.fitness_level)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
                        className="opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedClient(client)
                        setIsClientModalOpen(true)
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedClient(client)
                        setIsClientModalOpen(true)
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le profil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Planifier une session
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout de client */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientAdded={fetchClients}
        coachId={profile?.id || ''}
      />

      {/* Modal client détaillé (nouvelle page avec onglets fonctionnels) */}
      {isClientModalOpen && selectedClient && (
        <ClientDetailPage
          clientId={selectedClient.id}
          onClose={() => {
            setIsClientModalOpen(false)
            setSelectedClient(null)
          }}
        />
      )}
    </div>
  )
}

export default ClientsPage
