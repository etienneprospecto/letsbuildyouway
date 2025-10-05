import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

const AcceptInvitation = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    if (accessToken && refreshToken) {
      handleAuthWithTokens();
    }
  }, [accessToken, refreshToken]);

  const handleAuthWithTokens = async () => {
    try {
      console.log('Setting session with tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      });

      if (error) {
        console.error('Error setting session:', error);
        setError('Session invalide. Veuillez demander un nouveau lien d\'invitation.');
        return;
      }

      if (data.user) {
        console.log('Session restored successfully:', data.user.email);
        setMessage('Session restaurée ! Vous pouvez maintenant définir votre mot de passe.');
      } else {
        setError('Aucun utilisateur trouvé dans la session.');
      }
    } catch (error: any) {
      console.error('Error authenticating:', error);
      setError('Erreur d\'authentification. Veuillez réessayer.');
    }
  };

  const handlePasswordSetup = async () => {
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vérifier d'abord si on a une session active
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // Si pas de session, essayer de la restaurer avec les tokens
        if (accessToken && refreshToken) {
          console.log('Restoring session before password update...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            throw new Error('Session invalide. Veuillez demander un nouveau lien.');
          }
        } else {
          throw new Error('Aucune session active et pas de tokens disponibles.');
        }
      }

      console.log('Updating password for user:', user?.email);
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setMessage('Mot de passe configuré avec succès ! Redirection vers votre dashboard...');
      
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.message || 'Erreur lors de la configuration du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordSetup();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/70 border-gray-700 shadow-lg backdrop-blur-sm">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bebas text-white text-center mb-6 tracking-wider">
            Bienvenue sur <span className="text-orange-500">BYW</span>
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Configurez votre mot de passe pour accéder à votre dashboard coach
          </p>
          {message && <p className="text-green-400 text-center mb-4">{message}</p>}
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Configurer le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;