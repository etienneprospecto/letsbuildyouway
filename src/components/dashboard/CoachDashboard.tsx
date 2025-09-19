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

      {/* Metrics avec micro-interactions */}
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                transition: { duration: 0.2 } 
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {metric.title}
                  </CardTitle>
                  <motion.div 
                    className={`p-2 rounded-lg ${metric.bgColor}`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {metric.value}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.change}
                  </p>
                  
                  {/* Barre de progression subtile */}
                  <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${metric.bgColor.replace('bg-', 'bg-').replace('/20', '/60')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(parseInt(metric.value) * 10, 100)}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    // Pour l'instant, on peut afficher un toast ou naviguer vers la page clients
                    console.log('Navigate to client:', client.id);
                  }}
                >
                  {/* Informations client */}
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg font-semibold">
                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-lg">
                          {client.first_name} {client.last_name}
                        </p>
                        <Badge variant="outline" className={getStatusColor(client.status)}>
                          {getStatusText(client.status)}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-blue-600 font-medium">
                          → Voir le profil
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
                      
                      {/* Barre de progression */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span>{client.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={client.progress_percentage || 0} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicateur visuel de statut */}
                  <div className="flex flex-col items-center space-y-1">
                    {client.progress_percentage < 30 && (
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" title="Attention requise" />
                    )}
                    {client.progress_percentage >= 30 && client.progress_percentage < 70 && (
                      <div className="h-3 w-3 bg-yellow-500 rounded-full" title="En progression" />
                    )}
                    {client.progress_percentage >= 70 && (
                      <div className="h-3 w-3 bg-green-500 rounded-full" title="Excellent progrès" />
                    )}
                  </div>

                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12 px-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
                <Users className="relative h-16 w-16 text-blue-500 mx-auto mb-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenue dans votre espace coach ! 👋
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Commencez votre aventure en ajoutant votre premier client. 
                Vous pourrez ensuite créer des programmes, suivre les progrès et communiquer efficacement.
              </p>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  onClick={() => {/* Open add client modal */}}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Ajouter mon premier client
                </Button>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mt-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Programmes personnalisés
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Suivi en temps réel
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Communication directe
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}

export default CoachDashboard