import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Heart,
  BarChart3,
  Calendar,
  Star,
  Award,
  Sparkles,
  Cpu,
  Database,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdaptiveNutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface AdaptiveGoal {
  id: string;
  title: string;
  category: 'calories' | 'proteins' | 'carbs' | 'fats' | 'water';
  currentValue: number;
  targetValue: number;
  adaptiveValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  lastAdjustment: string;
  adjustmentReason: string;
  icon: any;
  color: string;
  isAdaptive: boolean;
  adjustmentHistory: {
    date: string;
    oldValue: number;
    newValue: number;
    reason: string;
    confidence: number;
  }[];
}

interface AdaptationRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface AdaptationInsight {
  id: string;
  type: 'optimization' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: number;
  action?: string;
  icon: any;
  color: string;
}

const AdaptiveNutritionGoals: React.FC<AdaptiveNutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [adaptiveGoals, setAdaptiveGoals] = useState<AdaptiveGoal[]>([]);
  const [adaptationRules, setAdaptationRules] = useState<AdaptationRule[]>([]);
  const [insights, setInsights] = useState<AdaptationInsight[]>([]);
  const [isAdapting, setIsAdapting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [autoAdapt, setAutoAdapt] = useState(true);
  const [lastAdaptation, setLastAdaptation] = useState<Date | null>(null);

  useEffect(() => {
    initializeAdaptiveGoals();
    initializeAdaptationRules();
    generateInsights();
  }, []);

  const initializeAdaptiveGoals = () => {
    const goals: AdaptiveGoal[] = [
      {
        id: 'calories-adaptive',
        title: 'Calories',
        category: 'calories',
        currentValue: 0,
        targetValue: currentGoals?.daily_calories || 2000,
        adaptiveValue: 1850,
        trend: 'down',
        confidence: 0.87,
        lastAdjustment: '2024-01-20T10:30:00Z',
        adjustmentReason: 'Réduction basée sur la perte de poids observée',
        icon: Zap,
        color: 'orange',
        isAdaptive: true,
        adjustmentHistory: [
          {
            date: '2024-01-20T10:30:00Z',
            oldValue: 2000,
            newValue: 1850,
            reason: 'Perte de poids trop rapide',
            confidence: 0.87
          },
          {
            date: '2024-01-15T14:20:00Z',
            oldValue: 2100,
            newValue: 2000,
            reason: 'Plateau de perte de poids',
            confidence: 0.75
          }
        ]
      },
      {
        id: 'proteins-adaptive',
        title: 'Protéines',
        category: 'proteins',
        currentValue: 0,
        targetValue: currentGoals?.daily_proteins || 150,
        adaptiveValue: 160,
        trend: 'up',
        confidence: 0.92,
        lastAdjustment: '2024-01-20T10:30:00Z',
        adjustmentReason: 'Augmentation pour optimiser la récupération musculaire',
        icon: Target,
        color: 'blue',
        isAdaptive: true,
        adjustmentHistory: [
          {
            date: '2024-01-20T10:30:00Z',
            oldValue: 150,
            newValue: 160,
            reason: 'Amélioration de la récupération',
            confidence: 0.92
          }
        ]
      },
      {
        id: 'carbs-adaptive',
        title: 'Glucides',
        category: 'carbs',
        currentValue: 0,
        targetValue: currentGoals?.daily_carbs || 250,
        adaptiveValue: 220,
        trend: 'down',
        confidence: 0.78,
        lastAdjustment: '2024-01-18T16:45:00Z',
        adjustmentReason: 'Réduction pour améliorer la sensibilité à l\'insuline',
        icon: Activity,
        color: 'green',
        isAdaptive: true,
        adjustmentHistory: [
          {
            date: '2024-01-18T16:45:00Z',
            oldValue: 250,
            newValue: 220,
            reason: 'Amélioration de la sensibilité à l\'insuline',
            confidence: 0.78
          }
        ]
      },
      {
        id: 'fats-adaptive',
        title: 'Lipides',
        category: 'fats',
        currentValue: 0,
        targetValue: currentGoals?.daily_fats || 70,
        adaptiveValue: 75,
        trend: 'up',
        confidence: 0.85,
        lastAdjustment: '2024-01-19T09:15:00Z',
        adjustmentReason: 'Augmentation des graisses saines pour l\'équilibre hormonal',
        icon: Heart,
        color: 'purple',
        isAdaptive: true,
        adjustmentHistory: [
          {
            date: '2024-01-19T09:15:00Z',
            oldValue: 70,
            newValue: 75,
            reason: 'Équilibre hormonal',
            confidence: 0.85
          }
        ]
      },
      {
        id: 'water-adaptive',
        title: 'Hydratation',
        category: 'water',
        currentValue: 0,
        targetValue: currentGoals?.daily_water_glasses || 8,
        adaptiveValue: 10,
        trend: 'up',
        confidence: 0.95,
        lastAdjustment: '2024-01-20T10:30:00Z',
        adjustmentReason: 'Augmentation basée sur l\'activité physique et la saison',
        icon: Heart,
        color: 'cyan',
        isAdaptive: true,
        adjustmentHistory: [
          {
            date: '2024-01-20T10:30:00Z',
            oldValue: 8,
            newValue: 10,
            reason: 'Activité physique et saison',
            confidence: 0.95
          }
        ]
      }
    ];

    setAdaptiveGoals(goals);
  };

  const initializeAdaptationRules = () => {
    const rules: AdaptationRule[] = [
      {
        id: 'rule-1',
        name: 'Ajustement calorique',
        description: 'Réduire les calories si la perte de poids est trop rapide',
        condition: 'Perte de poids > 1kg/semaine',
        action: 'Réduire les calories de 10%',
        priority: 1,
        enabled: true,
        lastTriggered: '2024-01-20T10:30:00Z',
        triggerCount: 3
      },
      {
        id: 'rule-2',
        name: 'Optimisation protéique',
        description: 'Augmenter les protéines si la récupération est insuffisante',
        condition: 'Récupération musculaire < 70%',
        action: 'Augmenter les protéines de 10g',
        priority: 2,
        enabled: true,
        lastTriggered: '2024-01-20T10:30:00Z',
        triggerCount: 2
      },
      {
        id: 'rule-3',
        name: 'Équilibre hydrique',
        description: 'Ajuster l\'hydratation selon l\'activité physique',
        condition: 'Activité physique > 60min/jour',
        action: 'Augmenter l\'hydratation de 2 verres',
        priority: 3,
        enabled: true,
        lastTriggered: '2024-01-20T10:30:00Z',
        triggerCount: 5
      },
      {
        id: 'rule-4',
        name: 'Plateau de perte de poids',
        description: 'Ajuster les macros si plateau de perte de poids',
        condition: 'Perte de poids = 0 pendant 2 semaines',
        action: 'Réduire les glucides de 20g',
        priority: 4,
        enabled: true,
        triggerCount: 0
      }
    ];

    setAdaptationRules(rules);
  };

  const generateInsights = () => {
    const newInsights: AdaptationInsight[] = [
      {
        id: 'insight-1',
        type: 'optimization',
        title: 'Optimisation détectée',
        description: 'Vos objectifs ont été automatiquement ajustés pour optimiser vos résultats.',
        confidence: 0.92,
        impact: 15,
        action: 'Ajustements appliqués automatiquement',
        icon: TrendingUp,
        color: 'blue'
      },
      {
        id: 'insight-2',
        type: 'warning',
        title: 'Attention aux ajustements',
        description: 'Les ajustements fréquents peuvent indiquer un besoin de révision des objectifs de base.',
        confidence: 0.78,
        impact: 10,
        action: 'Réviser les objectifs de base',
        icon: AlertTriangle,
        color: 'yellow'
      },
      {
        id: 'insight-3',
        type: 'achievement',
        title: 'Adaptation réussie',
        description: 'Vos objectifs s\'adaptent parfaitement à votre évolution. Excellent !',
        confidence: 0.95,
        impact: 20,
        icon: Star,
        color: 'green'
      },
      {
        id: 'insight-4',
        type: 'prediction',
        title: 'Prédiction d\'adaptation',
        description: 'Un nouvel ajustement pourrait être nécessaire dans 3-5 jours.',
        confidence: 0.82,
        impact: 12,
        action: 'Surveiller l\'évolution',
        icon: BarChart3,
        color: 'purple'
      }
    ];

    setInsights(newInsights);
  };

  const runAdaptation = async () => {
    setIsAdapting(true);
    
    // Simuler l'adaptation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mettre à jour les objectifs adaptatifs
    setAdaptiveGoals(prev =>
      prev.map(goal => ({
        ...goal,
        targetValue: goal.adaptiveValue,
        lastAdjustment: new Date().toISOString(),
        adjustmentReason: 'Ajustement automatique basé sur l\'évolution'
      }))
    );
    
    setLastAdaptation(new Date());
    setIsAdapting(false);
  };

  const applyAdaptation = (goalId: string) => {
    setAdaptiveGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, targetValue: goal.adaptiveValue, isAdaptive: true }
          : goal
      )
    );
  };

  const resetAdaptation = (goalId: string) => {
    setAdaptiveGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, adaptiveValue: goal.targetValue, isAdaptive: false }
          : goal
      )
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <TrendingUp className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'achievement':
        return <Star className="h-5 w-5" />;
      case 'prediction':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'achievement':
        return 'text-green-600';
      case 'prediction':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${Math.floor(diffHours / 24)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 text-purple-600" />
            <span>Objectifs nutritionnels adaptatifs</span>
          </h2>
          <p className="text-gray-600">Ajustement automatique basé sur l'évolution et les performances</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-600">IA Adaptative</span>
          </div>
          
          <Button 
            onClick={runAdaptation}
            disabled={isAdapting}
            className="flex items-center space-x-2"
          >
            {isAdapting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{isAdapting ? 'Adaptation...' : 'Adapter'}</span>
          </Button>
        </div>
      </div>

      {/* Auto-adaptation Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {autoAdapt ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">Adaptation automatique</span>
            </div>
            
            <Badge className={autoAdapt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {autoAdapt ? 'Activée' : 'Désactivée'}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoAdapt(!autoAdapt)}
          >
            {autoAdapt ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </Card>

      {/* Adaptive Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adaptiveGoals.map((goal) => {
          const Icon = goal.icon;
          const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
          const adaptiveProgressPercentage = (goal.currentValue / goal.adaptiveValue) * 100;
          
          return (
            <Card key={goal.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${goal.color}-600`} />
                  <span className="font-medium">{goal.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getTrendIcon(goal.trend)}
                  {goal.isAdaptive && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Adaptatif
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{goal.currentValue}</span>
                  <span className="text-gray-500">/ {goal.targetValue}</span>
                </div>
                
                <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Valeur adaptative:</span>
                    <span className="font-medium">{goal.adaptiveValue}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confiance:</span>
                    <span className={`font-medium ${goal.confidence >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {(goal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {goal.adjustmentReason}
                </div>
                
                <div className="flex space-x-2">
                  {goal.targetValue !== goal.adaptiveValue && (
                    <Button
                      size="sm"
                      onClick={() => applyAdaptation(goal.id)}
                      className="flex-1"
                    >
                      Appliquer
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetAdaptation(goal.id)}
                    className="flex-1"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Adaptation Rules */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Règles d'adaptation</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-2">{showHistory ? 'Masquer' : 'Afficher'} l'historique</span>
          </Button>
        </div>
        
        <div className="space-y-3">
          {adaptationRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border ${
                rule.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge className={rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {rule.enabled ? 'Activée' : 'Désactivée'}
                    </Badge>
                    <Badge variant="outline">Priorité {rule.priority}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-500">Condition:</span>
                      <p className="text-gray-700">{rule.condition}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Action:</span>
                      <p className="text-gray-700">{rule.action}</p>
                    </div>
                  </div>
                  
                  {showHistory && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Déclenchée {rule.triggerCount} fois</span>
                        {rule.lastTriggered && (
                          <span>Dernière fois: {formatTime(rule.lastTriggered)}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAdaptationRules(prev =>
                      prev.map(r =>
                        r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                      )
                    );
                  }}
                >
                  {rule.enabled ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Adaptation Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights d'adaptation</h3>
        
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className={`flex-shrink-0 ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <span className={`text-sm ${getInsightColor(insight.type)}`}>
                    {(insight.confidence * 100).toFixed(0)}% confiance
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                
                {insight.action && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {insight.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      Impact: +{insight.impact}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Last Adaptation */}
      {lastAdaptation && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Dernière adaptation</span>
            </div>
            
            <div className="text-sm text-gray-500">
              {lastAdaptation.toLocaleString('fr-FR')}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdaptiveNutritionGoals;