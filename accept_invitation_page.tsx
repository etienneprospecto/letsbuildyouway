// ========================================
// PAGE D'ACCEPTATION D'INVITATION CLIENT
// ========================================
// Fichier: app/accept-invitation/page.tsx
// Description: Page pour accepter une invitation client

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const token = searchParams.get('token');

  const [clientData, setClientData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setError('Token d\'invitation manquant');
      setLoading(false);
    }
  }, [token]);

  async function validateInvitation() {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select(`
          id,
          email,
          first_name,
          last_name,
          invitation_token,
          invitation_status,
          coach_id,
          profiles!coaches(first_name, last_name, email)
        `)
        .eq('invitation_token', token)
        .single();

      if (error || !client) {
        setError('Invitation invalide ou expirée');
        setLoading(false);
        return;
      }

      if (client.invitation_status === 'accepted') {
        setError('Cette invitation a déjà été acceptée');
        setLoading(false);
        return;
      }

      setClientData(client);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors de la validation de l\'invitation');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clientData.email,
        password: password,
        options: {
          data: {
            first_name: clientData.first_name,
            last_name: clientData.last_name,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      // 2. Créer le profil client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: clientData.email,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          role: 'client',
          coach_id: clientData.coach_id
        });

      if (profileError) throw profileError;

      // 3. Mettre à jour le client avec l'ID Supabase Auth
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          id: authData.user!.id,
          invitation_status: 'accepted',
          invitation_accepted_at: new Date().toISOString(),
        })
        .eq('invitation_token', token);

      if (updateError) throw updateError;

      // 4. Connexion automatique
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: clientData.email,
        password: password,
      });

      if (signInError) throw signInError;

      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Validation de l'invitation...</div>
        </div>
      </div>
    );
  }

  if (error && !clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation invalide</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <a 
            href="mailto:support@byw-fitness.com" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Contacter le support
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Compte créé !</h1>
          <p className="text-gray-600 mb-6">
            Bienvenue {clientData?.first_name} ! Votre compte a été créé avec succès.
          </p>
          <p className="text-sm text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rejoindre BYW Fitness
          </h1>
          <p className="text-gray-600">
            Votre coach <span className="font-semibold text-blue-600">
              {clientData?.profiles?.first_name} {clientData?.profiles?.last_name}
            </span> vous a invité
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={clientData?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez votre mot de passe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>En créant votre compte, vous acceptez nos</p>
          <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
            conditions d'utilisation
          </a>
        </div>
      </div>
    </div>
  );
}
