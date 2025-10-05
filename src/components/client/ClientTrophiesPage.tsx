import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Target, TrendingUp, Calendar, MessageSquare, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useAuth } from '@/providers/OptimizedAuthProvider';
import { trophyService, TrophyWithProgress, TrophyStats, TrophyCategory } from '../../services/trophyService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ClientTrophiesPage: React.FC = () => {
  const { user } = useAuth();
  const [trophies, setTrophies] = useState<TrophyWithProgress[]>([]);
  const [categories, setCategories] = useState<TrophyCategory[]>([]);
  const [stats, setStats] = useState<TrophyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnimation, setShowAnimation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTrophyData();
    }
  }, [user]);

  const loadTrophyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Vérifier les nouveaux trophées
      const newTrophies = await trophyService.checkAndUnlockTrophies(user.id);
      
      // Afficher animation pour les nouveaux trophées
      if (newTrophies.length > 0) {
        setShowAnimation(newTrophies[0].trophy_id);
        setTimeout(() => setShowAnimation(null), 3000);
      }

      // Charger toutes les données
      const [trophiesData, categoriesData, statsData] = await Promise.all([
        trophyService.getUserTrophies(user.id),
        trophyService.getUserTrophiesByCategory(user.id),
        trophyService.getUserTrophyStats(user.id)
      ]);

      setTrophies(trophiesData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'assiduité': return <Calendar className="w-5 h-5" />;
      case 'progression': return <TrendingUp className="w-5 h-5" />;
      case 'entraînement': return <Target className="w-5 h-5" />;
      case 'nutrition': return <Utensils className="w-5 h-5" />;
      case 'interaction': return <MessageSquare className="w-5 h-5" />;
      case 'rendez-vous': return <Calendar className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getTrophyRarity = (trophyName: string) => {
    if (trophyName.includes('Or') || trophyName.includes('Grande')) return 'legendary';
    if (trophyName.includes('Argent') || trophyName.includes('Expert')) return 'epic';
    if (trophyName.includes('Bronze') || trophyName.includes('Suivi')) return 'rare';
    return 'common';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-200';
      case 'epic': return 'border-purple-400 shadow-purple-200';
      case 'rare': return 'border-blue-400 shadow-blue-200';
      default: return 'border-gray-300';
    }
  };

  const filteredTrophies = selectedCategory === 'all' 
    ? trophies 
    : categories.find(c => c.name.toLowerCase() === selectedCategory)?.trophies || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Mes Trophées
        </h1>
        <p className="text-gray-600 mt-2">
          Célébrez vos accomplissements et suivez votre progression
        </p>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trophées débloqués</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.unlocked_trophies}/{stats.total_trophies}
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
                  <p className="text-sm text-gray-600">Progression</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completion_percentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Récents</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recent_trophies.length}</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Progress value={stats.completion_percentage} className="w-16 h-16" />
                  <p className="text-xs text-gray-600 mt-2">Complétion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres par catégorie */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.name.toLowerCase()} value={category.name.toLowerCase()}>
              <span className="flex items-center gap-1">
                {getCategoryIcon(category.name)}
                <span className="hidden sm:inline">{category.name}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Grille des trophées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTrophies.map((trophy) => {
              const rarity = getTrophyRarity(trophy.name);
              const isUnlocked = trophy.is_unlocked;
              const isAnimating = showAnimation === trophy.id;

              return (
                <Card
                  key={trophy.id}
                  className={`
                    relative overflow-hidden transition-all duration-300 hover:scale-105
                    ${isUnlocked 
                      ? `border-2 ${getRarityBorder(rarity)} shadow-lg` 
                      : 'border border-gray-200 dark:border-gray-700 opacity-60'
                    }
                    ${isAnimating ? 'animate-pulse ring-4 ring-yellow-400' : ''}
                  `}
                >
                  {/* Fond dégradé pour les trophées débloqués */}
                  {isUnlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(rarity)} opacity-10`} />
                  )}

                  <CardContent className="p-4 relative">
                    <div className="text-center">
                      {/* Icône du trophée */}
                      <div className={`
                        text-4xl mb-2 relative
                        ${isUnlocked ? '' : 'grayscale'}
                      `}>
                        {trophy.icon_url}
                        {isUnlocked && (
                          <div className="absolute -top-1 -right-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Nom du trophée */}
                      <h3 className={`
                        font-semibold mb-1
                        ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {trophy.name}
                      </h3>

                      {/* Description */}
                      <p className={`
                        text-xs mb-3
                        ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}
                      `}>
                        {trophy.description}
                      </p>

                      {/* Badge de rareté pour les trophées débloqués */}
                      {isUnlocked && (
                        <Badge 
                          variant="outline" 
                          className={`mb-2 ${getRarityBorder(rarity)}`}
                        >
                          {rarity === 'legendary' && '🏆 Légendaire'}
                          {rarity === 'epic' && '💜 Épique'}
                          {rarity === 'rare' && '💎 Rare'}
                          {rarity === 'common' && '⭐ Commun'}
                        </Badge>
                      )}

                      {/* Date de déverrouillage */}
                      {isUnlocked && trophy.unlocked_date && (
                        <p className="text-xs text-green-600">
                          Débloqué le {format(new Date(trophy.unlocked_date), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      )}

                      {/* Barre de progression pour les trophées verrouillés */}
                      {!isUnlocked && trophy.progress_percentage > 0 && (
                        <div className="mt-2">
                          <Progress value={trophy.progress_percentage} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {trophy.current_value}/{trophy.target_value}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Effet de brillance pour les trophées débloqués */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 translate-x-full hover:translate-x-0 transition-all duration-700" />
                  )}
                </Card>
              );
            })}
          </div>

          {/* Message si aucun trophée dans la catégorie */}
          {filteredTrophies.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun trophée dans cette catégorie
              </h3>
              <p className="text-gray-600">
                Continuez vos efforts pour débloquer de nouveaux trophées !
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Section des trophées récents */}
      {stats && stats.recent_trophies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Trophées récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_trophies.slice(0, 3).map((userTrophy) => (
                <div key={userTrophy.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <p className="font-medium">Nouveau trophée débloqué !</p>
                    <p className="text-sm text-gray-600">
                      {userTrophy.earned_date && format(new Date(userTrophy.earned_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Partager 🎉
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animation de nouveau trophée */}
      {showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4 animate-bounce">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Nouveau Trophée !
            </h2>
            <p className="text-gray-600 mb-4">
              Félicitations ! Vous avez débloqué un nouveau trophée.
            </p>
            <Button onClick={() => setShowAnimation(null)}>
              Super ! 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
