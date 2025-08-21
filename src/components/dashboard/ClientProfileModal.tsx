import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit, Calendar, Phone, Mail, Target, TrendingUp, Award } from 'lucide-react'
import { Client } from '@/services/clientService'
import { getInitials } from '@/lib/utils'

interface ClientProfileModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEdit: (client: Client) => void
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!client) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {getInitials(`${client.first_name} ${client.last_name}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-2xl font-bold">
                {client.first_name} {client.last_name}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                Client depuis {formatDate(client.start_date)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                </div>
                {client.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  </div>
                )}
                {client.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                    <span className="text-sm block mt-1">{formatDate(client.date_of_birth)}</span>
                  </div>
                )}
                {client.gender && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Genre</label>
                    <span className="text-sm block mt-1">{client.gender}</span>
                  </div>
                )}
              </div>
              
              {client.height_cm && client.weight_kg && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Taille</label>
                    <span className="text-sm block mt-1">{client.height_cm} cm</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Poids</label>
                    <span className="text-sm block mt-1">{client.weight_kg} kg</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objectifs et progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Objectifs et Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Objectif principal</label>
                <Badge variant="secondary" className="mt-1">
                  {client.primary_goal}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Niveau de fitness</label>
                <Badge variant="outline" className="mt-1">
                  {client.fitness_level}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Progression globale</label>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={client.progress_percentage} className="flex-1" />
                  <span className="text-sm font-medium w-12">
                    {client.progress_percentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sessions terminées</label>
                  <span className="text-2xl font-bold block mt-1">{client.sessions_completed}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total workouts</label>
                  <span className="text-2xl font-bold block mt-1">{client.total_workouts}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dernière session et prochaine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.last_session_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière session</label>
                  <span className="text-sm block mt-1">{formatDate(client.last_session_date)}</span>
                </div>
              )}
              
              {client.next_session_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prochaine session</label>
                  <span className="text-sm block mt-1">{formatDate(client.next_session_date)}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut</label>
                <Badge 
                  variant={client.status === 'active' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {client.status === 'active' ? 'Actif' : client.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes et conditions médicales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Notes et Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm mt-1 bg-muted p-3 rounded-md">{client.notes}</p>
                </div>
              )}
              
              {client.medical_conditions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Conditions médicales</label>
                  <p className="text-sm mt-1 bg-muted p-3 rounded-md">{client.medical_conditions}</p>
                </div>
              )}
              
              {client.dietary_restrictions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Restrictions alimentaires</label>
                  <p className="text-sm mt-1 bg-muted p-3 rounded-md">{client.dietary_restrictions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => onEdit(client)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier le Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
