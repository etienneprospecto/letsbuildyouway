import React, { useState, useEffect } from 'react';
import { Trophy, Users, TrendingUp, Plus, Award, Star, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../providers/AuthProvider';
import { trophyService } from '../../services/trophyService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientTrophyStats {
  clientId: string;
  clientName: string;
  totalTrophies: number;
  unlockedTrophies: number;
  recentTrophies: any[];
  completionPercentage: number;
}

export const CoachTrophiesPage: React.FC = () => {
  const { user } = useAuth();
  const [clientsTrophies, setClientsTrophies] = useState<any[]>([]);
  const [clientsStats, setClientsStats] = useState<ClientTrophyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // État pour la création de trophée personnalisé
  const [newTrophy, setNewTrophy] = useState({
    name: '',
    description: '',
    icon_url: '🏆',
    criteria: {
      type: 'custom',
      target: 1
    }
  });

  useEffect(() => {
    if (user) {
      loadTrophyData();
    }
  }, [user]);

  const loadTrophyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les trophées récents de tous les clients
      const recentTrophies = await trophyService.getCoachClientsTrophies(user.id);
      setClientsTrophies(recentTrophies);

      // TODO: Charger les statistiques par client
      // setClientsStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données trophées:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrophy = async () => {
    if (!user) return;

    try {
      await trophyService.createCustomTrophy({
        ...newTrophy,
        criteria: JSON.stringify(newTrophy.criteria)
      });

      setShowCreateModal(false);
      setNewTrophy({
        name: '',
        description: '',
        icon_url: '🏆',
        criteria: { type: 'custom', target: 1 }
      });
      
      await loadTrophyData();
    } catch (error) {
      console.error('Erreur lors de la création du trophée:', error);
    }
  };

  const getTrophyTypeIcon = (type: string) => {
    switch (type) {
      case 'sessions_completed': return <Target className="w-4 h-4" />;
      case 'weight_progress': return <TrendingUp className="w-4 h-4" />;
      case 'nutrition_entries': return <Award className="w-4 h-4" />;
      case 'appointments_completed': return <Calendar className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getEngagementColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Trophées Clients
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez l'engagement et les accomplissements de vos clients
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Créer un trophée
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trophées débloqués</p>
                <p className="text-2xl font-bold text-blue-600">
                  {clientsTrophies.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-green-600">
                  {clientsTrophies.filter(t => {
                    const earnedDate = new Date(t.earned_date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return earnedDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients actifs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(clientsTrophies.map(t => t.profiles?.id)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'engagement</p>
                <p className="text-2xl font-bold text-orange-600">85%</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="custom">Personnalisés</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trophées récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientsTrophies.slice(0, 10).map((trophy) => (
                  <div key={trophy.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{trophy.trophies?.icon_url || '🏆'}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {trophy.profiles?.first_name} {trophy.profiles?.last_name}
                        </span>
                        <Badge variant="outline">
                          {trophy.trophies?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {trophy.trophies?.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {trophy.earned_date && format(new Date(trophy.earned_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {trophy.earned_date && format(new Date(trophy.earned_date), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}

                {clientsTrophies.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun trophée débloqué
                    </h3>
                    <p className="text-gray-600">
                      Vos clients n'ont pas encore débloqué de trophées.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trophées récents */}
        <TabsContent value="recent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clientsTrophies.filter(t => {
              const earnedDate = new Date(t.earned_date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return earnedDate >= weekAgo;
            }).map((trophy) => (
              <Card key={trophy.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{trophy.trophies?.icon_url || '🏆'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {trophy.trophies?.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {trophy.trophies?.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {trophy.profiles?.first_name} {trophy.profiles?.last_name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {trophy.earned_date && format(new Date(trophy.earned_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trophées les plus populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* TODO: Calculer les trophées les plus obtenus */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Premier Pas</span>
                    <Badge>15 fois</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Première Séance</span>
                    <Badge>12 fois</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Première Entrée</span>
                    <Badge>8 fois</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact sur l'engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rétention après 1er trophée</span>
                    <span className="font-semibold text-green-600">+25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessions par semaine</span>
                    <span className="font-semibold text-blue-600">+40%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages au coach</span>
                    <span className="font-semibold text-purple-600">+60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trophées personnalisés */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer des défis personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Créez des trophées spécifiques à vos clients pour les motiver davantage.
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau trophée personnalisé
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de création de trophée */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un trophée personnalisé</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du trophée</Label>
              <Input
                id="name"
                value={newTrophy.name}
                onChange={(e) => setNewTrophy(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Défi 30 jours"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTrophy.description}
                onChange={(e) => setNewTrophy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez l'objectif du trophée..."
              />
            </div>

            <div>
              <Label htmlFor="icon">Icône (emoji)</Label>
              <Input
                id="icon"
                value={newTrophy.icon_url}
                onChange={(e) => setNewTrophy(prev => ({ ...prev, icon_url: e.target.value }))}
                placeholder="🏆"
              />
            </div>

            <div>
              <Label htmlFor="type">Type de critère</Label>
              <Select
                value={newTrophy.criteria.type}
                onValueChange={(value) => setNewTrophy(prev => ({ 
                  ...prev, 
                  criteria: { ...prev.criteria, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions_completed">Séances terminées</SelectItem>
                  <SelectItem value="weight_progress">Progression poids</SelectItem>
                  <SelectItem value="nutrition_entries">Entrées nutrition</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target">Objectif</Label>
              <Input
                id="target"
                type="number"
                value={newTrophy.criteria.target}
                onChange={(e) => setNewTrophy(prev => ({ 
                  ...prev, 
                  criteria: { ...prev.criteria, target: parseInt(e.target.value) || 1 }
                }))}
                min="1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleCreateTrophy} className="flex-1">
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
