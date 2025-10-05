import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Camera, 
  MessageSquare, 
  Target, 
  Droplets, 
  Calendar,
  BarChart3,
  Users,
  Plus
} from 'lucide-react';
import { 
  NutritionService, 
  NutritionEntry, 
  NutritionComment, 
  NutritionGoals,
  NutritionStats 
} from '../../services/nutritionService';
import { useAuth } from '@/providers/OptimizedAuthProvider';
import { ClientService } from '../../services/clientService';
import NutritionGauges from '../nutrition/NutritionGauges';
import NutritionEntryCard from '../nutrition/NutritionEntryCard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '../../hooks/use-toast';

const CoachNutritionPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const coachId = profile?.id || '';

  // Load clients when component mounts
  useEffect(() => {
    if (coachId) {
      loadClients();
    }
  }, [coachId]);

  useEffect(() => {
    if (selectedClient) {
      loadNutritionData();
    }
  }, [selectedClient, selectedDate]);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const clientsData = await ClientService.getClientsByCoach(coachId);
      setClients(clientsData);
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des clients",
        variant: "destructive"
      });
    } finally {
      setClientsLoading(false);
    }
  };

  const loadNutritionData = async () => {
    if (!selectedClient) return;

    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Load nutrition entries
      const entries = await NutritionService.getCoachNutritionEntries(coachId, selectedClient);
      const dayEntries = entries.filter(entry => 
        format(new Date(entry.created_at), 'yyyy-MM-dd') === dateStr
      );
      setNutritionEntries(dayEntries);

      // Load nutrition stats
      const stats = await NutritionService.getNutritionStats(selectedClient, dateStr);
      setNutritionStats(stats);

      // Load nutrition goals
      const goals = await NutritionService.getNutritionGoals(selectedClient);
      setNutritionGoals(goals);
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données nutritionnelles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetGoals = async (goals: Omit<NutritionGoals, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await NutritionService.createOrUpdateNutritionGoals(goals);
      await loadNutritionData();
      setIsGoalsModalOpen(false);
      toast({
        title: "Succès",
        description: "Objectifs nutritionnels mis à jour"
      });
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des objectifs",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await NutritionService.createNutritionComment({
        nutrition_entry_id: selectedEntryId,
        coach_id: coachId,
        comment: commentText
      });
      
      setCommentText('');
      setIsCommentModalOpen(false);
      await loadNutritionData();
      
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès"
      });
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du commentaire",
        variant: "destructive"
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  if (clientsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nutrition - Clients</h1>
          <p className="text-gray-600">
            Suivez l'alimentation de vos clients
          </p>
        </div>
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des clients...</p>
        </Card>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nutrition - Clients</h1>
          <p className="text-gray-600">
            Suivez l'alimentation de vos clients
          </p>
        </div>

        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sélectionnez un client</h3>
          <p className="text-gray-500 mb-4">
            {clients.length === 0 
              ? "Aucun client trouvé. Ajoutez des clients pour commencer."
              : "Choisissez un client pour voir ses données nutritionnelles"
            }
          </p>
          {clients.length > 0 && (
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full max-w-md mx-auto">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>
      </div>
    );
  }

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nutrition - {selectedClientData?.first_name} {selectedClientData?.last_name}</h1>
          <p className="text-gray-600">
            Suivi nutritionnel et recommandations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsGoalsModalOpen(true)}
          >
            <Target className="h-4 w-4 mr-2" />
            Objectifs
          </Button>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateDate('prev')}
          >
            ← Précédent
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h2>
            {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="mt-1"
              >
                Aujourd'hui
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => navigateDate('next')}
          >
            Suivant →
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Repas</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Objectifs</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          {nutritionStats && (
            <NutritionGauges stats={nutritionStats} />
          )}
        </TabsContent>

        {/* Repas */}
        <TabsContent value="meals" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : nutritionEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucun repas enregistré</p>
                <p className="text-sm">Le client n'a pas encore ajouté de repas pour cette date</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {nutritionEntries.map((entry) => (
                <NutritionEntryCard
                  key={entry.id}
                  entry={entry}
                  isCoach={true}
                  onAddComment={(entryId) => {
                    setSelectedEntryId(entryId);
                    setIsCommentModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Objectifs */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Objectifs nutritionnels</h3>
              <Button onClick={() => setIsGoalsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Modifier les objectifs
              </Button>
            </div>
            
            {nutritionGoals ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {nutritionGoals.daily_calories || 0}
                  </div>
                  <div className="text-sm text-gray-500">Calories/jour</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {nutritionGoals.daily_proteins || 0}g
                  </div>
                  <div className="text-sm text-gray-500">Protéines/jour</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {nutritionGoals.daily_carbs || 0}g
                  </div>
                  <div className="text-sm text-gray-500">Glucides/jour</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {nutritionGoals.daily_fats || 0}g
                  </div>
                  <div className="text-sm text-gray-500">Lipides/jour</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Aucun objectif défini</p>
                <Button 
                  className="mt-2" 
                  onClick={() => setIsGoalsModalOpen(true)}
                >
                  Définir des objectifs
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goals Modal */}
      {isGoalsModalOpen && (
        <GoalsModal
          isOpen={isGoalsModalOpen}
          onClose={() => setIsGoalsModalOpen(false)}
          clientId={selectedClient}
          coachId={coachId}
          currentGoals={nutritionGoals}
          onSave={handleSetGoals}
        />
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setCommentText('');
          }}
          comment={commentText}
          onCommentChange={setCommentText}
          onSave={handleAddComment}
        />
      )}
    </div>
  );
};

// Goals Modal Component
const GoalsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  coachId: string;
  currentGoals: NutritionGoals | null;
  onSave: (goals: Omit<NutritionGoals, 'id' | 'created_at' | 'updated_at'>) => void;
}> = ({ isOpen, onClose, clientId, coachId, currentGoals, onSave }) => {
  const [goals, setGoals] = useState({
    daily_calories: currentGoals?.daily_calories?.toString() || '',
    daily_proteins: currentGoals?.daily_proteins?.toString() || '',
    daily_carbs: currentGoals?.daily_carbs?.toString() || '',
    daily_fats: currentGoals?.daily_fats?.toString() || '',
    daily_water_glasses: currentGoals?.daily_water_glasses?.toString() || '8'
  });

  const handleSave = () => {
    onSave({
      client_id: clientId,
      coach_id: coachId,
      daily_calories: goals.daily_calories ? parseInt(goals.daily_calories) : undefined,
      daily_proteins: goals.daily_proteins ? parseFloat(goals.daily_proteins) : undefined,
      daily_carbs: goals.daily_carbs ? parseFloat(goals.daily_carbs) : undefined,
      daily_fats: goals.daily_fats ? parseFloat(goals.daily_fats) : undefined,
      daily_water_glasses: parseInt(goals.daily_water_glasses) || 8
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Définir les objectifs nutritionnels</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="calories">Calories par jour</Label>
            <Input
              id="calories"
              type="number"
              value={goals.daily_calories}
              onChange={(e) => setGoals(prev => ({ ...prev, daily_calories: e.target.value }))}
              placeholder="2000"
            />
          </div>
          
          <div>
            <Label htmlFor="proteins">Protéines par jour (g)</Label>
            <Input
              id="proteins"
              type="number"
              step="0.1"
              value={goals.daily_proteins}
              onChange={(e) => setGoals(prev => ({ ...prev, daily_proteins: e.target.value }))}
              placeholder="150"
            />
          </div>
          
          <div>
            <Label htmlFor="carbs">Glucides par jour (g)</Label>
            <Input
              id="carbs"
              type="number"
              step="0.1"
              value={goals.daily_carbs}
              onChange={(e) => setGoals(prev => ({ ...prev, daily_carbs: e.target.value }))}
              placeholder="250"
            />
          </div>
          
          <div>
            <Label htmlFor="fats">Lipides par jour (g)</Label>
            <Input
              id="fats"
              type="number"
              step="0.1"
              value={goals.daily_fats}
              onChange={(e) => setGoals(prev => ({ ...prev, daily_fats: e.target.value }))}
              placeholder="65"
            />
          </div>
          
          <div>
            <Label htmlFor="water">Verres d'eau par jour</Label>
            <Input
              id="water"
              type="number"
              value={goals.daily_water_glasses}
              onChange={(e) => setGoals(prev => ({ ...prev, daily_water_glasses: e.target.value }))}
              placeholder="8"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Comment Modal Component
const CommentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSave: () => void;
}> = ({ isOpen, onClose, comment, onCommentChange, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Ajouter un commentaire</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Ajoutez vos recommandations..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={!comment.trim()}>
            Ajouter
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CoachNutritionPage;
