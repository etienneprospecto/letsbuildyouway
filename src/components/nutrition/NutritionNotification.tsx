import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, Camera, Droplets, Target, CheckCircle } from 'lucide-react';

interface NutritionNotificationProps {
  type: 'new_meal' | 'water_goal' | 'calorie_goal' | 'macro_goal';
  message: string;
  timestamp: string;
  isRead?: boolean;
  onMarkAsRead?: () => void;
  onViewDetails?: () => void;
}

const NutritionNotification: React.FC<NutritionNotificationProps> = ({
  type,
  message,
  timestamp,
  isRead = false,
  onMarkAsRead,
  onViewDetails
}) => {
  const getIcon = () => {
    switch (type) {
      case 'new_meal':
        return <Camera className="h-5 w-5 text-blue-500" />;
      case 'water_goal':
        return <Droplets className="h-5 w-5 text-cyan-500" />;
      case 'calorie_goal':
        return <Target className="h-5 w-5 text-orange-500" />;
      case 'macro_goal':
        return <Target className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'new_meal':
        return 'Nouveau repas';
      case 'water_goal':
        return 'Objectif hydratation';
      case 'calorie_goal':
        return 'Objectif calories';
      case 'macro_goal':
        return 'Objectif macros';
      default:
        return 'Notification';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'new_meal':
        return 'bg-blue-100 text-blue-800';
      case 'water_goal':
        return 'bg-cyan-100 text-cyan-800';
      case 'calorie_goal':
        return 'bg-orange-100 text-orange-800';
      case 'macro_goal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${isRead ? 'opacity-60' : 'shadow-sm'}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Badge className={getTypeColor()}>
              {getTypeLabel()}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            {message}
          </p>
          
          <div className="flex items-center space-x-2">
            {!isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAsRead}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marquer comme lu
              </Button>
            )}
            
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="text-xs"
              >
                Voir détails
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NutritionNotification;
