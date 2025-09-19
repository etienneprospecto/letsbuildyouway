import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Heart,
  Lightbulb,
  BarChart3,
  Calendar,
  Star,
  Award,
  Sparkles,
  Cpu,
  Database,
  Settings
} from 'lucide-react';

interface SmartNutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface SmartGoal {
  id: string;
  title: string;
  category: 'calories' | 'proteins' | 'carbs' | 'fats' | 'water';
  currentValue: number;
  targetValue: number;
  smartValue: number;
  confidence: number;
  reasoning: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
  isSmart: boolean;
  lastUpdated: string;
}

interface SmartInsight {
  id: string;
  type: 'optimization' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  impact?: number;
  icon: any;
  color: string;
}

const SmartNutritionGoals: React.FC<SmartNutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [smartGoals, setSmartGoals] = useState<SmartGoal[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiModel] = useState('GPT-4');
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    initializeSmartGoals();
    generateInsights();
  }, []);

  const initializeSmartGoals = () => {
    const goals: SmartGoal[] = [
      {
        id: 'calories-smart',
        title: 'Calories',
        category: 'calories',
        currentValue: 0,
        targetValue: currentGoals?.daily_calories || 2000,
        smartValue: 1850,
        confidence: 0.87,
        reasoning: 'Basé sur votre activité physique et objectifs de perte de poids',
        trend: 'stable',
        icon: Zap,
        color: 'orange',
        isSmart: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'proteins-smart',
        title: 'Protéines',
        category: 'proteins',
        currentValue: 0,
        targetValue: currentGoals?.daily_proteins || 150,
        smartValue: 160,
        confidence: 0.92,
        reasoning: 'Augmentation recommandée pour optimiser la récupération musculaire',
        trend: 'up',
        icon: Target,
        color: 'blue',
        isSmart: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'carbs-smart',
        title: 'Glucides',
        category: 'carbs',
        currentValue: 0,
        targetValue: currentGoals?.daily_carbs || 250,
        smartValue: 220,
        confidence: 0.78,
        reasoning: 'Réduction suggérée pour améliorer la sensibilité à l\'insuline',
        trend: 'down',
        icon: Activity,
        color: 'green',
        isSmart: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'fats-smart',
        title: 'Lipides',
        category: 'fats',
        currentValue: 0,
        targetValue: currentGoals?.daily_fats || 70,
        smartValue: 75,
        confidence: 0.85,
        reasoning: 'Augmentation des graisses saines pour l\'équilibre hormonal',
        trend: 'up',
        icon: Heart,
        color: 'purple',
        isSmart: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'water-smart',
        title: 'Hydratation',
        category: 'water',
        currentValue: 0,
        targetValue: currentGoals?.daily_water_glasses || 8,
        smartValue: 10,
        confidence: 0.95,
        reasoning: 'Augmentation basée sur votre niveau d\'activité et la saison',
        trend: 'up',
        icon: Heart,
        color: 'cyan',
        isSmart: true,
        lastUpdated: new Date().toISOString()
      }
    ];

    setSmartGoals(goals);
  };

  const generateInsights = () => {
    const newInsights: SmartInsight[] = [
      {
        id: 'insight-1',
        type: 'optimization',
        title: 'Optimisation des protéines',
        description: 'Votre apport protéique pourrait être augmenté de 10g pour optimiser la récupération musculaire.',
        confidence: 0.92,
        priority: 'high',
        action: 'Augmenter les protéines de 10g',
        impact: 15,
        icon: TrendingUp,
        color: 'blue'
      },
      {
        id: 'insight-2',
        type: 'warning',
        title: 'Déficit hydrique détecté',
        description: 'Votre consommation d\'eau est en dessous de la recommandation.',
        confidence: 0.88,
        priority: 'high',
        action: 'Boire 2 verres d\'eau supplémentaires',
        impact: 20,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        id: 'insight-3',
        type: 'achievement',
        title: 'Excellente régularité',
        description: 'Vous maintenez une excellente régularité dans vos apports nutritionnels.',
        confidence: 0.95,
        priority: 'low',
        icon: Star,
        color: 'green'
      }
    ];

    setInsights(newInsights);
  };

  const runSmartAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simuler l'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Générer de nouveaux insights
    generateInsights();
    
    setLastAnalysis(new Date());
    setIsAnalyzing(false);
  };

  const applySmartRecommendation = (goalId: string) => {
    setSmartGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, targetValue: goal.smartValue, isSmart: true }
          : goal
      )
    );
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
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'text-blue-600';
      case 'warning':
        return 'text-red-600';
      case 'achievement':
        return 'text-green-600';
      case 'prediction':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Objectifs nutritionnels intelligents</span>
          </h2>
          <p className="text-gray-600">Optimisation basée sur l'IA et l'analyse prédictive</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-600">{aiModel}</span>
          </div>
          
          <Button 
            onClick={runSmartAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isAnalyzing ? 'Analyse...' : 'Analyser'}</span>
          </Button>
        </div>
      </div>

      {/* Smart Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {smartGoals.map((goal) => {
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
                  {goal.isSmart && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  )}
                  {getTrendIcon(goal.trend)}
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
                    <span className="text-gray-500">Recommandation IA:</span>
                    <span className="font-medium">{goal.smartValue}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confiance:</span>
                    <span className={`font-medium ${goal.confidence >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {(goal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {goal.reasoning}
                </div>
                
                {goal.targetValue !== goal.smartValue && (
                  <Button
                    size="sm"
                    onClick={() => applySmartRecommendation(goal.id)}
                    className="w-full"
                  >
                    Appliquer la recommandation IA
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Smart Insights */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Insights IA</span>
          </h3>
          {lastAnalysis && (
            <span className="text-sm text-gray-500">
              Dernière analyse: {lastAnalysis.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>
        
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
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                  <span className={`text-sm ${insight.confidence >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(insight.confidence * 100).toFixed(0)}% confiance
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                
                {insight.action && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {insight.action}
                    </span>
                    {insight.impact && (
                      <span className="text-sm text-gray-500">
                        Impact: +{insight.impact}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <span>Paramètres IA</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle IA</label>
            <select className="w-full p-2 border rounded-lg">
              <option value="GPT-4">GPT-4 (Recommandé)</option>
              <option value="GPT-3.5">GPT-3.5 (Rapide)</option>
              <option value="Claude">Claude (Précis)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Fréquence d'analyse</label>
            <select className="w-full p-2 border rounded-lg">
              <option value="realtime">Temps réel</option>
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidienne</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SmartNutritionGoals;