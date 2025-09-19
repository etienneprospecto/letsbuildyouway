import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Heart, 
  Activity,
  Award,
  Medal,
  Crown,
  Flame,
  Shield,
  Sword,
  Gem,
  Coins,
  Gift,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  Sparkles,
  Gamepad2,
  Users,
  MessageSquare,
  Share2
} from 'lucide-react';

interface GamifiedNutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'nutrition' | 'consistency' | 'improvement' | 'social';
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  rewards: {
    points: number;
    coins: number;
    items?: string[];
  };
  requirements: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
    water?: number;
    days?: number;
  };
  completed: boolean;
  progress: number;
  maxProgress: number;
  expiresAt?: string;
}

interface Level {
  level: number;
  title: string;
  pointsRequired: number;
  currentPoints: number;
  rewards: string[];
  unlocked: boolean;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  rank: number;
  streak: number;
}

const GamifiedNutritionGoals: React.FC<GamifiedNutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [userStats, setUserStats] = useState({
    level: 5,
    points: 1250,
    coins: 340,
    streak: 7,
    totalDays: 45,
    achievements: 12,
    rank: 3
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements' | 'quests' | 'leaderboard'>('goals');

  useEffect(() => {
    initializeAchievements();
    initializeQuests();
    initializeLevels();
    initializeLeaderboard();
  }, []);

  const initializeAchievements = () => {
    const achievements: Achievement[] = [
      {
        id: 'first-meal',
        title: 'Premier repas',
        description: 'Ajoutez votre premier repas',
        icon: Target,
        points: 10,
        rarity: 'common',
        unlocked: true,
        unlockedAt: '2024-01-15',
        progress: 1,
        maxProgress: 1,
        category: 'nutrition'
      },
      {
        id: 'protein-master',
        title: 'Maître des protéines',
        description: 'Atteignez votre objectif protéique 7 jours de suite',
        icon: Zap,
        points: 50,
        rarity: 'rare',
        unlocked: false,
        progress: 5,
        maxProgress: 7,
        category: 'consistency'
      },
      {
        id: 'hydration-hero',
        title: 'Héros de l\'hydratation',
        description: 'Buvez 8 verres d\'eau par jour pendant 30 jours',
        icon: Heart,
        points: 100,
        rarity: 'epic',
        unlocked: false,
        progress: 23,
        maxProgress: 30,
        category: 'consistency'
      },
      {
        id: 'macro-balancer',
        title: 'Équilibreur de macros',
        description: 'Atteignez tous vos objectifs macro pendant 14 jours',
        icon: Activity,
        points: 200,
        rarity: 'legendary',
        unlocked: false,
        progress: 8,
        maxProgress: 14,
        category: 'improvement'
      },
      {
        id: 'streak-master',
        title: 'Maître de la série',
        description: 'Maintenez une série de 100 jours',
        icon: Flame,
        points: 500,
        rarity: 'legendary',
        unlocked: false,
        progress: 45,
        maxProgress: 100,
        category: 'consistency'
      },
      {
        id: 'social-sharer',
        title: 'Partageur social',
        description: 'Partagez 10 repas avec votre coach',
        icon: Share2,
        points: 30,
        rarity: 'rare',
        unlocked: false,
        progress: 7,
        maxProgress: 10,
        category: 'social'
      }
    ];

    setAchievements(achievements);
  };

  const initializeQuests = () => {
    const quests: Quest[] = [
      {
        id: 'daily-macro',
        title: 'Objectif macro quotidien',
        description: 'Atteignez tous vos objectifs macro aujourd\'hui',
        type: 'daily',
        rewards: { points: 25, coins: 10 },
        requirements: {
          calories: 2000,
          proteins: 150,
          carbs: 250,
          fats: 70,
          water: 8
        },
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'weekly-consistency',
        title: 'Cohérence hebdomadaire',
        description: 'Atteignez vos objectifs 5 jours cette semaine',
        type: 'weekly',
        rewards: { points: 100, coins: 50, items: ['Badge de cohérence'] },
        requirements: { days: 5 },
        completed: false,
        progress: 3,
        maxProgress: 5,
        expiresAt: '2024-01-28'
      },
      {
        id: 'protein-challenge',
        title: 'Défi protéines',
        description: 'Dépassez votre objectif protéique de 20g',
        type: 'special',
        rewards: { points: 75, coins: 30, items: ['Titre "Protéine Power"'] },
        requirements: { proteins: 170 },
        completed: false,
        progress: 0,
        maxProgress: 1
      }
    ];

    setQuests(quests);
  };

  const initializeLevels = () => {
    const levels: Level[] = [
      {
        level: 1,
        title: 'Débutant',
        pointsRequired: 0,
        currentPoints: 1250,
        rewards: ['Accès aux quêtes quotidiennes'],
        unlocked: true
      },
      {
        level: 2,
        title: 'Apprenti',
        pointsRequired: 100,
        currentPoints: 1250,
        rewards: ['Badge de niveau', 'Coins bonus'],
        unlocked: true
      },
      {
        level: 3,
        title: 'Élève',
        pointsRequired: 300,
        currentPoints: 1250,
        rewards: ['Accès aux quêtes hebdomadaires'],
        unlocked: true
      },
      {
        level: 4,
        title: 'Pratiquant',
        pointsRequired: 600,
        currentPoints: 1250,
        rewards: ['Thème personnalisé'],
        unlocked: true
      },
      {
        level: 5,
        title: 'Expert',
        pointsRequired: 1000,
        currentPoints: 1250,
        rewards: ['Accès aux quêtes spéciales'],
        unlocked: true
      },
      {
        level: 6,
        title: 'Maître',
        pointsRequired: 1500,
        currentPoints: 1250,
        rewards: ['Titre exclusif', 'Avatar premium'],
        unlocked: false
      },
      {
        level: 7,
        title: 'Légende',
        pointsRequired: 2500,
        currentPoints: 1250,
        rewards: ['Crown dorée', 'Accès VIP'],
        unlocked: false
      }
    ];

    setLevels(levels);
  };

  const initializeLeaderboard = () => {
    const leaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Marie Dubois',
        avatar: 'MD',
        points: 2450,
        level: 7,
        rank: 1,
        streak: 45
      },
      {
        id: '2',
        name: 'Pierre Martin',
        avatar: 'PM',
        points: 2100,
        level: 6,
        rank: 2,
        streak: 32
      },
      {
        id: '3',
        name: 'Sophie Laurent',
        avatar: 'SL',
        points: 1850,
        level: 6,
        rank: 3,
        streak: 28
      },
      {
        id: '4',
        name: 'Client Actuel',
        avatar: 'CA',
        points: 1250,
        level: 5,
        rank: 4,
        streak: 7
      },
      {
        id: '5',
        name: 'Lucas Moreau',
        avatar: 'LM',
        points: 1100,
        level: 5,
        rank: 5,
        streak: 15
      }
    ];

    setLeaderboard(leaderboard);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'epic':
        return 'text-purple-600 bg-purple-100';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Target className="h-4 w-4" />;
      case 'rare':
        return <Star className="h-4 w-4" />;
      case 'epic':
        return <Gem className="h-4 w-4" />;
      case 'legendary':
        return <Crown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'special':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const completeQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    
    setQuests(prev =>
      prev.map(q =>
        q.id === questId
          ? { ...q, completed: true, progress: q.maxProgress }
          : q
      )
    );
    
    // Ajouter les récompenses
    setUserStats(prev => ({
      ...prev,
      points: prev.points + quest.rewards.points,
      coins: prev.coins + quest.rewards.coins
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-purple-600" />
            <span>Objectifs nutritionnels gamifiés</span>
          </h2>
          <p className="text-gray-600">Transformez votre nutrition en aventure !</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">{userStats.points} pts</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">{userStats.coins}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">{userStats.streak} jours</span>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
            <div className="text-sm text-gray-600">Niveau</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userStats.points}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{userStats.coins}</div>
            <div className="text-sm text-gray-600">Coins</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
            <div className="text-sm text-gray-600">Série</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'goals', label: 'Objectifs', icon: Target },
          { id: 'achievements', label: 'Succès', icon: Trophy },
          { id: 'quests', label: 'Quêtes', icon: Sword },
          { id: 'leaderboard', label: 'Classement', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Objectifs quotidiens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Calories', current: 1200, target: 2000, icon: Zap, color: 'orange' },
                { name: 'Protéines', current: 80, target: 150, icon: Target, color: 'blue' },
                { name: 'Glucides', current: 120, target: 250, icon: Activity, color: 'green' },
                { name: 'Lipides', current: 45, target: 70, icon: Heart, color: 'purple' }
              ].map((goal) => {
                const Icon = goal.icon;
                const progress = (goal.current / goal.target) * 100;
                
                return (
                  <div key={goal.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className={`h-5 w-5 text-${goal.color}-600`} />
                      <span className="font-medium">{goal.name}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.current}</span>
                        <span className="text-gray-500">/ {goal.target}</span>
                      </div>
                      
                      <Progress value={progress} className="h-2" />
                      
                      <div className="text-xs text-gray-500">
                        {progress.toFixed(1)}% complété
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <Card key={achievement.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        {achievement.unlocked ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                          <span className="font-medium">{achievement.points} pts</span>
                        </div>
                        
                        <Progress value={progress} className="h-1" />
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {getRarityIcon(achievement.rarity)}
                            <span className="ml-1 capitalize">{achievement.rarity}</span>
                          </Badge>
                          
                          {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => {
              const progress = (quest.progress / quest.maxProgress) * 100;
              
              return (
                <Card key={quest.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Sword className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium">{quest.title}</h4>
                    </div>
                    
                    <Badge className={getQuestTypeColor(quest.type)}>
                      {quest.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span>{quest.progress}/{quest.maxProgress}</span>
                      <span className="font-medium">{quest.rewards.points} pts</span>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{quest.rewards.coins}</span>
                      </div>
                      
                      {quest.completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Terminé
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => completeQuest(quest.id)}
                          disabled={quest.progress < quest.maxProgress}
                        >
                          {quest.progress >= quest.maxProgress ? 'Terminer' : 'En cours'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Classement des champions</h3>
            
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    entry.id === '4' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {entry.avatar}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{entry.name}</h4>
                      {entry.id === '4' && (
                        <Badge className="bg-purple-100 text-purple-800">Vous</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Niveau {entry.level}</span>
                      <span>{entry.points} pts</span>
                      <span className="flex items-center space-x-1">
                        <Flame className="h-4 w-4" />
                        <span>{entry.streak} jours</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      #{entry.rank}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Level Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progression de niveau</h3>
        
        <div className="space-y-4">
          {levels.map((level) => {
            const isCurrentLevel = level.level === userStats.level;
            const isUnlocked = level.unlocked;
            const progress = isCurrentLevel ? 
              ((userStats.points - level.pointsRequired) / (levels[level.level]?.pointsRequired - level.pointsRequired)) * 100 : 
              (isUnlocked ? 100 : 0);
            
            return (
              <div
                key={level.level}
                className={`flex items-center space-x-4 p-3 rounded-lg ${
                  isCurrentLevel ? 'bg-purple-50 border-2 border-purple-200' : 
                  isUnlocked ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isUnlocked ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{level.title}</h4>
                    {isCurrentLevel && (
                      <Badge className="bg-purple-100 text-purple-800">Actuel</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {level.pointsRequired} points requis
                  </div>
                  
                  {isCurrentLevel && (
                    <Progress value={progress} className="h-2" />
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Récompenses: {level.rewards.join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default GamifiedNutritionGoals;