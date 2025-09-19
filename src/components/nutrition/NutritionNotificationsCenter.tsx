import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  Camera, 
  Droplets, 
  Target, 
  CheckCircle, 
  X,
  Filter,
  MarkAsRead
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface NutritionNotification {
  id: string;
  type: 'new_meal' | 'water_goal' | 'calorie_goal' | 'macro_goal' | 'goal_achieved' | 'attention_needed';
  clientId: string;
  clientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NutritionNotificationsCenterProps {
  coachId: string;
  onNotificationClick?: (notification: NutritionNotification) => void;
}

const NutritionNotificationsCenter: React.FC<NutritionNotificationsCenterProps> = ({
  coachId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<NutritionNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockNotifications: NutritionNotification[] = [
      {
        id: '1',
        type: 'new_meal',
        clientId: 'client-1',
        clientName: 'Marie Dupont',
        message: 'a ajouté un nouveau repas avec photo',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'goal_achieved',
        clientId: 'client-2',
        clientName: 'Jean Martin',
        message: 'a atteint ses objectifs caloriques aujourd\'hui',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'attention_needed',
        clientId: 'client-3',
        clientName: 'Sophie Bernard',
        message: 'n\'a pas enregistré de repas depuis 2 jours',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        isRead: true,
        priority: 'high'
      },
      {
        id: '4',
        type: 'water_goal',
        clientId: 'client-4',
        clientName: 'Pierre Moreau',
        message: 'a atteint son objectif d\'hydratation',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        isRead: true,
        priority: 'low'
      }
    ];

    setNotifications(mockNotifications);
    setIsLoading(false);
  }, [coachId]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_meal':
        return <Camera className="h-5 w-5 text-blue-500" />;
      case 'water_goal':
        return <Droplets className="h-5 w-5 text-cyan-500" />;
      case 'calorie_goal':
      case 'macro_goal':
      case 'goal_achieved':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'attention_needed':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_meal':
        return 'Nouveau repas';
      case 'water_goal':
        return 'Objectif hydratation';
      case 'calorie_goal':
        return 'Objectif calories';
      case 'macro_goal':
        return 'Objectif macros';
      case 'goal_achieved':
        return 'Objectif atteint';
      case 'attention_needed':
        return 'Attention requise';
      default:
        return 'Notification';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffMinutes / 1440)} jours`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Notifications Nutrition</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="high">Priorité haute</SelectItem>
            </SelectContent>
          </Select>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <MarkAsRead className="h-4 w-4 mr-2" />
              Tout marquer
            </Button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            {filter === 'unread' 
              ? 'Aucune notification non lue'
              : filter === 'high'
              ? 'Aucune notification de priorité haute'
              : 'Aucune notification'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                notification.isRead 
                  ? 'bg-gray-50 hover:bg-gray-100' 
                  : 'bg-white hover:bg-gray-50 border-l-4 border-l-blue-500'
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
                onNotificationClick?.(notification);
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(notification.priority)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{notification.clientName}</span>{' '}
                    {notification.message}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default NutritionNotificationsCenter;
