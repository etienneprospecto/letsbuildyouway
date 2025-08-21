import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Target, 
  TrendingUp, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Heart,
  Activity,
  Scale,
  Ruler,
  Target as TargetIcon,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/providers/AuthProvider'
import { ClientService, Client } from '@/services/clientService'
import { getInitials } from '@/lib/utils'

const ClientDashboard: React.FC = () => {
  const { profile } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données du client au montage
  useEffect(() => {
    const fetchClientData = async () => {
      if (!profile?.email) return
      
      try {
        setLoading(true)
        setError(null)
        const clientData = await ClientService.getClientByEmail(profile.email)
        setClient(clientData)
        console.log('Client data loaded (by email):', clientData)
        if (!clientData) {
          setError("Profil client introuvable. Vérifiez que votre email est bien autorisé par votre coach.")
        }
      } catch (err) {
        console.error('Error fetching client data:', err)
        setError('Impossible de charger les données du profil')
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [profile?.email])

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non renseigné'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Fonction utilitaire pour formater les mesures
  const formatMeasurement = (value: number | null, unit: string) => {
    if (value === null || value === 0) return `Non renseigné`
    return `${value} ${unit}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error || 'Profil non trouvé'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec photo de profil */}
      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-2xl">
            {getInitials(`${client.first_name} ${client.last_name}`)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {client.primary_goal} • {client.fitness_level}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
              {client.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
            <Badge variant="outline">
              Membre depuis {formatDate(client.start_date)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.progress_percentage}%</div>
              <Progress value={client.progress_percentage} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.sessions_completed}</div>
              <p className="text-xs text-muted-foreground">
                sur {client.total_workouts} prévues
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(client.last_session_date)}
              </div>
              <p className="text-xs text-muted-foreground">
                {client.last_session_date ? 'Session terminée' : 'Aucune session'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prochaine Session</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(client.next_session_date)}
              </div>
              <p className="text-xs text-muted-foreground">
                {client.next_session_date ? 'Programmée' : 'Non programmée'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Informations détaillées */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{client.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{client.phone || 'Non renseigné'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                <p>{formatDate(client.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Genre</p>
                <p>{client.gender || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mesures physiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Mesures Physiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Poids</p>
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <p>{formatMeasurement(client.weight_kg, 'kg')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille</p>
                <div className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <p>{formatMeasurement(client.height_cm, 'cm')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">% de graisse</p>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <p>{formatMeasurement(client.body_fat_percentage, '%')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objectifs et niveau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Objectifs et Niveau
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Objectif principal</p>
              <Badge variant="default" className="mt-1">
                {client.primary_goal}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Niveau de forme</p>
              <Badge variant="outline" className="mt-1">
                {client.fitness_level}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <Badge 
                variant={client.status === 'active' ? 'default' : 'secondary'} 
                className="mt-1"
              >
                {client.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations médicales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Informations Médicales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conditions médicales</p>
              <p className="mt-1">
                {client.medical_conditions || 'Aucune condition médicale renseignée'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Restrictions alimentaires</p>
              <p className="mt-1">
                {client.dietary_restrictions || 'Aucune restriction alimentaire'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes du coach */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Notes de votre Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informations système */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Informations Système</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Profil créé le : {formatDate(client.created_at)}</p>
              <p>Dernière mise à jour : {formatDate(client.updated_at)}</p>
            </div>
            <div>
              <p>ID Client : {client.id}</p>
              <p>Coach ID : {client.coach_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientDashboard