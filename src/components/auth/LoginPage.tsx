import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Rediriger selon le rôle
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.role === 'coach') {
        navigate('/dashboard');
      } else {
        navigate('/client-dashboard');
      }
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Connexion
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 2. Vérifier le profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, created_at')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        throw new Error('Profil non trouvé');
      }

      // 3. Vérifier si c'est la première connexion (compte créé il y a moins de 5 minutes)
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
      
      if (profile.role === 'coach' && diffMinutes < 5) {
        // Première connexion → Changer le mot de passe
        navigate('/change-password?first=true');
      } else if (profile.role === 'coach') {
        navigate('/dashboard');
      } else {
        navigate('/client-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Connexion</h1>
          <p className="text-gray-600">Accédez à votre espace coach</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
