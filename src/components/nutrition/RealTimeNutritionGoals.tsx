import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Heart
} from 'lucide-react';

interface RealTimeNutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface RealTimeUpdate {
  id: string;
  type: 'goal_update' | 'progress_update' | 'comment' | 'achievement';
  authorId: string;
  authorName: string;
  authorRole: 'coach' | 'client';
  message: string;
  timestamp: string;
  data?: any;
}

interface LiveGoal {
  id: string;
  title: string;
  category: 'calories' | 'proteins' | 'carbs' | 'fats' | 'water';
  currentValue: number;
  targetValue: number;
  isLive: boolean;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

const RealTimeNutritionGoals: React.FC<RealTimeNutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [liveGoals, setLiveGoals] = useState<LiveGoal[]>([]);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [activeUsers, setActiveUsers] = useState(2);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    initializeLiveGoals();
    startRealTimeUpdates();
    
    return () => {
      // Cleanup real-time connections
    };
  }, []);

  const initializeLiveGoals = () => {
    const goals: LiveGoal[] = [
      {
        id: 'calories-live',
        title: 'Calories',
        category: 'calories',
        currentValue: 0,
        targetValue: currentGoals?.daily_calories || 2000,
        isLive: true,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        icon: Zap,
        color: 'orange'
      },
      {
        id: 'proteins-live',
        title: 'Protéines',
        category: 'proteins',
        currentValue: 0,
        targetValue: currentGoals?.daily_proteins || 150,
        isLive: true,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        icon: Target,
        color: 'blue'
      },
      {
        id: 'carbs-live',
        title: 'Glucides',
        category: 'carbs',
        currentValue: 0,
        targetValue: currentGoals?.daily_carbs || 250,
        isLive: true,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        icon: Activity,
        color: 'green'
      },
      {
        id: 'fats-live',
        title: 'Lipides',
        category: 'fats',
        currentValue: 0,
        targetValue: currentGoals?.daily_fats || 70,
        isLive: true,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        icon: Heart,
        color: 'purple'
      },
      {
        id: 'water-live',
        title: 'Hydratation',
        category: 'water',
        currentValue: 0,
        targetValue: currentGoals?.daily_water_glasses || 8,
        isLive: true,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        icon: Heart,
        color: 'cyan'
      }
    ];

    setLiveGoals(goals);
  };

  const startRealTimeUpdates = () => {
    // Simuler les mises à jour en temps réel
    const interval = setInterval(() => {
      updateLiveGoals();
      addRandomUpdate();
      setLastSync(new Date());
    }, 3000);

    return () => clearInterval(interval);
  };

  const updateLiveGoals = () => {
    setLiveGoals(prev =>
      prev.map(goal => {
        // Simuler des mises à jour aléatoires
        const randomChange = Math.random() * 0.1 - 0.05; // -5% à +5%
        const newValue = Math.max(0, goal.currentValue + (goal.targetValue * randomChange));
        
        return {
          ...goal,
          currentValue: Math.round(newValue),
          lastUpdated: new Date().toISOString(),
          trend: newValue > goal.currentValue ? 'up' : newValue < goal.currentValue ? 'down' : 'stable'
        };
      })
    );
  };

  const addRandomUpdate = () => {
    const updateTypes = ['goal_update', 'progress_update', 'comment', 'achievement'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    const newUpdate: RealTimeUpdate = {
      id: Date.now().toString(),
      type: randomType,
      authorId: Math.random() > 0.5 ? clientId : coachId,
      authorName: Math.random() > 0.5 ? 'Client' : 'Coach',
      authorRole: Math.random() > 0.5 ? 'client' : 'coach',
      message: generateRandomMessage(randomType),
      timestamp: new Date().toISOString()
    };

    setUpdates(prev => [newUpdate, ...prev].slice(0, 10)); // Garder seulement les 10 derniers
  };

  const generateRandomMessage = (type: string) => {
    const messages = {
      goal_update: [
        'Objectif calorique ajusté à 1850 kcal',
        'Objectif protéique augmenté de 10g',
        'Objectif d\'hydratation mis à jour'
      ],
      progress_update: [
        'Nouvelle entrée nutritionnelle ajoutée',
        'Photo de repas uploadée',
        'Verre d\'eau enregistré'
      ],
      comment: [
        'Excellent travail sur les protéines !',
        'N\'oublie pas de boire plus d\'eau',
        'Continue comme ça !'
      ],
      achievement: [
        'Objectif calorique atteint !',
        'Série de 7 jours complétée',
        'Nouveau record personnel !'
      ]
    };

    const typeMessages = messages[type as keyof typeof messages] || ['Mise à jour'];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'goal_update':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'progress_update':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'À l\'instant';
    if (diffSeconds < 3600) return `Il y a ${Math.floor(diffSeconds / 60)}min`;
    return `Il y a ${Math.floor(diffSeconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Objectifs nutritionnels en temps réel</h2>
          <p className="text-gray-600">Suivi collaboratif et mises à jour instantanées</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">{activeUsers} actifs</span>
          </div>
        </div>
      </div>

      {/* Live Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveGoals.map((goal) => {
          const Icon = goal.icon;
          const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
          
          return (
            <Card key={goal.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${goal.color}-600`} />
                  <span className="font-medium">{goal.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getTrendIcon(goal.trend)}
                  {goal.isLive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{goal.currentValue}</span>
                  <span className="text-gray-500">/ {goal.targetValue}</span>
                </div>
                
                <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{progressPercentage.toFixed(1)}%</span>
                  <span>{formatTime(goal.lastUpdated)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live Updates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mises à jour en temps réel</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}</span>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {updates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Aucune mise à jour récente</p>
            </div>
          ) : (
            updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getUpdateIcon(update.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{update.authorName}</span>
                    <Badge variant={update.authorRole === 'coach' ? 'default' : 'secondary'}>
                      {update.authorRole === 'coach' ? 'Coach' : 'Client'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTime(update.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">{update.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Ajouter un repas</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Commenter</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Voir l'historique</span>
          </Button>
        </div>
      </Card>

      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              {isConnected ? 'Synchronisation active' : 'Synchronisation interrompue'}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            Mises à jour automatiques toutes les 3 secondes
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RealTimeNutritionGoals;
