import { useState, useEffect } from 'react';
import { trophyService, TrophyWithProgress, TrophyStats } from '../services/trophyService';
import { useAuth } from '../providers/AuthProvider';

export const useTrophies = () => {
  const { user } = useAuth();
  const [trophies, setTrophies] = useState<TrophyWithProgress[]>([]);
  const [stats, setStats] = useState<TrophyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrophies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Vérifier les nouveaux trophées d'abord
      await trophyService.checkAndUnlockTrophies(user.id);

      // Charger toutes les données
      const [trophiesData, statsData] = await Promise.all([
        trophyService.getUserTrophies(user.id),
        trophyService.getUserTrophyStats(user.id)
      ]);

      setTrophies(trophiesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du chargement des trophées:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewTrophies = async () => {
    if (!user) return [];

    try {
      const newTrophies = await trophyService.checkAndUnlockTrophies(user.id);
      if (newTrophies.length > 0) {
        // Recharger les données pour mettre à jour l'interface
        await loadTrophies();
      }
      return newTrophies;
    } catch (err) {
      console.error('Erreur lors de la vérification des nouveaux trophées:', err);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadTrophies();
    }
  }, [user]);

  return {
    trophies,
    stats,
    loading,
    error,
    refetch: loadTrophies,
    checkForNewTrophies
  };
};

export default useTrophies;
