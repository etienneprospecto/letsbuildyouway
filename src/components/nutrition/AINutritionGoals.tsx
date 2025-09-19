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

interface AINutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface AIInsight {
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

interface AIGoal {
  id: string;
  title: string;
  category: 'calories' | 'proteins' | 'carbs' | 'fats' | 'water';
  currentValue: number;
  targetValue: number;
  aiRecommendedValue: number;
  confidence: number;
  reasoning: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
  isOptimized: boolean;
}

interface AIPrediction {
  id: string;
  timeframe: '1d' | '3d' | '1w' | '1m';
  prediction: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}

const AINutritionGoals: React.FC<AINutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [aiGoals, setAiGoals] = useState<AIGoal[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiModel, setAiModel] = useState('GPT-4');
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    initializeAIGoals();
    generateAIInsights();
    generatePredictions();
  }, []);

  const initializeAIGoals = () => {
    const goals: AIGoal[] = [
      {
        id: 'calories-ai',
        title: 'Calories',
        category: 'calories',
        currentValue: 0,
        targetValue: currentGoals?.daily_calories || 2000,
        aiRecommendedValue: 1850,
        confidence: 0.87,
        reasoning: 'Basé sur votre activité physique et objectifs de perte de poids',
        trend: 'stable',
        icon: Zap,
        color: 'orange',
        isOptimized: true
      },
      {
        id: 'proteins-ai',
        title: 'Protéines',
        category: 'proteins',
        currentValue: 0,
        targetValue: currentGoals?.daily_proteins || 150,
        aiRecommendedValue: 160,
        confidence: 0.92,
        reasoning: 'Augmentation recommandée pour optimiser la récupération musculaire',
        trend: 'up',
        icon: Target,
        color: 'blue',
        isOptimized: true
      },
      {
        id: 'carbs-ai',
        title: 'Glucides',
        category: 'carbs',
        currentValue: 0,
        targetValue: currentGoals?.daily_carbs || 250,
        aiRecommendedValue: 220,
        confidence: 0.78,
        reasoning: 'Réduction suggérée pour améliorer la sensibilité à l\'insuline',
        trend: 'down',
        icon: Activity,
        color: 'green',
        isOptimized: false
      },
      {
        id: 'fats-ai',
        title: 'Lipides',
        category: 'fats',
        currentValue: 0,
        targetValue: currentGoals?.daily_fats || 70,
        aiRecommendedValue: 75,
        confidence: 0.85,
        reasoning: 'Augmentation des graisses saines pour l\'équilibre hormonal',
        trend: 'up',
        icon: Heart,
        color: 'purple',
        isOptimized: true
      },
      {
        id: 'water-ai',
        title: 'Hydratation',
        category: 'water',
        currentValue: 0,
        targetValue: currentGoals?.daily_water_glasses || 8,
        aiRecommendedValue: 10,
        confidence: 0.95,
        reasoning: 'Augmentation basée sur votre niveau d\'activité et la saison',
        trend: 'up',
        icon: Heart,
        color: 'cyan',
        isOptimized: true
      }
    ];

    setAiGoals(goals);
  };

  const generateAIInsights = () => {
    const newInsights: AIInsight[] = [
      {
        id: 'insight-1',
        type: 'optimization',
        title: 'Optimisation des protéines',
        description: 'Votre apport protéique pourrait être augmenté de 10g pour optimiser la récupération musculaire après vos séances d\'entraînement.',
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
        description: 'Votre consommation d\'eau est en dessous de la recommandation. Cela peut affecter vos performances et votre récupération.',
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
        description: 'Vous maintenez une excellente régularité dans vos apports nutritionnels. Continuez comme ça !',
        confidence: 0.95,
        priority: 'low',
        icon: Star,
        color: 'green'
      },
      {
        id: 'insight-4',
        type: 'prediction',
        title: 'Prédiction de performance',
        description: 'Si vous maintenez ce rythme, vous devriez atteindre vos objectifs dans 3-4 semaines.',
        confidence: 0.82,
        priority: 'medium',
        action: 'Maintenir le rythme actuel',
        impact: 25,
        icon: BarChart3,
        color: 'purple'
      }
    ];

    setInsights(newInsights);
  };

  const generatePredictions = () => {
    const newPredictions: AIPrediction[] = [
      {
        id: 'pred-1',
        timeframe: '1d',
        prediction: 1850,
        confidence: 0.89,
        factors: ['Historique récent', 'Planification des repas', 'Niveau d\'activité'],
        recommendation: 'Maintenir l\'apport calorique actuel'
      },
      {
        id: 'pred-2',
        timeframe: '1w',
        prediction: 1820,
        confidence: 0.76,
        factors: ['Tendance sur 7 jours', 'Variations saisonnières', 'Objectifs personnels'],
        recommendation: 'Réduire légèrement les calories pour accélérer les résultats'
      },
      {
        id: 'pred-3',
        timeframe: '1m',
        prediction: 1750,
        confidence: 0.68,
        factors: ['Évolution à long terme', 'Adaptation métabolique', 'Objectifs finaux'],
        recommendation: 'Ajustement progressif vers l\'objectif final'
      }
    ];

    setPredictions(newPredictions);
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simuler l'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Générer de nouveaux insights
    generateAIInsights();
    generatePredictions();
    
    setLastAnalysis(new Date());
    setIsAnalyzing(false);
  };

  const applyAIRecommendation = (goalId: string) => {
    setAiGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, targetValue: goal.aiRecommendedValue, isOptimized: true }
          : goal
      )
    );
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
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
            onClick={runAIAnalysis}
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

      {/* AI Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiGoals.map((goal) => {
          const Icon = goal.icon;
          const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
          const aiProgressPercentage = (goal.currentValue / goal.aiRecommendedValue) * 100;
          
          return (
            <Card key={goal.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${goal.color}-600`} />
                  <span className="font-medium">{goal.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {goal.isOptimized && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  )}
                  <div className={`w-2 h-2 rounded-full ${
                    goal.trend === 'up' ? 'bg-green-500' : 
                    goal.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
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
                    <span className="font-medium">{goal.aiRecommendedValue}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confiance:</span>
                    <span className={`font-medium ${getConfidenceColor(goal.confidence)}`}>
                      {(goal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {goal.reasoning}
                </div>
                
                {goal.targetValue !== goal.aiRecommendedValue && (
                  <Button
                    size="sm"
                    onClick={() => applyAIRecommendation(goal.id)}
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

      {/* AI Insights */}
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
                  <span className={`text-sm ${getConfidenceColor(insight.confidence)}`}>
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

      {/* AI Predictions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Prédictions IA</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">
                  {prediction.timeframe === '1d' ? '1 jour' :
                   prediction.timeframe === '3d' ? '3 jours' :
                   prediction.timeframe === '1w' ? '1 semaine' : '1 mois'}
                </h4>
                <span className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {prediction.prediction}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {prediction.recommendation}
              </p>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Facteurs:</p>
                {prediction.factors.map((factor, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {factor}
                  </div>
                ))}
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

export default AINutritionGoals;
