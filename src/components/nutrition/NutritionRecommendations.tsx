import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Droplets,
  Target,
  Apple
} from 'lucide-react';
import { NutritionStats } from '../../services/nutritionService';

interface NutritionRecommendationsProps {
  stats: NutritionStats;
  isCoach?: boolean;
}

const NutritionRecommendations: React.FC<NutritionRecommendationsProps> = ({ 
  stats, 
  isCoach = false 
}) => {
  const getRecommendations = () => {
    const recommendations = [];
    const { progress, goals } = stats;

    // Calories recommendations
    if (goals?.daily_calories) {
      if (progress.calories < 70) {
        recommendations.push({
          type: 'warning',
          icon: TrendingDown,
          title: 'Apport calorique insuffisant',
          message: 'Vous êtes en dessous de 70% de vos objectifs caloriques. Considérez ajouter des collations saines.',
          action: 'Ajouter une collation'
        });
      } else if (progress.calories > 130) {
        recommendations.push({
          type: 'warning',
          icon: TrendingUp,
          title: 'Apport calorique élevé',
          message: 'Vous dépassez vos objectifs caloriques. Surveillez vos portions et privilégiez les aliments nutritifs.',
          action: 'Réduire les portions'
        });
      } else if (progress.calories >= 90 && progress.calories <= 110) {
        recommendations.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Excellent équilibre calorique',
          message: 'Vous maintenez un bon équilibre calorique. Continuez ainsi !',
          action: null
        });
      }
    }

    // Proteins recommendations
    if (goals?.daily_proteins) {
      if (progress.proteins < 80) {
        recommendations.push({
          type: 'warning',
          icon: TrendingDown,
          title: 'Apport protéique insuffisant',
          message: 'Augmentez votre consommation de protéines pour soutenir votre récupération musculaire.',
          action: 'Ajouter des protéines'
        });
      } else if (progress.proteins >= 90 && progress.proteins <= 110) {
        recommendations.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Apport protéique optimal',
          message: 'Votre consommation de protéines est parfaite pour votre objectif.',
          action: null
        });
      }
    }

    // Hydration recommendations
    if (goals?.daily_water_glasses) {
      if (progress.water < 70) {
        recommendations.push({
          type: 'warning',
          icon: Droplets,
          title: 'Hydratation insuffisante',
          message: 'Buvez plus d\'eau pour maintenir une hydratation optimale.',
          action: 'Boire de l\'eau'
        });
      } else if (progress.water >= 90 && progress.water <= 110) {
        recommendations.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Hydratation parfaite',
          message: 'Excellent ! Vous maintenez une hydratation optimale.',
          action: null
        });
      }
    }

    // Macronutrients balance
    if (goals?.daily_carbs && goals?.daily_fats) {
      const carbsRatio = progress.carbs / 100;
      const fatsRatio = progress.fats / 100;
      
      if (carbsRatio < 0.7 && fatsRatio < 0.7) {
        recommendations.push({
          type: 'info',
          icon: Lightbulb,
          title: 'Équilibre des macronutriments',
          message: 'Vos glucides et lipides sont en dessous des objectifs. Ajoutez des sources saines de ces nutriments.',
          action: 'Équilibrer les macros'
        });
      }
    }

    // General recommendations based on overall progress
    const averageProgress = (progress.calories + progress.proteins + progress.carbs + progress.fats + progress.water) / 5;
    
    if (averageProgress < 60) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Suivi nutritionnel à améliorer',
        message: 'Votre suivi nutritionnel global est en dessous de 60%. Considérez être plus régulier dans vos enregistrements.',
        action: 'Améliorer le suivi'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Excellent travail !</h3>
          <p className="text-gray-600">
            Votre suivi nutritionnel est optimal. Continuez à maintenir ces bonnes habitudes.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Recommandations nutritionnelles</h3>
        <Badge variant="secondary">
          {recommendations.length} conseil{recommendations.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(rec.type)}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {rec.message}
                  </p>
                  {rec.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {rec.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isCoach && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="h-4 w-4" />
            <span>
              Ces recommandations sont basées sur les objectifs définis et les données actuelles.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NutritionRecommendations;
