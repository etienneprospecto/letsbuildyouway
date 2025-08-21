import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { authService } from '../../services/authService';
import { AccessValidationResult } from '../../services/accessValidationService';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSignInSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const { data, accessValidation } = await authService.signIn(formData.email, formData.password);
      
      // Afficher un message personnalisé selon le type d'accès
      if (accessValidation.role === 'coach') {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue Coach !",
        });
      } else if (accessValidation.role === 'client') {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur votre espace client !",
        });
      }
      
      onSignInSuccess();
    } catch (error: any) {
      toast({
        title: "Accès refusé",
        description: error.message || "Vous n'avez pas l'autorisation d'accéder à cette application",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre email d'abord",
        variant: "destructive"
      });
      return;
    }

    try {
      await authService.resetPassword(formData.email);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
        <CardDescription>
          Accédez à votre espace BYW
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2 text-center text-sm">
          <button
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline block"
          >
            Mot de passe oublié ?
          </button>
          
          <div>
            Pas encore de compte ?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:underline"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
