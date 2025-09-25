import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { Camera, X, Upload } from 'lucide-react';
import { NutritionService } from '../../services/nutritionService';
import { useToast } from '../../hooks/use-toast';

interface AddNutritionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  coachId: string;
  onSuccess: () => void;
}

const AddNutritionEntryModal: React.FC<AddNutritionEntryModalProps> = ({
  isOpen,
  onClose,
  clientId,
  coachId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    meal_type: '' as 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation' | '',
    description: '',
    calories: '',
    proteins: '',
    carbs: '',
    fats: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mealTypes = [
    { value: 'petit-dejeuner', label: 'Petit-déjeuner' },
    { value: 'dejeuner', label: 'Déjeuner' },
    { value: 'diner', label: 'Dîner' },
    { value: 'collation', label: 'Collation' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.meal_type) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de repas",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl: string | undefined;

      // Upload photo if provided
      if (photo) {
        photoUrl = await NutritionService.uploadNutritionPhoto(photo, clientId);
      }

      // Create nutrition entry
      await NutritionService.createNutritionEntry({
        client_id: clientId,
        coach_id: coachId,
        meal_type: formData.meal_type,
        photo_url: photoUrl,
        description: formData.description || undefined,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        proteins: formData.proteins ? parseFloat(formData.proteins) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fats: formData.fats ? parseFloat(formData.fats) : undefined
      });

      toast({
        title: "Succès",
        description: "Entrée nutritionnelle ajoutée avec succès"
      });

      // Reset form
      setFormData({
        meal_type: '',
        description: '',
        calories: '',
        proteins: '',
        carbs: '',
        fats: ''
      });
      setPhoto(null);
      setPhotoPreview(null);
      onSuccess();
      onClose();
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'entrée nutritionnelle",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une entrée nutritionnelle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de repas */}
          <div className="space-y-2">
            <Label htmlFor="meal_type">Type de repas *</Label>
            <Select
              value={formData.meal_type}
              onValueChange={(value) => handleInputChange('meal_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de repas" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label>Photo du repas (optionnel)</Label>
            {photoPreview ? (
              <Card className="relative p-4">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Cliquer pour ajouter une photo</span>
                  </div>
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre repas..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Macros nutritionnels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteins">Protéines (g)</Label>
              <Input
                id="proteins"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.proteins}
                onChange={(e) => handleInputChange('proteins', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Glucides (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Lipides (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.fats}
                onChange={(e) => handleInputChange('fats', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNutritionEntryModal;
