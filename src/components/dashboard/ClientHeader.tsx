import React from 'react'
import { motion } from 'framer-motion'
import { Target, Calendar, Award } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClientBasicInfo } from './__types__'
import { getInitials } from '@/lib/utils'

interface ClientHeaderProps {
  client: ClientBasicInfo
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ client }) => {
  const fullName = `${client.first_name} ${client.last_name}`
  const startDate = new Date(client.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermédiaire':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Avancé':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Photo de profil */}
          <Avatar className="h-20 w-20 border-2 border-gray-200">
            <AvatarImage src={client.photo_url || undefined} alt={fullName} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {fullName}
              </h1>
              <Badge 
                variant="outline" 
                className={`${getLevelColor(client.level)} font-medium`}
              >
                {client.level}
              </Badge>
            </div>

            {/* Objectif principal */}
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-4 w-4 text-orange-500" />
              <p className="text-gray-700 font-medium">
                {client.objective}
              </p>
            </div>

            {/* Date de début */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Coaching débuté le {startDate}</span>
            </div>
          </div>
        </div>

        {/* Bouton modifier */}
        {/* Supprimé - plus utilisé */}
      </div>
    </motion.div>
  )
}

export default ClientHeader
