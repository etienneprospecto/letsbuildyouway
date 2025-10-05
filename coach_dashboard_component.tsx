// ========================================
// COMPOSANT DASHBOARD COACH
// ========================================
// Fichier: components/CoachDashboard.tsx
// Description: Dashboard principal pour les coachs avec limites de pack

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PlanLimits {
  max_clients: number;
  max_workouts: number;
  max_exercises: number;
  timeline_weeks: number;
  features: string[];
}

interface CoachData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription_plan: string;
  plan_limits: PlanLimits;
  current_clients_count: number;
  current_workouts_count: number;
  current_exercises_count: number;
}

export default function CoachDashboard() {
  const supabase = createClientComponentClient();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadCoachData();
  }, []);

  async function loadCoachData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: coachData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'coach')
      .single();

    if (coachData) {
      setCoach(coachData);
    }

    setLoading(false);
  }

  async function inviteClient() {
    if (!coach || !newClientEmail || !newClientName) return;

    setInviting(true);
    try {
      const response = await fetch('/api/invite-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: newClientEmail,
          clientName: newClientName,
          coachId: coach.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewClientEmail('');
        setNewClientName('');
        await loadCoachData(); // Recharger les données
        alert('Client invité avec succès !');
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      alert('Erreur lors de l\'invitation');
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="p-6">
        <div className="text-red-500">Erreur de chargement</div>
      </div>
    );
  }

  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue {coach.first_name} {coach.last_name} 👋
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Pack actuel :</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold capitalize">
            {coach.subscription_plan.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Cartes de limites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Clients</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(
                coach.current_clients_count,
                coach.plan_limits.max_clients
              )}`}
            >
              {coach.current_clients_count} / {coach.plan_limits.max_clients}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressBarColor(
                coach.current_clients_count,
                coach.plan_limits.max_clients
              )}`}
              style={{
                width: `${Math.min(
                  (coach.current_clients_count /
                    coach.plan_limits.max_clients) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
          {coach.current_clients_count >= coach.plan_limits.max_clients && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Limite atteinte ! Upgradez votre pack.
            </p>
          )}
        </div>

        {/* Workouts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Workouts</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                coach.plan_limits.max_workouts === -1
                  ? 'text-purple-600 bg-purple-50'
                  : getUsageColor(
                      coach.current_workouts_count,
                      coach.plan_limits.max_workouts
                    )
              }`}
            >
              {coach.current_workouts_count} /{' '}
              {coach.plan_limits.max_workouts === -1
                ? '∞'
                : coach.plan_limits.max_workouts}
            </div>
          </div>
          {coach.plan_limits.max_workouts !== -1 ? (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(
                  coach.current_workouts_count,
                  coach.plan_limits.max_workouts
                )}`}
                style={{
                  width: `${Math.min(
                    (coach.current_workouts_count /
                      coach.plan_limits.max_workouts) *
                    100,
                    100
                  )}%`,
                }}
              />
            </div>
          ) : (
            <div className="text-purple-600 text-sm">✨ Illimité</div>
          )}
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Exercices</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                coach.plan_limits.max_exercises === -1
                  ? 'text-purple-600 bg-purple-50'
                  : getUsageColor(
                      coach.current_exercises_count,
                      coach.plan_limits.max_exercises
                    )
              }`}
            >
              {coach.current_exercises_count} /{' '}
              {coach.plan_limits.max_exercises === -1
                ? '∞'
                : coach.plan_limits.max_exercises}
            </div>
          </div>
          {coach.plan_limits.max_exercises !== -1 ? (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(
                  coach.current_exercises_count,
                  coach.plan_limits.max_exercises
                )}`}
                style={{
                  width: `${Math.min(
                    (coach.current_exercises_count /
                      coach.plan_limits.max_exercises) *
                    100,
                    100
                  )}%`,
                }}
              />
            </div>
          ) : (
            <div className="text-purple-600 text-sm">✨ Illimité</div>
          )}
        </div>
      </div>

      {/* Invitation client */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Inviter un nouveau client</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Jean Dupont"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="jean.dupont@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={inviteClient}
              disabled={inviting || !newClientName || !newClientEmail || coach.current_clients_count >= coach.plan_limits.max_clients}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? 'Envoi...' : 'Inviter'}
            </button>
          </div>
        </div>
        {coach.current_clients_count >= coach.plan_limits.max_clients && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Limite de clients atteinte. Upgradez votre pack pour inviter plus de clients.
          </p>
        )}
      </div>

      {/* Fonctionnalités du pack */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Fonctionnalités de votre pack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coach.plan_limits.features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-green-500">✓</span>
              <span className="capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
