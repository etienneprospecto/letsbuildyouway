import React from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Zap, 
  Beef, 
  Wheat, 
  Droplets, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface MacroBreakdownProps {
  stats: {
    totalCalories: number;
    totalProteins: number;
    totalCarbs: number;
    totalFats: number;
    waterGlasses: number;
    goals: {
      daily_calories?: number;
      daily_proteins?: number;
      daily_carbs?: number;
      daily_fats?: number;
      daily_water_glasses: number;
    } | null;
    progress: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      water: number;
    };
  };
  previousStats?: {
    totalCalories: number;
    totalProteins: number;
    totalCarbs: number;
    totalFats: number;
    waterGlasses: number;
  } | null;
}

const MacroBreakdown: React.FC<MacroBreakdownProps> = ({ stats, previousStats }) => {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return <Badge className="bg-red-100 text-red-800">Dépassé</Badge>;
    if (progress >= 80) return <Badge className="bg-yellow-100 text-yellow-800">Proche</Badge>;
    return <Badge className="bg-green-100 text-green-800">Objectif</Badge>;
  };

  const macros = [
    {
      name: 'Calories',
      icon: Zap,
      current: stats.totalCalories,
      goal: stats.goals?.daily_calories || 0,
      progress: stats.progress.calories,
      unit: '',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      previous: previousStats?.totalCalories || 0
    },
    {
      name: 'Protéines',
      icon: Beef,
      current: stats.totalProteins,
      goal: stats.goals?.daily_proteins || 0,
      progress: stats.progress.proteins,
      unit: 'g',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      previous: previousStats?.totalProteins || 0
    },
    {
      name: 'Glucides',
      icon: Wheat,
      current: stats.totalCarbs,
      goal: stats.goals?.daily_carbs || 0,
      progress: stats.progress.carbs,
      unit: 'g',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      previous: previousStats?.totalCarbs || 0
    },
    {
      name: 'Lipides',
      icon: Droplets,
      current: stats.totalFats,
      goal: stats.goals?.daily_fats || 0,
      progress: stats.progress.fats,
      unit: 'g',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      previous: previousStats?.totalFats || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Macros Overview */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Répartition des macronutriments</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {macros.map((macro) => {
            const Icon = macro.icon;
            const hasPrevious = previousStats && macro.previous > 0;
            
            return (
              <div key={macro.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${macro.bgColor}`}>
                      <Icon className={`h-4 w-4 ${macro.color}`} />
                    </div>
                    <span className="font-medium">{macro.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(macro.progress)}
                    {hasPrevious && (
                      <div className={`flex items-center ${getTrendColor(macro.current, macro.previous)}`}>
                        {getTrendIcon(macro.current, macro.previous)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`font-semibold ${macro.color}`}>
                      {macro.current.toFixed(macro.unit === 'g' ? 1 : 0)}{macro.unit}
                    </span>
                    <span className="text-gray-500">
                      / {macro.goal}{macro.unit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(macro.progress, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{macro.progress.toFixed(1)}% de l'objectif</span>
                    {hasPrevious && (
                      <span className={getTrendColor(macro.current, macro.previous)}>
                        {macro.current > macro.previous ? '+' : ''}
                        {(macro.current - macro.previous).toFixed(1)}{macro.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Hydration */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Droplets className="h-5 w-5 text-cyan-600" />
          <h3 className="text-lg font-semibold">Hydratation</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Droplets className="h-4 w-4 text-cyan-600" />
              </div>
              <span className="font-medium">Verres d'eau</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(stats.progress.water)}
              {previousStats && (
                <div className={`flex items-center ${getTrendColor(stats.waterGlasses, previousStats.waterGlasses)}`}>
                  {getTrendIcon(stats.waterGlasses, previousStats.waterGlasses)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-cyan-600">
                {stats.waterGlasses} verres
              </span>
              <span className="text-gray-500">
                / {stats.goals?.daily_water_glasses || 0}
              </span>
            </div>
            
            <Progress 
              value={Math.min(stats.progress.water, 100)} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.progress.water.toFixed(1)}% de l'objectif</span>
              {previousStats && (
                <span className={getTrendColor(stats.waterGlasses, previousStats.waterGlasses)}>
                  {stats.waterGlasses > previousStats.waterGlasses ? '+' : ''}
                  {stats.waterGlasses - previousStats.waterGlasses} verres
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Résumé de la journée</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCalories}
            </div>
            <div className="text-sm text-gray-500">Calories</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalProteins.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-500">Protéines</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCarbs.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-500">Glucides</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalFats.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-500">Lipides</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MacroBreakdown;
