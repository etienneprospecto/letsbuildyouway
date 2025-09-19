import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Users, 
  Camera, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplets
} from 'lucide-react';
import { NutritionService } from '../../services/nutritionService';
import { ClientService } from '../../services/clientService';
import { useToast } from '../../hooks/use-toast';

interface NutritionDashboardProps {
  coachId: string;
}

interface ClientNutritionSummary {
  clientId: string;
  clientName: string;
  totalEntries: number;
  totalPhotos: number;
  waterGlasses: number;
  goalAchievement: number;
  lastEntry: string | null;
  needsAttention: boolean;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ coachId }) => {
  const [clientSummaries, setClientSummaries] = useState<ClientNutritionSummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (coachId) {
      loadClients();
    }
  }, [coachId]);

  useEffect(() => {
    if (clients.length > 0) {
      loadClientSummaries();
    }
  }, [clients, selectedPeriod]);

  const loadClients = async () => {
    try {
      const clientsData = await ClientService.getClientsByCoach(coachId);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des clients",
        variant: "destructive"
      });
    }
  };

  const loadClientSummaries = async () => {
    if (!clients.length) return;

    setIsLoading(true);
    try {
      const summaries: ClientNutritionSummary[] = [];

      for (const client of clients) {
        // Get nutrition entries for the period
        const entries = await NutritionService.getCoachNutritionEntries(coachId, client.id);
        const periodDays = parseInt(selectedPeriod);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - periodDays);
        
        const recentEntries = entries.filter(entry => 
          new Date(entry.created_at) >= cutoffDate
        );

        // Get nutrition stats
        const stats = await NutritionService.getNutritionStats(client.id);
        
        // Calculate summary data
        const totalEntries = recentEntries.length;
        const totalPhotos = recentEntries.filter(entry => entry.photo_url).length;
        const waterGlasses = stats.waterGlasses;
        const goalAchievement = stats.goals ? 
          (stats.progress.calories + stats.progress.proteins + stats.progress.carbs + stats.progress.fats + stats.progress.water) / 5 : 0;
        
        const lastEntry = recentEntries.length > 0 ? recentEntries[0].created_at : null;
        const needsAttention = goalAchievement < 60 || totalEntries === 0;

        summaries.push({
          clientId: client.id,
          clientName: `${client.first_name} ${client.last_name}`,
          totalEntries,
          totalPhotos,
          waterGlasses,
          goalAchievement,
          lastEntry,
          needsAttention
        });
      }

      setClientSummaries(summaries);
    } catch (error) {
      console.error('Error loading client summaries:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données nutritionnelles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 80) return 'bg-green-100 text-green-800';
    if (achievement >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAchievementLabel = (achievement: number) => {
    if (achievement >= 80) return 'Excellent';
    if (achievement >= 60) return 'Bon';
    return 'À améliorer';
  };

  const formatLastEntry = (lastEntry: string | null) => {
    if (!lastEntry) return 'Aucune entrée';
    
    const date = new Date(lastEntry);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffHours < 48) return 'Hier';
    return `Il y a ${Math.floor(diffHours / 24)} jours`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Nutrition</h1>
          <p className="text-gray-600">Vue d'ensemble du suivi nutritionnel de vos clients</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="14">14 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{clients.length}</div>
              <div className="text-sm text-gray-500">Clients actifs</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                {clientSummaries.reduce((sum, client) => sum + client.totalPhotos, 0)}
              </div>
              <div className="text-sm text-gray-500">Photos de repas</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">
                {Math.round(clientSummaries.reduce((sum, client) => sum + client.goalAchievement, 0) / clientSummaries.length) || 0}%
              </div>
              <div className="text-sm text-gray-500">Objectifs moyens</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">
                {clientSummaries.filter(client => client.needsAttention).length}
              </div>
              <div className="text-sm text-gray-500">Besoin d'attention</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Clients List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Suivi par client</h2>
        
        {clientSummaries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Aucun client avec des données nutritionnelles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientSummaries.map((client) => (
              <div
                key={client.clientId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {client.clientName.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{client.clientName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{client.totalEntries} entrées</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Camera className="h-4 w-4" />
                        <span>{client.totalPhotos} photos</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Droplets className="h-4 w-4" />
                        <span>{client.waterGlasses} verres</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Dernière entrée</div>
                    <div className="text-sm font-medium">
                      {formatLastEntry(client.lastEntry)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Objectifs</div>
                    <Badge className={getAchievementColor(client.goalAchievement)}>
                      {getAchievementLabel(client.goalAchievement)}
                    </Badge>
                  </div>

                  {client.needsAttention && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Attention</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Définir des objectifs
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Voir les tendances
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marquer comme lu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NutritionDashboard;
