import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Mail,
  Phone,
  Target,
  User
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/providers/AuthProvider'
import { getInitials } from '@/lib/utils'
import { ClientService, Client } from '@/services/clientService'

const CoachDashboard: React.FC = () => {
  const { profile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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


  // Fonctions de formatage
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'paused': return 'En pause'
      default: return 'Inconnu'
    }
  }

  const formatGoal = (goal: string) => {
    const goals: Record<string, string> = {
      'weight_loss': 'Perte de poids',
      'muscle_gain': 'Prise de muscle',
      'endurance': 'Endurance',
      'strength': 'Force',
      'general_fitness': 'Forme générale'
    }
    return goals[goal] || goal
  }

  const formatLevel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé',
      'expert': 'Expert'
    }
    return levels[level] || level
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
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord BYW Coach</h1>
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
          <CardTitle>Liste des Clients</CardTitle>
          <CardDescription>
            {clients.length} client(s) trouvé(s)
          </CardDescription>
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
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Informations client */}
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {client.first_name} {client.last_name}
                        </p>
                        <Badge variant="outline" className={getStatusColor(client.status)}>
                          {getStatusText(client.status)}
                        </Badge>
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

                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun client trouvé</p>
              <p className="text-sm text-muted-foreground mt-2">
                Commencez par ajouter votre premier client
              </p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}

export default CoachDashboard