import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Target, 
  Brain, 
  Users, 
  Gamepad2, 
  RefreshCw, 
  BarChart3,
  Settings,
  Zap,
  Activity,
  Heart,
  Star,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

// Import all nutrition goal components
import SmartNutritionGoals from './SmartNutritionGoals';
import CollaborativeNutritionGoals from './CollaborativeNutritionGoals';
import GamifiedNutritionGoals from './GamifiedNutritionGoals';
import AdaptiveNutritionGoals from './AdaptiveNutritionGoals';
import RealTimeNutritionGoals from './RealTimeNutritionGoals';
import AINutritionGoals from './AINutritionGoals';

interface AdvancedNutritionDashboardProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface DashboardTab {
  id: string;
  label: string;
  icon: any;
  description: string;
  component: React.ComponentType<any>;
  badge?: string;
  color: string;
}

const AdvancedNutritionDashboard: React.FC<AdvancedNutritionDashboardProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [activeTab, setActiveTab] = useState('smart');

  const tabs: DashboardTab[] = [
    {
      id: 'smart',
      label: 'Intelligent',
      icon: Brain,
      description: 'Objectifs optimisés par IA',
      component: SmartNutritionGoals,
      badge: 'IA',
      color: 'purple'
    },
    {
      id: 'collaborative',
      label: 'Collaboratif',
      icon: Users,
      description: 'Collaboration en temps réel',
      component: CollaborativeNutritionGoals,
      badge: 'Live',
      color: 'blue'
    },
    {
      id: 'gamified',
      label: 'Gamifié',
      icon: Gamepad2,
      description: 'Transformez en jeu',
      component: GamifiedNutritionGoals,
      badge: 'Fun',
      color: 'green'
    },
    {
      id: 'adaptive',
      label: 'Adaptatif',
      icon: RefreshCw,
      description: 'Ajustement automatique',
      component: AdaptiveNutritionGoals,
      badge: 'Auto',
      color: 'orange'
    },
    {
      id: 'realtime',
      label: 'Temps réel',
      icon: Clock,
      description: 'Mises à jour instantanées',
      component: RealTimeNutritionGoals,
      badge: 'Live',
      color: 'cyan'
    },
    {
      id: 'ai',
      label: 'IA Avancée',
      icon: Zap,
      description: 'Analyse prédictive avancée',
      component: AINutritionGoals,
      badge: 'GPT-4',
      color: 'indigo'
    }
  ];

  const getTabColor = (color: string) => {
    const colors = {
      purple: 'text-purple-600 bg-purple-100',
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      cyan: 'text-cyan-600 bg-cyan-100',
      indigo: 'text-indigo-600 bg-indigo-100'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getTabBorderColor = (color: string) => {
    const colors = {
      purple: 'border-purple-200',
      blue: 'border-blue-200',
      green: 'border-green-200',
      orange: 'border-orange-200',
      cyan: 'border-cyan-200',
      indigo: 'border-indigo-200'
    };
    return colors[color as keyof typeof colors] || 'border-gray-200';
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Target className="h-7 w-7 text-purple-600" />
            <span>Tableau de bord nutritionnel avancé</span>
          </h1>
          <p className="text-gray-600">
            Gestion intelligente et collaborative de vos objectifs nutritionnels
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-purple-100 text-purple-800">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Badge>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-gray-600">Objectifs actifs</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">87%</div>
              <div className="text-sm text-gray-600">Taux de réussite</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-gray-600">Jours de série</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-gray-600">Succès débloqués</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  isActive
                    ? `${getTabColor(tab.color)} ${getTabBorderColor(tab.color)} border-2`
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.badge && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isActive ? getTabColor(tab.color) : 'text-gray-500'
                    }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Tab Description */}
        {activeTabData && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <activeTabData.icon className={`h-5 w-5 text-${activeTabData.color}-600`} />
              <h3 className="font-semibold">{activeTabData.label}</h3>
            </div>
            <p className="text-gray-600">{activeTabData.description}</p>
          </div>
        )}
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && (
        <div className="space-y-6">
          <ActiveComponent
            clientId={clientId}
            coachId={coachId}
            currentGoals={currentGoals}
            onUpdateGoals={onUpdateGoals}
            isCoach={isCoach}
          />
        </div>
      )}

      {/* Footer Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Actions rapides</h3>
            <p className="text-sm text-gray-600">
              Accédez rapidement aux fonctionnalités les plus utilisées
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Rapports
            </Button>
            
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Nouvel objectif
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedNutritionDashboard;
