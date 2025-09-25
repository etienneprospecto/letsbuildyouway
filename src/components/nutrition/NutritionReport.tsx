import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface NutritionReportProps {
  clientId: string;
  clientName: string;
  period: string;
  data: {
    totalEntries: number;
    totalPhotos: number;
    totalWaterGlasses: number;
    averageCalories: number;
    averageProteins: number;
    averageCarbs: number;
    averageFats: number;
    goalAchievement: number;
    consistencyScore: number;
    trends: {
      calories: 'up' | 'down' | 'stable';
      proteins: 'up' | 'down' | 'stable';
      carbs: 'up' | 'down' | 'stable';
      fats: 'up' | 'down' | 'stable';
      water: 'up' | 'down' | 'stable';
    };
    weeklyData: Array<{
      date: string;
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      water: number;
    }>;
    recommendations: string[];
  };
}

const NutritionReport: React.FC<NutritionReportProps> = ({
  clientId,
  clientName,
  period,
  data
}) => {
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Simuler la génération du rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous pourriez appeler une API pour générer le rapport

      // Simuler le téléchargement
      const element = document.createElement('a');
      element.href = '#'; // URL du rapport généré
      element.download = `rapport-nutrition-${clientName}-${period}.${reportFormat}`;
      element.click();
    } catch (error) {

    } finally {
      setIsGenerating(false);
    }
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

  const getAchievementBadge = (achievement: number) => {
    if (achievement >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (achievement >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Bon</Badge>;
    if (achievement >= 50) return <Badge className="bg-orange-100 text-orange-800">Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>;
  };

  const getConsistencyBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Très cohérent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Cohérent</Badge>;
    return <Badge className="bg-red-100 text-red-800">Peu cohérent</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rapport nutritionnel</h2>
          <p className="text-gray-600">{clientName} - Période: {period} jours</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={reportFormat} onValueChange={setReportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateReport} 
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? 'Génération...' : 'Télécharger'}</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{data.totalEntries}</div>
              <div className="text-sm text-gray-500">Entrées totales</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{data.goalAchievement}%</div>
              <div className="text-sm text-gray-500">Objectifs atteints</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{data.consistencyScore}%</div>
              <div className="text-sm text-gray-500">Cohérence</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{data.totalPhotos}</div>
              <div className="text-sm text-gray-500">Photos uploadées</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Aperçu nutritionnel</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Calories moyennes</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{data.averageCalories} kcal</span>
                <div className="flex items-center">
                  {getTrendIcon(data.trends.calories)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Protéines moyennes</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{data.averageProteins}g</span>
                <div className="flex items-center">
                  {getTrendIcon(data.trends.proteins)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Glucides moyens</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{data.averageCarbs}g</span>
                <div className="flex items-center">
                  {getTrendIcon(data.trends.carbs)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Lipides moyens</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{data.averageFats}g</span>
                <div className="flex items-center">
                  {getTrendIcon(data.trends.fats)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Métriques de performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Atteinte des objectifs</span>
              {getAchievementBadge(data.goalAchievement)}
            </div>
            
            <div className="flex justify-between items-center">
              <span>Cohérence du suivi</span>
              {getConsistencyBadge(data.consistencyScore)}
            </div>
            
            <div className="flex justify-between items-center">
              <span>Hydratation</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{data.totalWaterGlasses} verres</span>
                <div className="flex items-center">
                  {getTrendIcon(data.trends.water)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Taux de photos</span>
              <Badge className="bg-blue-100 text-blue-800">
                {Math.round((data.totalPhotos / data.totalEntries) * 100)}%
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Évolution hebdomadaire</h3>
        <div className="space-y-3">
          {data.weeklyData.slice(-7).map((week, index) => (
            <div key={week.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium">
                  Semaine {data.weeklyData.length - 7 + index + 1}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(week.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-orange-600 font-medium">{week.calories} cal</span>
                <span className="text-blue-600 font-medium">{week.proteins}g prot</span>
                <span className="text-green-600 font-medium">{week.carbs}g gluc</span>
                <span className="text-purple-600 font-medium">{week.fats}g lip</span>
                <span className="text-cyan-600 font-medium">{week.water} verres</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommandations</h3>
        <div className="space-y-3">
          {data.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Options d'export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Rapport détaillé</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Données brutes</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Graphiques</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NutritionReport;
