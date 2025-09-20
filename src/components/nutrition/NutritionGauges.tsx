import React from 'react';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface NutritionGaugesProps {
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
}

const NutritionGauges: React.FC<NutritionGaugesProps> = ({ stats }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return 'Dépassé';
    if (progress >= 80) return 'Proche';
    return 'Objectif';
  };

  const getStatusVariant = (progress: number): "default" | "secondary" | "destructive" | "outline" => {
    if (progress >= 100) return 'destructive';
    if (progress >= 80) return 'secondary';
    return 'default';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Calories */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Calories</h3>
          <Badge variant={getStatusVariant(stats.progress.calories)}>
            {getProgressStatus(stats.progress.calories)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.totalCalories}</span>
            <span className="text-gray-500 dark:text-gray-400">
              / {stats.goals?.daily_calories || 0}
            </span>
          </div>
          <Progress 
            value={Math.min(stats.progress.calories, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.progress.calories.toFixed(1)}% de l'objectif
          </div>
        </div>
      </Card>

      {/* Protéines */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Protéines</h3>
          <Badge variant={getStatusVariant(stats.progress.proteins)}>
            {getProgressStatus(stats.progress.proteins)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.totalProteins.toFixed(1)}g</span>
            <span className="text-gray-500">
              / {stats.goals?.daily_proteins || 0}g
            </span>
          </div>
          <Progress 
            value={Math.min(stats.progress.proteins, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            {stats.progress.proteins.toFixed(1)}% de l'objectif
          </div>
        </div>
      </Card>

      {/* Glucides */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Glucides</h3>
          <Badge variant={getStatusVariant(stats.progress.carbs)}>
            {getProgressStatus(stats.progress.carbs)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.totalCarbs.toFixed(1)}g</span>
            <span className="text-gray-500">
              / {stats.goals?.daily_carbs || 0}g
            </span>
          </div>
          <Progress 
            value={Math.min(stats.progress.carbs, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            {stats.progress.carbs.toFixed(1)}% de l'objectif
          </div>
        </div>
      </Card>

      {/* Lipides */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Lipides</h3>
          <Badge variant={getStatusVariant(stats.progress.fats)}>
            {getProgressStatus(stats.progress.fats)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.totalFats.toFixed(1)}g</span>
            <span className="text-gray-500">
              / {stats.goals?.daily_fats || 0}g
            </span>
          </div>
          <Progress 
            value={Math.min(stats.progress.fats, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            {stats.progress.fats.toFixed(1)}% de l'objectif
          </div>
        </div>
      </Card>

      {/* Hydratation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Hydratation</h3>
          <Badge variant={getStatusVariant(stats.progress.water)}>
            {getProgressStatus(stats.progress.water)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.waterGlasses} verres</span>
            <span className="text-gray-500">
              / {stats.goals?.daily_water_glasses || 0}
            </span>
          </div>
          <Progress 
            value={Math.min(stats.progress.water, 100)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500">
            {stats.progress.water.toFixed(1)}% de l'objectif
          </div>
        </div>
      </Card>

      {/* Résumé */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">Résumé du jour</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Repas enregistrés:</span>
            <span className="font-medium">
              {stats.totalCalories > 0 ? 'Oui' : 'Non'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Hydratation:</span>
            <span className="font-medium">
              {stats.waterGlasses > 0 ? `${stats.waterGlasses} verres` : 'Aucun'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Objectifs:</span>
            <span className="font-medium">
              {stats.goals ? 'Définis' : 'Non définis'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NutritionGauges;
