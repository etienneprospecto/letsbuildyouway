import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface CoachProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  subscription_plan: string;
  subscription_status: string;
  plan_limits: {
    max_clients: number;
    max_workouts: number;
    max_exercises: number;
    timeline_weeks: number;
    features: string[];
  };
  current_clients_count: number;
  current_workouts_count: number;
  current_exercises_count: number;
}

const CoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IGNORER COMPLÈTEMENT L'ERREUR "MESSAGE PORT"
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString?.() || '';
      if (message.includes('message port') || message.includes('runtime.lastError')) {
        return; // IGNORER
      }
      originalError.apply(console, args);
    };

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Timeout reached, stopping loading');
        setLoading(false);
      }
    }, 5000); // 5 secondes max

    loadCoachProfile();

    return () => {
      clearTimeout(timeout);
      console.error = originalError;
    };
  }, []);

  async function loadCoachProfile() {
    try {
      console.log('🔍 Loading coach profile directly...');

      // SOLUTION RADICALE : getSession direct
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        navigate('/login');
        return;
      }

      if (!session) {
        console.log('❌ No session, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('✅ Session found:', session.user.id);

      // Charger le profil directement
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        navigate('/login');
        return;
      }

      if (profile.role !== 'coach') {
        console.log('❌ User is not a coach, redirecting to client dashboard');
        navigate('/client-dashboard');
        return;
      }

      console.log('✅ Profile loaded:', profile);
      setCoach(profile);
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Erreur de chargement du profil</div>
      </div>
    );
  }

  const getPlanColor = (plan: string) => {
    const colors = {
      warm_up: 'green',
      transformationnel: 'blue',
      elite: 'purple',
    };
    return colors[plan as keyof typeof colors] || 'gray';
  };

  const getPlanName = (plan: string) => {
    const names = {
      warm_up: 'Warm-Up',
      transformationnel: 'Transformationnel',
      elite: 'Elite',
    };
    return names[plan as keyof typeof names] || plan;
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (current: number, max: number) => {
    if (max === -1) return 'purple';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'orange';
    return 'green';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Coach
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenue {coach.first_name} {coach.last_name} 👋
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pack actuel */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 mb-2">Votre pack actuel</p>
              <h2 className="text-4xl font-bold mb-4">
                {getPlanName(coach.subscription_plan)}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {coach.subscription_status === 'active' ? '✅ Actif' : '⚠️ Inactif'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                Changer de pack
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques d'usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Clients */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                👥 Clients
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getUsageColor(coach.current_clients_count, coach.plan_limits.max_clients)}-100 text-${getUsageColor(coach.current_clients_count, coach.plan_limits.max_clients)}-700`}>
                {coach.current_clients_count} / {coach.plan_limits.max_clients}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full bg-${getUsageColor(coach.current_clients_count, coach.plan_limits.max_clients)}-500 transition-all`}
                style={{
                  width: `${getUsagePercentage(coach.current_clients_count, coach.plan_limits.max_clients)}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {coach.plan_limits.max_clients - coach.current_clients_count > 0
                ? `${coach.plan_limits.max_clients - coach.current_clients_count} places disponibles`
                : '⚠️ Limite atteinte'}
            </p>
          </div>

          {/* Workouts */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                💪 Workouts
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                coach.plan_limits.max_workouts === -1
                  ? 'bg-purple-100 text-purple-700'
                  : `bg-${getUsageColor(coach.current_workouts_count, coach.plan_limits.max_workouts)}-100 text-${getUsageColor(coach.current_workouts_count, coach.plan_limits.max_workouts)}-700`
              }`}>
                {coach.current_workouts_count} / {coach.plan_limits.max_workouts === -1 ? '∞' : coach.plan_limits.max_workouts}
              </span>
            </div>
            {coach.plan_limits.max_workouts === -1 ? (
              <div className="text-purple-600 font-medium">
                ✨ Workouts illimités
              </div>
            ) : (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full bg-${getUsageColor(coach.current_workouts_count, coach.plan_limits.max_workouts)}-500 transition-all`}
                    style={{
                      width: `${getUsagePercentage(coach.current_workouts_count, coach.plan_limits.max_workouts)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {coach.plan_limits.max_workouts - coach.current_workouts_count} restants
                </p>
              </>
            )}
          </div>

          {/* Exercises */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                🏋️ Exercices
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                coach.plan_limits.max_exercises === -1
                  ? 'bg-purple-100 text-purple-700'
                  : `bg-${getUsageColor(coach.current_exercises_count, coach.plan_limits.max_exercises)}-100 text-${getUsageColor(coach.current_exercises_count, coach.plan_limits.max_exercises)}-700`
              }`}>
                {coach.current_exercises_count} / {coach.plan_limits.max_exercises === -1 ? '∞' : coach.plan_limits.max_exercises}
              </span>
            </div>
            {coach.plan_limits.max_exercises === -1 ? (
              <div className="text-purple-600 font-medium">
                ✨ Exercices illimités
              </div>
            ) : (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full bg-${getUsageColor(coach.current_exercises_count, coach.plan_limits.max_exercises)}-500 transition-all`}
                    style={{
                      width: `${getUsagePercentage(coach.current_exercises_count, coach.plan_limits.max_exercises)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {coach.plan_limits.max_exercises - coach.current_exercises_count} restants
                </p>
              </>
            )}
          </div>
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">
            ✨ Fonctionnalités de votre pack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coach.plan_limits.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-4 bg-green-50 rounded-lg"
              >
                <span className="text-green-600 text-xl">✓</span>
                <span className="font-medium text-gray-700 capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition shadow-lg">
            <div className="text-4xl mb-2">👥</div>
            <h4 className="font-bold text-lg">Inviter un client</h4>
            <p className="text-blue-100 text-sm mt-1">
              Ajoutez un nouveau client à votre liste
            </p>
          </button>

          <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition shadow-lg">
            <div className="text-4xl mb-2">💪</div>
            <h4 className="font-bold text-lg">Créer un workout</h4>
            <p className="text-purple-100 text-sm mt-1">
              Concevez un nouveau programme
            </p>
          </button>

          <button className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition shadow-lg">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="font-bold text-lg">Voir les stats</h4>
            <p className="text-green-100 text-sm mt-1">
              Consultez vos statistiques
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;