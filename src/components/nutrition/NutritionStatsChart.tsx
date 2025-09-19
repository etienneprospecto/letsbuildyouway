import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';

interface NutritionStatsChartProps {
  data: {
    date: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    water: number;
  }[];
  goals: {
    daily_calories?: number;
    daily_proteins?: number;
    daily_carbs?: number;
    daily_fats?: number;
    daily_water_glasses: number;
  } | null;
}

const NutritionStatsChart: React.FC<NutritionStatsChartProps> = ({ data, goals }) => {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const calculateWeeklyAverage = (values: number[]) => {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const calculateGoalAchievement = (values: number[], goal: number) => {
    const average = calculateWeeklyAverage(values);
    return goal > 0 ? (average / goal) * 100 : 0;
  };

  const calories = data.map(d => d.calories);
  const proteins = data.map(d => d.proteins);
  const carbs = data.map(d => d.carbs);
  const fats = data.map(d => d.fats);
  const water = data.map(d => d.water);

  const weeklyAverages = {
    calories: calculateWeeklyAverage(calories),
    proteins: calculateWeeklyAverage(proteins),
    carbs: calculateWeeklyAverage(carbs),
    fats: calculateWeeklyAverage(fats),
    water: calculateWeeklyAverage(water)
  };

  const goalAchievements = {
    calories: goals?.daily_calories ? calculateGoalAchievement(calories, goals.daily_calories) : 0,
    proteins: goals?.daily_proteins ? calculateGoalAchievement(proteins, goals.daily_proteins) : 0,
    carbs: goals?.daily_carbs ? calculateGoalAchievement(carbs, goals.daily_carbs) : 0,
    fats: goals?.daily_fats ? calculateGoalAchievement(fats, goals.daily_fats) : 0,
    water: goals?.daily_water_glasses ? calculateGoalAchievement(water, goals.daily_water_glasses) : 0
  };

  const getAchievementBadge = (achievement: number) => {
    if (achievement >= 100) return <Badge className="bg-green-100 text-green-800">Objectif atteint</Badge>;
    if (achievement >= 80) return <Badge className="bg-yellow-100 text-yellow-800">Proche de l'objectif</Badge>;
    return <Badge className="bg-red-100 text-red-800">Objectif non atteint</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Weekly Averages */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Moyennes de la semaine</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(weeklyAverages.calories)}
            </div>
            <div className="text-sm text-gray-500">Calories/jour</div>
            {goals?.daily_calories && (
              <div className="mt-1">
                {getAchievementBadge(goalAchievements.calories)}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(weeklyAverages.proteins)}g
            </div>
            <div className="text-sm text-gray-500">Protéines/jour</div>
            {goals?.daily_proteins && (
              <div className="mt-1">
                {getAchievementBadge(goalAchievements.proteins)}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(weeklyAverages.carbs)}g
            </div>
            <div className="text-sm text-gray-500">Glucides/jour</div>
            {goals?.daily_carbs && (
              <div className="mt-1">
                {getAchievementBadge(goalAchievements.carbs)}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(weeklyAverages.fats)}g
            </div>
            <div className="text-sm text-gray-500">Lipides/jour</div>
            {goals?.daily_fats && (
              <div className="mt-1">
                {getAchievementBadge(goalAchievements.fats)}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {Math.round(weeklyAverages.water)}
            </div>
            <div className="text-sm text-gray-500">Verres/jour</div>
            {goals?.daily_water_glasses && (
              <div className="mt-1">
                {getAchievementBadge(goalAchievements.water)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Daily Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Évolution quotidienne</h3>
        <div className="space-y-4">
          {data.slice(-7).map((day, index) => {
            const previousDay = data[data.length - 8 + index];
            const isFirstDay = !previousDay;
            
            return (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-orange-600 font-medium">{day.calories}</span>
                      <span className="text-gray-500">cal</span>
                      {!isFirstDay && (
                        <div className={`flex items-center ${getTrendColor(day.calories, previousDay.calories)}`}>
                          {getTrendIcon(day.calories, previousDay.calories)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-600 font-medium">{day.proteins}g</span>
                      <span className="text-gray-500">prot</span>
                      {!isFirstDay && (
                        <div className={`flex items-center ${getTrendColor(day.proteins, previousDay.proteins)}`}>
                          {getTrendIcon(day.proteins, previousDay.proteins)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-cyan-600 font-medium">{day.water}</span>
                      <span className="text-gray-500">verres</span>
                      {!isFirstDay && (
                        <div className={`flex items-center ${getTrendColor(day.water, previousDay.water)}`}>
                          {getTrendIcon(day.water, previousDay.water)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {goals?.daily_calories && (
                    <div>
                      {Math.round((day.calories / goals.daily_calories) * 100)}% objectif
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights nutritionnels</h3>
        <div className="space-y-3">
          {goalAchievements.calories > 100 && (
            <div className="flex items-center space-x-2 text-orange-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Vous dépassez régulièrement vos objectifs caloriques</span>
            </div>
          )}
          
          {goalAchievements.proteins < 80 && (
            <div className="flex items-center space-x-2 text-blue-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Considérez augmenter votre apport en protéines</span>
            </div>
          )}
          
          {goalAchievements.water < 80 && (
            <div className="flex items-center space-x-2 text-cyan-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">N'oubliez pas de boire suffisamment d'eau</span>
            </div>
          )}
          
          {goalAchievements.calories >= 80 && goalAchievements.calories <= 100 && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Excellent équilibre nutritionnel !</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NutritionStatsChart;
