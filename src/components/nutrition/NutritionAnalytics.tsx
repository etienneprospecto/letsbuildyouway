import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Users,
  Camera,
  Droplets
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface NutritionAnalyticsProps {
  clientId: string;
  coachId: string;
}

interface AnalyticsData {
  period: string;
  totalEntries: number;
  totalPhotos: number;
  totalWaterGlasses: number;
  averageCalories: number;
  averageProteins: number;
  averageCarbs: number;
  averageFats: number;
  goalAchievement: number;
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
  mealTypeDistribution: {
    'petit-dejeuner': number;
    'dejeuner': number;
    'diner': number;
    'collation': number;
  };
  photoUploadRate: number;
  consistencyScore: number;
}

const NutritionAnalytics: React.FC<NutritionAnalyticsProps> = ({ clientId, coachId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [clientId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        period: selectedPeriod,
        totalEntries: 45,
        totalPhotos: 38,
        totalWaterGlasses: 240,
        averageCalories: 1850,
        averageProteins: 120,
        averageCarbs: 180,
        averageFats: 65,
        goalAchievement: 85,
        trends: {
          calories: 'up',
          proteins: 'stable',
          carbs: 'down',
          fats: 'up',
          water: 'stable'
        },
        weeklyData: [
          { date: '2024-01-01', calories: 1800, proteins: 115, carbs: 190, fats: 60, water: 7 },
          { date: '2024-01-02', calories: 1900, proteins: 125, carbs: 185, fats: 65, water: 8 },
          { date: '2024-01-03', calories: 1750, proteins: 110, carbs: 175, fats: 55, water: 6 },
          { date: '2024-01-04', calories: 2000, proteins: 130, carbs: 200, fats: 70, water: 9 },
          { date: '2024-01-05', calories: 1850, proteins: 120, carbs: 180, fats: 65, water: 7 },
          { date: '2024-01-06', calories: 1950, proteins: 125, carbs: 190, fats: 68, water: 8 },
          { date: '2024-01-07', calories: 1800, proteins: 115, carbs: 175, fats: 62, water: 6 }
        ],
        mealTypeDistribution: {
          'petit-dejeuner': 12,
          'dejeuner': 15,
          'diner': 13,
          'collation': 5
        },
        photoUploadRate: 84,
        consistencyScore: 78
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune donnée d'analyse disponible</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analyses nutritionnelles</h2>
          <p className="text-gray-600">Statistiques détaillées et tendances</p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 jours</SelectItem>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="90">90 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{analyticsData.totalEntries}</div>
              <div className="text-sm text-gray-500">Entrées totales</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{analyticsData.totalPhotos}</div>
              <div className="text-sm text-gray-500">Photos uploadées</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-cyan-600" />
            <div>
              <div className="text-2xl font-bold">{analyticsData.totalWaterGlasses}</div>
              <div className="text-sm text-gray-500">Verres d'eau</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{analyticsData.goalAchievement}%</div>
              <div className="text-sm text-gray-500">Objectifs atteints</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="distribution">Répartition</TabsTrigger>
          <TabsTrigger value="consistency">Cohérence</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Moyennes nutritionnelles</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span className="font-semibold">{analyticsData.averageCalories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Protéines</span>
                  <span className="font-semibold">{analyticsData.averageProteins}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Glucides</span>
                  <span className="font-semibold">{analyticsData.averageCarbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Lipides</span>
                  <span className="font-semibold">{analyticsData.averageFats}g</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Engagement</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Taux de photos</span>
                  <span className="font-semibold">{analyticsData.photoUploadRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Score de cohérence</span>
                  <span className="font-semibold">{analyticsData.consistencyScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Objectifs atteints</span>
                  <span className="font-semibold">{analyticsData.goalAchievement}%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tendances des macronutriments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analyticsData.trends).map(([nutrient, trend]) => (
                <div key={nutrient} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="capitalize">{nutrient}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trend)}
                    <span className={`text-sm ${getTrendColor(trend)}`}>
                      {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition des repas</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.mealTypeDistribution).map(([mealType, count]) => (
                <div key={mealType} className="flex items-center justify-between">
                  <span className="capitalize">{mealType}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analyticsData.mealTypeDistribution))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Consistency Tab */}
        <TabsContent value="consistency" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analyse de cohérence</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Régularité des enregistrements</span>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Qualité des photos</span>
                <Badge className="bg-blue-100 text-blue-800">Bon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Respect des objectifs</span>
                <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionAnalytics;
