import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface ClientPasswordSetupProps {
  onPasswordSet: () => void;
}

const ClientPasswordSetup: React.FC<ClientPasswordSetupProps> = ({ onPasswordSet }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      // Vérifier que l'utilisateur est bien connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Session invalide. Veuillez vous reconnecter.');
      }

      console.log('🔐 Configuration mot de passe pour client:', user.email);
      
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          password_set: true
        }
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      console.log('✅ Mot de passe configuré avec succès');
      
      // Attendre un peu puis notifier le parent
      setTimeout(() => {
        onPasswordSet();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur configuration mot de passe:', error);
      setError(error.message || 'Erreur lors de la configuration du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordSetup();
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Mot de passe configuré !
          </h3>
          <p className="text-green-600">
            Redirection vers votre dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bebas text-gray-800">
          Configuration de votre mot de passe
        </CardTitle>
        <p className="text-gray-600">
          Bienvenue ! Configurez votre mot de passe pour accéder à votre dashboard.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
              autoComplete="new-password"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuration en cours...
              </>
            ) : (
              'Configurer le mot de passe'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientPasswordSetup;
