import { useState, useEffect, useCallback } from 'react';
import { NutritionService, NutritionEntry, NutritionStats, NutritionGoals } from '../services/nutritionService';
import { useToast } from './use-toast';

export const useNutrition = (clientId: string, date?: string) => {
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const targetDate = date || new Date().toISOString().split('T')[0];

  const loadNutritionData = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load nutrition entries
      const entries = await NutritionService.getClientNutritionEntries(clientId, targetDate);
      setNutritionEntries(entries);

      // Load nutrition stats
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      // Load nutrition goals
      const goals = await NutritionService.getNutritionGoals(clientId);
      setNutritionGoals(goals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données nutritionnelles';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [clientId, targetDate, toast]);

  const addNutritionEntry = useCallback(async (entry: Omit<NutritionEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEntry = await NutritionService.createNutritionEntry(entry);
      setNutritionEntries(prev => [newEntry, ...prev]);
      
      // Reload stats to update gauges
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      toast({
        title: "Succès",
        description: "Entrée nutritionnelle ajoutée avec succès"
      });

      return newEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'entrée';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [clientId, targetDate, toast]);

  const updateNutritionEntry = useCallback(async (id: string, updates: Partial<NutritionEntry>) => {
    try {
      const updatedEntry = await NutritionService.updateNutritionEntry(id, updates);
      setNutritionEntries(prev => 
        prev.map(entry => entry.id === id ? updatedEntry : entry)
      );

      // Reload stats to update gauges
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      toast({
        title: "Succès",
        description: "Entrée nutritionnelle mise à jour"
      });

      return updatedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [clientId, targetDate, toast]);

  const deleteNutritionEntry = useCallback(async (id: string) => {
    try {
      await NutritionService.deleteNutritionEntry(id);
      setNutritionEntries(prev => prev.filter(entry => entry.id !== id));

      // Reload stats to update gauges
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      toast({
        title: "Succès",
        description: "Entrée nutritionnelle supprimée"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [clientId, targetDate, toast]);

  const addWaterGlass = useCallback(async () => {
    try {
      await NutritionService.addWaterGlass(clientId, targetDate);
      
      // Reload stats to update gauges
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      toast({
        title: "Succès",
        description: "Verre d'eau ajouté !"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du verre d\'eau';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [clientId, targetDate, toast]);

  const updateNutritionGoals = useCallback(async (goals: Omit<NutritionGoals, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const updatedGoals = await NutritionService.createOrUpdateNutritionGoals(goals);
      setNutritionGoals(updatedGoals);

      // Reload stats to update gauges with new goals
      const stats = await NutritionService.getNutritionStats(clientId, targetDate);
      setNutritionStats(stats);

      toast({
        title: "Succès",
        description: "Objectifs nutritionnels mis à jour"
      });

      return updatedGoals;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des objectifs';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [clientId, targetDate, toast]);

  useEffect(() => {
    loadNutritionData();
  }, [loadNutritionData]);

  return {
    nutritionEntries,
    nutritionStats,
    nutritionGoals,
    isLoading,
    error,
    loadNutritionData,
    addNutritionEntry,
    updateNutritionEntry,
    deleteNutritionEntry,
    addWaterGlass,
    updateNutritionGoals
  };
};
