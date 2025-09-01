import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, Play, Bed, Calendar } from 'lucide-react'
import { WeeklySession } from '@/hooks/useClientSeances'

interface WeeklySessionCardProps {
  session: WeeklySession
  index: number
  onCardClick: (session: WeeklySession, index: number) => void
  onOpenSeance: (seance: any) => void
  onMarkCompleted: (seanceId: string) => void
  onMarkMissed: (seanceId: string) => void
  onReprogram: (seanceId: string) => void
}

const WeeklySessionCard: React.FC<WeeklySessionCardProps> = ({
  session,
  index,
  onCardClick,
  onOpenSeance,
  onMarkCompleted,
  onMarkMissed,
  onReprogram
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-5 w-5 text-white" />
      case 'missed': return <X className="h-5 w-5 text-white" />
      case 'current': return <Clock className="h-5 w-5 text-white" />
      case 'rest': return <Bed className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'missed': return 'bg-red-500'
      case 'current': return 'bg-orange-500'
      case 'rest': return 'bg-gray-200'
      default: return 'bg-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Validée'
      case 'missed': return 'Manquée'
      case 'current': return 'À faire'
      case 'rest': return '🛌 Repos'
      default: return 'À venir'
    }
  }

  return (
    <div className="text-center space-y-2">
      {/* Jour et date */}
      <div className="text-xs font-medium text-gray-600 uppercase">
        {session.day}
      </div>
      
      {/* Carte de la session */}
      <div 
        className={`
          relative w-16 h-16 mx-auto rounded-lg flex items-center justify-center cursor-pointer
          ${getStatusColor(session.status)}
          ${session.status === 'rest' ? 'bg-gray-200' : ''}
          hover:opacity-80 transition-opacity
          ${session.seance ? 'ring-2 ring-blue-200' : ''}
          ${session.isToday ? 'ring-4 ring-orange-400 shadow-lg' : ''}
        `}
        onClick={() => onCardClick(session, index)}
      >
        {session.status === 'rest' ? (
          <span className="text-gray-600 text-xs">{session.date}</span>
        ) : (
          getStatusIcon(session.status)
        )}
        
        {/* Indicateur de séance connectée */}
        {session.seance && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        )}

        {/* Indicateur "Aujourd'hui" */}
        {session.isToday && (
          <div className="absolute -top-2 -left-2">
            <Badge className="bg-orange-500 text-white text-xs px-2 py-1 shadow-md">
              <Calendar className="h-3 w-3 mr-1" />
              Aujourd'hui
            </Badge>
          </div>
        )}
      </div>
      
      {/* Activité */}
      <div className="text-xs font-medium text-gray-900 leading-tight">
        {session.activity}
      </div>
      
      {/* Statut */}
      <div className="text-xs text-gray-600">
        {getStatusText(session.status)}
      </div>
      
      {/* Bouton "C'est parti !" pour la session actuelle */}
      {session.status === 'current' && session.seance && (
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 h-auto"
          size="sm"
          onClick={() => onOpenSeance(session.seance!)}
        >
          <Play className="h-3 w-3 mr-1" />
          C'est parti !
        </Button>
      )}
      
      {/* Bouton "Voir détails" pour les séances avec données */}
      {session.seance && session.status !== 'current' && session.status !== 'rest' && (
        <Button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 h-auto"
          size="sm"
          onClick={() => onOpenSeance(session.seance!)}
        >
          Voir détails
        </Button>
      )}
      
      {/* Actions rapides pour les séances programmées */}
      {session.seance && session.status === 'upcoming' && (
        <div className="space-y-1">
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 h-auto"
            size="sm"
            onClick={() => onMarkCompleted(session.seance!.id)}
          >
            <Check className="h-3 w-3 mr-1" />
            Terminée
          </Button>
          <Button 
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 h-auto"
            size="sm"
            onClick={() => onMarkMissed(session.seance!.id)}
          >
            <X className="h-3 w-3 mr-1" />
            Manquée
          </Button>
        </div>
      )}
      
      {/* Actions rapides pour les séances terminées */}
      {session.seance && session.status === 'completed' && (
        <Button 
          className="w-full bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 h-auto"
          size="sm"
          onClick={() => onOpenSeance(session.seance!)}
        >
          Voir feedback
        </Button>
      )}
      
      {/* Actions rapides pour les séances manquées */}
      {session.seance && session.status === 'missed' && (
        <Button 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 h-auto"
          size="sm"
          onClick={() => onReprogram(session.seance!.id)}
        >
          Reprogrammer
        </Button>
      )}
    </div>
  )
}

export default WeeklySessionCard
