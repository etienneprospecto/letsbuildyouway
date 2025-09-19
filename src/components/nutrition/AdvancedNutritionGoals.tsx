import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Target, 
  Calculator, 
  Activity, 
  Heart, 
  Zap,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import { NutritionGoals } from '../../services/nutritionService';

interface AdvancedNutritionGoalsProps {
  goals: NutritionGoals | null;
  onSave: (goals: Partial<NutritionGoals>) => void;
  onReset: () => void;
  isCoach?: boolean;
}

const AdvancedNutritionGoals: React.FC<AdvancedNutritionGoalsProps> = ({
  goals,
  onSave,
  onReset,
  isCoach = false
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    daily_calories: goals?.daily_calories?.toString() || '',
    daily_proteins: goals?.daily_proteins?.toString() || '',
    daily_carbs: goals?.daily_carbs?.toString() || '',
    daily_fats: goals?.daily_fats?.toString() || '',
    daily_water_glasses: goals?.daily_water_glasses?.toString() || '8'
  });

  const [calculatedGoals, setCalculatedGoals] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  });

  const calculateGoals = (weight: number, height: number, age: number, activityLevel: string, goal: string) => {
    // Calcul BMR (Basal Metabolic Rate) - Formule de Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Homme
    
    // Facteurs d'activité
    const activityFactors = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    
    const tdee = bmr * (activityFactors[activityLevel as keyof typeof activityFactors] || 1.2);
    
    // Ajustement selon l'objectif
    let calories = tdee;
    if (goal === 'lose') calories *= 0.8; // Déficit de 20%
    if (goal === 'gain') calories *= 1.2; // Surplus de 20%
    
    // Répartition des macronutriments
    const proteins = Math.round(weight * 2.2); // 2.2g par kg de poids
    const fats = Math.round(calories * 0.25 / 9); // 25% des calories en lipides
    const carbs = Math.round((calories - (proteins * 4) - (fats * 9)) / 4); // Reste en glucides
    
    setCalculatedGoals({
      calories: Math.round(calories),
      proteins,
      carbs,
      fats
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const goalsToSave = {
      daily_calories: formData.daily_calories ? parseInt(formData.daily_calories) : undefined,
      daily_proteins: formData.daily_proteins ? parseFloat(formData.daily_proteins) : undefined,
      daily_carbs: formData.daily_carbs ? parseFloat(formData.daily_carbs) : undefined,
      daily_fats: formData.daily_fats ? parseFloat(formData.daily_fats) : undefined,
      daily_water_glasses: parseInt(formData.daily_water_glasses) || 8
    };
    
    onSave(goalsToSave);
  };

  const applyCalculatedGoals = () => {
    setFormData(prev => ({
      ...prev,
      daily_calories: calculatedGoals.calories.toString(),
      daily_proteins: calculatedGoals.proteins.toString(),
      daily_carbs: calculatedGoals.carbs.toString(),
      daily_fats: calculatedGoals.fats.toString()
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Objectifs nutritionnels avancés</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Objectifs de base</TabsTrigger>
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
        </TabsList>

        {/* Basic Goals Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="calories">Calories par jour</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.daily_calories}
                  onChange={(e) => handleInputChange('daily_calories', e.target.value)}
                  placeholder="2000"
                />
              </div>
              
              <div>
                <Label htmlFor="proteins">Protéines par jour (g)</Label>
                <Input
                  id="proteins"
                  type="number"
                  step="0.1"
                  value={formData.daily_proteins}
                  onChange={(e) => handleInputChange('daily_proteins', e.target.value)}
                  placeholder="150"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="carbs">Glucides par jour (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.daily_carbs}
                  onChange={(e) => handleInputChange('daily_carbs', e.target.value)}
                  placeholder="250"
                />
              </div>
              
              <div>
                <Label htmlFor="fats">Lipides par jour (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  step="0.1"
                  value={formData.daily_fats}
                  onChange={(e) => handleInputChange('daily_fats', e.target.value)}
                  placeholder="65"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="water">Verres d'eau par jour</Label>
            <Input
              id="water"
              type="number"
              value={formData.daily_water_glasses}
              onChange={(e) => handleInputChange('daily_water_glasses', e.target.value)}
              placeholder="8"
            />
          </div>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Calculateur automatique</h3>
            </div>
            <p className="text-sm text-blue-700">
              Calculez automatiquement les objectifs nutritionnels basés sur les caractéristiques physiques et l'objectif.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                />
              </div>
              
              <div>
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="activity">Niveau d'activité</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="sedentary">Sédentaire</option>
                  <option value="light">Léger (1-3 jours/semaine)</option>
                  <option value="moderate">Modéré (3-5 jours/semaine)</option>
                  <option value="active">Actif (6-7 jours/semaine)</option>
                  <option value="very_active">Très actif (2x/jour)</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="goal">Objectif</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="maintain">Maintenir le poids</option>
                  <option value="lose">Perdre du poids</option>
                  <option value="gain">Prendre du poids</option>
                </select>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => calculateGoals(70, 175, 30, 'moderate', 'maintain')}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculer
              </Button>
            </div>
          </div>
          
          {calculatedGoals.calories > 0 && (
            <Card className="p-4 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">Objectifs calculés</h4>
                <Button size="sm" onClick={applyCalculatedGoals}>
                  Appliquer
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">{calculatedGoals.calories}</span>
                  <span className="text-gray-500"> kcal</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">{calculatedGoals.proteins}g</span>
                  <span className="text-gray-500"> protéines</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">{calculatedGoals.carbs}g</span>
                  <span className="text-gray-500"> glucides</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">{calculatedGoals.fats}g</span>
                  <span className="text-gray-500"> lipides</span>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-gray-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Conseils pour définir les objectifs :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Les protéines doivent représenter 20-25% des calories totales</li>
              <li>Les lipides doivent représenter 25-30% des calories totales</li>
              <li>Les glucides complètent le reste des calories</li>
              <li>Buvez 30-35ml d'eau par kg de poids corporel</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedNutritionGoals;
