import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Target, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { NutritionGoals } from '../../services/nutritionService';

interface NutritionGoalsCardProps {
  goals: NutritionGoals | null;
  onEdit: () => void;
  isCoach?: boolean;
}

const NutritionGoalsCard: React.FC<NutritionGoalsCardProps> = ({ 
  goals, 
  onEdit, 
  isCoach = false 
}) => {
  if (!goals) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Aucun objectif défini</h3>
          <p className="text-gray-500 mb-4">
            {isCoach 
              ? "Définissez des objectifs nutritionnels pour ce client"
              : "Votre coach n'a pas encore défini d'objectifs nutritionnels"
            }
          </p>
          {isCoach && (
            <Button onClick={onEdit}>
              <Target className="h-4 w-4 mr-2" />
              Définir des objectifs
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const hasAllGoals = goals.daily_calories && goals.daily_proteins && goals.daily_carbs && goals.daily_fats;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Objectifs nutritionnels</h3>
          {hasAllGoals ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complets
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Partiels
            </Badge>
          )}
        </div>
        {isCoach && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {goals.daily_calories || '--'}
          </div>
          <div className="text-sm text-gray-500">Calories/jour</div>
          {!goals.daily_calories && (
            <div className="text-xs text-gray-400 mt-1">Non défini</div>
          )}
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {goals.daily_proteins ? `${goals.daily_proteins}g` : '--'}
          </div>
          <div className="text-sm text-gray-500">Protéines/jour</div>
          {!goals.daily_proteins && (
            <div className="text-xs text-gray-400 mt-1">Non défini</div>
          )}
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {goals.daily_carbs ? `${goals.daily_carbs}g` : '--'}
          </div>
          <div className="text-sm text-gray-500">Glucides/jour</div>
          {!goals.daily_carbs && (
            <div className="text-xs text-gray-400 mt-1">Non défini</div>
          )}
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {goals.daily_fats ? `${goals.daily_fats}g` : '--'}
          </div>
          <div className="text-sm text-gray-500">Lipides/jour</div>
          {!goals.daily_fats && (
            <div className="text-xs text-gray-400 mt-1">Non défini</div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
              <span className="text-cyan-600 font-semibold text-sm">
                {goals.daily_water_glasses}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">Hydratation</div>
              <div className="text-xs text-gray-500">Verres d'eau par jour</div>
            </div>
          </div>
        </div>
      </div>

      {!hasAllGoals && isCoach && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Objectifs incomplets
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Pour un suivi optimal, définissez tous les objectifs nutritionnels.
          </p>
        </div>
      )}
    </Card>
  );
};

export default NutritionGoalsCard;
