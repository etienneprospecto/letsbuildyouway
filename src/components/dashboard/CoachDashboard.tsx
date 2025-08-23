import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Trash2 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/AuthProvider'
import { getInitials } from '@/lib/utils'
import { ClientService, Client } from '@/services/clientService'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientProfileModal } from './ClientProfileModal'

const CoachDashboard: React.FC = () => {
  const { profile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  
  // Calculer les métriques basées sur les vrais clients
  const clientsNeedingAttention = clients.filter(client => 
    client.progress_percentage < 30 || client.status === 'at_risk'
  )
  const averageProgress = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + client.progress_percentage, 0) / clients.length)
    : 0

  // Charger les clients au montage du composant
  useEffect(() => {
    const fetchClients = async () => {
      if (!profile?.id) return
      
      try {
        setLoading(true)
        setError(null)
        const clientsData = await ClientService.getClientsByCoach(profile.id)
        setClients(clientsData)
        console.log('Clients loaded:', clientsData)
      } catch (err) {
        console.error('Error fetching clients:', err)
        setError('Failed to load clients')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [profile?.id])

  // Fonctions pour gérer les actions sur les clients
  const handleViewProfile = (client: Client) => {
    setSelectedClient(client)
    setIsProfileModalOpen(true)
  }



  const handleScheduleSession = (client: Client) => {
    console.log('Scheduling session for client:', client)
    // TODO: Ouvrir modal de planification de session
  }

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${client.first_name} ${client.last_name} ?`)) {
      return
    }
    
    try {
      await ClientService.deleteClient(client.id)
      // Recharger la liste des clients
      const updatedClients = await ClientService.getClientsByCoach(profile!.id)
      setClients(updatedClients)
      console.log('Client deleted successfully')
    } catch (err) {
      console.error('Error deleting client:', err)
      alert('Erreur lors de la suppression du client')
    }
  }



  const metrics = [
    {
      title: 'Clients Actifs',
      value: clients.length,
      change: clients.length > 0 ? `${clients.length} actifs` : 'Aucun client',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Clients à Risque',
      value: clientsNeedingAttention.length,
      change: clientsNeedingAttention.length > 0 ? 'Nécessitent attention' : 'Tous en bonne voie',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Progression Moyenne',
      value: `${averageProgress}%`,
      change: clients.length > 0 ? 'Basé sur les clients actifs' : 'Aucune donnée',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Coach</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et suivez leur progression
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un Client
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Clients Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aperçu des Clients</CardTitle>
              <CardDescription>
                Gérez vos clients actifs et leur progression
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir Tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Échec du chargement des clients</p>
            </div>
          ) : clients.length > 0 ? (
            <div className="space-y-4">
              {clients.slice(0, 5).map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(`${client.first_name} ${client.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {client.first_name} {client.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.primary_goal} • {client.fitness_level}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Progress value={client.progress_percentage} className="w-20" />
                        <span className="text-sm font-medium">
                          {client.progress_percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {client.sessions_completed} sessions terminées
                      </p>
                    </div>
                    
                    <Badge 
                      variant={clientsNeedingAttention.includes(client) ? "destructive" : "secondary"}
                    >
                      {clientsNeedingAttention.includes(client) ? 'Nécessite Attention' : 'En Bonne Voie'}
                    </Badge>

                    {/* Menu d'actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewProfile(client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleScheduleSession(client)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Planifier une session
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClient(client)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
              
              {clients.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    Voir Tous les {clients.length} Clients
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun client pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ajoutez votre premier client pour commencer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessions d'Aujourd'hui
            </CardTitle>
            <CardDescription>
              Sessions à venir et terminées pour aujourd'hui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune session programmée pour aujourd'hui</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Dernières mises à jour de vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune activité récente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de profil client */}
      <ClientProfileModal
        client={selectedClient}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setSelectedClient(null)
        }}
      />
    </div>
  )
}

export default CoachDashboard