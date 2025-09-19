import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Target, 
  User, 
  Activity, 
  Heart, 
  Zap,
  Save,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PersonalizedNutritionGoalsProps {
  clientId: string;
  clientName: string;
  currentGoals: any;
  onSave: (goals: any) => void;
  isCoach?: boolean;
}

const PersonalizedNutritionGoals: React.FC<PersonalizedNutritionGoalsProps> = ({
  clientId,
  clientName,
  currentGoals,
  onSave,
  isCoach = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Objectifs de base
    daily_calories: currentGoals?.daily_calories?.toString() || '',
    daily_proteins: currentGoals?.daily_proteins?.toString() || '',
    daily_carbs: currentGoals?.daily_carbs?.toString() || '',
    daily_fats: currentGoals?.daily_fats?.toString() || '',
    daily_water_glasses: currentGoals?.daily_water_glasses?.toString() || '8',
    
    // Objectifs personnalisés
    weight_goal: currentGoals?.weight_goal?.toString() || '',
    body_fat_goal: currentGoals?.body_fat_goal?.toString() || '',
    muscle_mass_goal: currentGoals?.muscle_mass_goal?.toString() || '',
    
    // Préférences alimentaires
    dietary_restrictions: currentGoals?.dietary_restrictions || '',
    meal_timing: currentGoals?.meal_timing || 'regular',
    supplement_goals: currentGoals?.supplement_goals || '',
    
    // Objectifs comportementaux
    meal_prep_frequency: currentGoals?.meal_prep_frequency || 'weekly',
    photo_upload_goal: currentGoals?.photo_upload_goal?.toString() || '80',
    consistency_goal: currentGoals?.consistency_goal?.toString() || '90',
    
    // Notes personnalisées
    personal_notes: currentGoals?.personal_notes || '',
    coach_notes: currentGoals?.coach_notes || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const goalsToSave = {
      // Objectifs de base
      daily_calories: formData.daily_calories ? parseInt(formData.daily_calories) : undefined,
      daily_proteins: formData.daily_proteins ? parseFloat(formData.daily_proteins) : undefined,
      daily_carbs: formData.daily_carbs ? parseFloat(formData.daily_carbs) : undefined,
      daily_fats: formData.daily_fats ? parseFloat(formData.daily_fats) : undefined,
      daily_water_glasses: parseInt(formData.daily_water_glasses) || 8,
      
      // Objectifs personnalisés
      weight_goal: formData.weight_goal ? parseFloat(formData.weight_goal) : undefined,
      body_fat_goal: formData.body_fat_goal ? parseFloat(formData.body_fat_goal) : undefined,
      muscle_mass_goal: formData.muscle_mass_goal ? parseFloat(formData.muscle_mass_goal) : undefined,
      
      // Préférences alimentaires
      dietary_restrictions: formData.dietary_restrictions,
      meal_timing: formData.meal_timing,
      supplement_goals: formData.supplement_goals,
      
      // Objectifs comportementaux
      meal_prep_frequency: formData.meal_prep_frequency,
      photo_upload_goal: parseInt(formData.photo_upload_goal) || 80,
      consistency_goal: parseInt(formData.consistency_goal) || 90,
      
      // Notes personnalisées
      personal_notes: formData.personal_notes,
      coach_notes: formData.coach_notes
    };
    
    onSave(goalsToSave);
    setIsEditing(false);
  };

  const getGoalStatus = (current: number, target: number) => {
    if (current >= target) return { status: 'achieved', color: 'green', icon: CheckCircle };
    if (current >= target * 0.8) return { status: 'on_track', color: 'yellow', icon: AlertCircle };
    return { status: 'needs_work', color: 'red', icon: AlertCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Objectifs nutritionnels personnalisés</h2>
          <p className="text-gray-600">{clientName}</p>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Basic Nutrition Goals */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Objectifs nutritionnels de base</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Calories par jour</Label>
            {isEditing ? (
              <Input
                id="calories"
                type="number"
                value={formData.daily_calories}
                onChange={(e) => handleInputChange('daily_calories', e.target.value)}
                placeholder="2000"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.daily_calories || 'Non défini'} kcal
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="proteins">Protéines par jour (g)</Label>
            {isEditing ? (
              <Input
                id="proteins"
                type="number"
                step="0.1"
                value={formData.daily_proteins}
                onChange={(e) => handleInputChange('daily_proteins', e.target.value)}
                placeholder="150"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.daily_proteins || 'Non défini'} g
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="carbs">Glucides par jour (g)</Label>
            {isEditing ? (
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.daily_carbs}
                onChange={(e) => handleInputChange('daily_carbs', e.target.value)}
                placeholder="250"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.daily_carbs || 'Non défini'} g
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="fats">Lipides par jour (g)</Label>
            {isEditing ? (
              <Input
                id="fats"
                type="number"
                step="0.1"
                value={formData.daily_fats}
                onChange={(e) => handleInputChange('daily_fats', e.target.value)}
                placeholder="65"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.daily_fats || 'Non défini'} g
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Physical Goals */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Objectifs physiques</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="weight_goal">Poids objectif (kg)</Label>
            {isEditing ? (
              <Input
                id="weight_goal"
                type="number"
                step="0.1"
                value={formData.weight_goal}
                onChange={(e) => handleInputChange('weight_goal', e.target.value)}
                placeholder="70"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.weight_goal || 'Non défini'} kg
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="body_fat_goal">Masse grasse objectif (%)</Label>
            {isEditing ? (
              <Input
                id="body_fat_goal"
                type="number"
                step="0.1"
                value={formData.body_fat_goal}
                onChange={(e) => handleInputChange('body_fat_goal', e.target.value)}
                placeholder="15"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.body_fat_goal || 'Non défini'} %
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="muscle_mass_goal">Masse musculaire objectif (kg)</Label>
            {isEditing ? (
              <Input
                id="muscle_mass_goal"
                type="number"
                step="0.1"
                value={formData.muscle_mass_goal}
                onChange={(e) => handleInputChange('muscle_mass_goal', e.target.value)}
                placeholder="35"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.muscle_mass_goal || 'Non défini'} kg
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dietary Preferences */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">Préférences alimentaires</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
            {isEditing ? (
              <Textarea
                id="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                placeholder="Végétarien, sans gluten, allergies..."
                rows={3}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.dietary_restrictions || 'Aucune restriction'}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="meal_timing">Rythme des repas</Label>
            {isEditing ? (
              <Select value={formData.meal_timing} onValueChange={(value) => handleInputChange('meal_timing', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Régulier (3 repas/jour)</SelectItem>
                  <SelectItem value="intermittent">Jeûne intermittent</SelectItem>
                  <SelectItem value="frequent">Fréquent (5-6 repas/jour)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.meal_timing || 'Non défini'}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="supplement_goals">Objectifs de supplémentation</Label>
            {isEditing ? (
              <Textarea
                id="supplement_goals"
                value={formData.supplement_goals}
                onChange={(e) => handleInputChange('supplement_goals', e.target.value)}
                placeholder="Protéines, vitamines, minéraux..."
                rows={2}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.supplement_goals || 'Aucun objectif'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Behavioral Goals */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Objectifs comportementaux</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meal_prep_frequency">Fréquence de meal prep</Label>
            {isEditing ? (
              <Select value={formData.meal_prep_frequency} onValueChange={(value) => handleInputChange('meal_prep_frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.meal_prep_frequency || 'Non défini'}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="photo_upload_goal">Objectif de photos (%)</Label>
            {isEditing ? (
              <Input
                id="photo_upload_goal"
                type="number"
                min="0"
                max="100"
                value={formData.photo_upload_goal}
                onChange={(e) => handleInputChange('photo_upload_goal', e.target.value)}
                placeholder="80"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.photo_upload_goal || 'Non défini'} %
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="consistency_goal">Objectif de cohérence (%)</Label>
            {isEditing ? (
              <Input
                id="consistency_goal"
                type="number"
                min="0"
                max="100"
                value={formData.consistency_goal}
                onChange={(e) => handleInputChange('consistency_goal', e.target.value)}
                placeholder="90"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.consistency_goal || 'Non défini'} %
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Notes */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">Notes personnalisées</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="personal_notes">Notes personnelles</Label>
            {isEditing ? (
              <Textarea
                id="personal_notes"
                value={formData.personal_notes}
                onChange={(e) => handleInputChange('personal_notes', e.target.value)}
                placeholder="Vos notes personnelles sur vos objectifs..."
                rows={3}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">
                {currentGoals?.personal_notes || 'Aucune note'}
              </div>
            )}
          </div>
          
          {isCoach && (
            <div>
              <Label htmlFor="coach_notes">Notes du coach</Label>
              {isEditing ? (
                <Textarea
                  id="coach_notes"
                  value={formData.coach_notes}
                  onChange={(e) => handleInputChange('coach_notes', e.target.value)}
                  placeholder="Vos notes en tant que coach..."
                  rows={3}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {currentGoals?.coach_notes || 'Aucune note'}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PersonalizedNutritionGoals;
