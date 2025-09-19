import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { NutritionEntry, NutritionComment } from '../../services/nutritionService';
import { Clock, Camera, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NutritionEntryCardProps {
  entry: NutritionEntry;
  comments?: NutritionComment[];
  isCoach?: boolean;
  onEdit?: (entry: NutritionEntry) => void;
  onDelete?: (entryId: string) => void;
  onAddComment?: (entryId: string) => void;
}

const NutritionEntryCard: React.FC<NutritionEntryCardProps> = ({
  entry,
  comments = [],
  isCoach = false,
  onEdit,
  onDelete,
  onAddComment
}) => {
  const getMealTypeLabel = (type: string) => {
    const labels = {
      'petit-dejeuner': 'Petit-déjeuner',
      'dejeuner': 'Déjeuner',
      'diner': 'Dîner',
      'collation': 'Collation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getMealTypeColor = (type: string) => {
    const colors = {
      'petit-dejeuner': 'bg-orange-100 text-orange-800',
      'dejeuner': 'bg-blue-100 text-blue-800',
      'diner': 'bg-purple-100 text-purple-800',
      'collation': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Badge className={getMealTypeColor(entry.meal_type)}>
            {getMealTypeLabel(entry.meal_type)}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(entry.created_at)}
          </div>
        </div>
        {!isCoach && (
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photo */}
      {entry.photo_url && (
        <div className="relative">
          <img
            src={entry.photo_url}
            alt="Photo du repas"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Camera className="h-3 w-3" />
              <span>Photo</span>
            </Badge>
          </div>
        </div>
      )}

      {/* Description */}
      {entry.description && (
        <div>
          <p className="text-sm text-gray-700">{entry.description}</p>
        </div>
      )}

      {/* Macros nutritionnels */}
      {(entry.calories || entry.proteins || entry.carbs || entry.fats) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {entry.calories && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{entry.calories}</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
          )}
          {entry.proteins && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{entry.proteins}g</div>
              <div className="text-xs text-gray-500">Protéines</div>
            </div>
          )}
          {entry.carbs && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{entry.carbs}g</div>
              <div className="text-xs text-gray-500">Glucides</div>
            </div>
          )}
          {entry.fats && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{entry.fats}g</div>
              <div className="text-xs text-gray-500">Lipides</div>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            <span>Commentaires du coach ({comments.length})</span>
          </div>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-blue-50 rounded-lg text-sm"
              >
                <p>{comment.comment}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(comment.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add comment button for coach */}
      {isCoach && onAddComment && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddComment(entry.id)}
          className="w-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ajouter un commentaire
        </Button>
      )}

      {/* Date */}
      <div className="text-xs text-gray-400 text-center">
        {formatDate(entry.created_at)}
      </div>
    </Card>
  );
};

export default NutritionEntryCard;
