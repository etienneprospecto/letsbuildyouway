import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { AddButton, FloatingAddButton } from '../ui/standard-buttons';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Droplets, Calendar, BarChart3 } from 'lucide-react';
import HelpTooltip from '../ui/help-tooltip';
import { NutritionService, NutritionEntry, NutritionStats } from '../../services/nutritionService';
import { useAuth } from '../../providers/AuthProvider';
// Removed useClientStore - using useAuth directly
import NutritionGauges from '../nutrition/NutritionGauges';
import AddNutritionEntryModal from '../nutrition/AddNutritionEntryModal';
import NutritionEntryCard from '../nutrition/NutritionEntryCard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '../../hooks/use-toast';

const ClientNutritionPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Pour un client, utiliser l'ID client du profil
  const clientId = profile?.role === 'client' ? profile.client_id : user?.id || '';

  useEffect(() => {
    if (clientId) {
      loadNutritionData();
    } else {
      setIsLoading(false);
    }
  }, [clientId, selectedDate]);

  // Raccourcis clavier pour navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Ne pas intercepter si on tape dans un champ
      }
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateDate('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateDate('next');
          break;
        case 'n':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setIsAddModalOpen(true);
          }
          break;
        case 't':
          event.preventDefault();
          setSelectedDate(new Date());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadNutritionData = async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Load nutrition entries
      const entries = await NutritionService.getClientNutritionEntries(clientId, dateStr);
      setNutritionEntries(entries);

      // Load nutrition stats
      const stats = await NutritionService.getNutritionStats(clientId, dateStr);
      setNutritionStats(stats);
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

  const handleAddWaterGlass = async () => {
    if (!clientId) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await NutritionService.addWaterGlass(clientId, dateStr);
      await loadNutritionData(); // Reload data
      toast({
        title: "Succès",
        description: "Verre d'eau ajouté !"
      });
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du verre d'eau",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await NutritionService.deleteNutritionEntry(entryId);
      await loadNutritionData(); // Reload data
      toast({
        title: "Succès",
        description: "Entrée supprimée avec succès"
      });
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'entrée",
        variant: "destructive"
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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

  if (!clientId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nutrition</h1>
          <p className="text-gray-600">
            Suivez votre alimentation et votre hydratation
          </p>
        </div>
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Profil non trouvé</p>
            <p className="text-sm">Veuillez vous reconnecter pour accéder à la section nutrition</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold">Nutrition</h1>
            <p className="text-gray-600">
              Suivez votre alimentation et votre hydratation
            </p>
          </div>
          <HelpTooltip
            title="Section Nutrition"
            content="Ici vous pouvez suivre tous vos repas quotidiens, voir vos progrès nutritionnels et atteindre vos objectifs fixés par votre coach."
            shortcuts={["← →", "T", "Ctrl+N"]}
            position="bottom"
          />
        </div>
        <div className="hidden md:block">
          <AddButton onClick={() => setIsAddModalOpen(true)} label="Ajouter un repas" />
        </div>
      </div>

      {/* Bouton flottant pour mobile */}
      <FloatingAddButton 
        onClick={() => setIsAddModalOpen(true)}
        className="md:hidden"
      />

      {/* Date Navigation avec raccourcis */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateDate('prev')}
            className="hover:bg-blue-100 transition-colors"
            title="Jour précédent (Flèche gauche)"
          >
            ← Précédent
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-blue-900">
              {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h2>
            {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="mt-1 text-blue-600 hover:text-blue-800"
                title="Retour à aujourd'hui (Touche T)"
              >
                Aujourd'hui
              </Button>
            )}
            <div className="text-xs text-blue-600 mt-1">
              ← → pour naviguer • T pour aujourd'hui • Ctrl+N pour ajouter
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigateDate('next')}
            className="hover:bg-blue-100 transition-colors"
            title="Jour suivant (Flèche droite)"
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
          <TabsTrigger value="hydration" className="flex items-center space-x-2">
            <Droplets className="h-4 w-4" />
            <span>Hydratation</span>
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
          {nutritionEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucun repas enregistré</p>
                <p className="text-sm">Ajoutez votre premier repas pour commencer le suivi</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {nutritionEntries.map((entry) => (
                <NutritionEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Hydratation */}
        <TabsContent value="hydration" className="space-y-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Hydratation du jour</h3>
                <p className="text-gray-600">
                  {nutritionStats?.waterGlasses || 0} verres d'eau consommés
                </p>
              </div>
              
              {nutritionStats?.goals && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {nutritionStats.waterGlasses} / {nutritionStats.goals.daily_water_glasses}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((nutritionStats.waterGlasses / nutritionStats.goals.daily_water_glasses) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {nutritionStats.progress.water.toFixed(1)}% de l'objectif
                  </p>
                </div>
              )}

              <Button onClick={handleAddWaterGlass} variant="default" className="w-full">
                <Droplets className="h-4 w-4 mr-2" />
                Ajouter un verre d'eau
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Nutrition Entry Modal */}
      <AddNutritionEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clientId={clientId}
        coachId={profile?.coach_id || user?.id || ''}
        onSuccess={loadNutritionData}
      />
    </div>
  );
};

export default ClientNutritionPage;
