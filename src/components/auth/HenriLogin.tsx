import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

const HenriLogin = () => {
  const [email, setEmail] = useState('henriprospecto123@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Essayer de se connecter
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // Si l'utilisateur n'existe pas, le créer
        if (loginError.message.includes('Invalid login credentials')) {
          setIsNewUser(true);
          setMessage('Utilisateur non trouvé. Création du compte...');
          await createUser();
        } else {
          throw loginError;
        }
      } else {
        setMessage('Connexion réussie ! Redirection vers le dashboard...');
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      // Créer l'utilisateur avec confirmation d'email
      const { data: newUser, error: createError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://byw.app/auth/henri-login',
          data: {
            name: 'Henri Prospecto',
            role: 'coach'
          }
        }
      });

      if (createError) {
        throw createError;
      }

      if (newUser.user) {
        // Créer le profil avec abonnement Transformationnel
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email,
            name: 'Henri Prospecto',
            role: 'coach',
            subscription_plan: 'transformationnel',
            stripe_customer_id: 'cus_test_henri',
            stripe_subscription_id: 'sub_test_henri',
            subscription_status: 'trialing',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            plan_limits: {
              max_clients: 50,
              timeline_weeks: 4,
              max_workouts: 50,
              max_exercises: 100,
              features: ['advanced_dashboard', 'voice_messaging', 'nutrition_tracking', 'advanced_feedbacks', 'progress_photos_history', 'trophies', 'shared_resources', 'payment_retries']
            }
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setMessage('Compte créé avec succès ! Connexion automatique...');
        
        // Attendre un peu pour que le compte soit bien créé
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Se connecter automatiquement
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error('Login error after creation:', loginError);
          setMessage('Compte créé ! Essayez de vous connecter manuellement.');
          setIsNewUser(false);
        } else {
          setMessage('Connexion réussie ! Redirection vers le dashboard...');
          setTimeout(() => {
            navigate('/app/dashboard');
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('User creation error:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/70 border-gray-700 shadow-lg backdrop-blur-sm">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bebas text-white text-center mb-6 tracking-wider">
            Connexion <span className="text-orange-500">Henri</span>
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Connectez-vous ou créez votre compte coach
          </p>
          {message && <p className="text-green-400 text-center mb-4">{message}</p>}
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                disabled
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isNewUser ? (
                'Créer le compte et se connecter'
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Plan: <span className="text-orange-500 font-semibold">Transformationnel</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Jusqu'à 50 clients • Timeline 1 mois • Fonctionnalités avancées
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HenriLogin;
