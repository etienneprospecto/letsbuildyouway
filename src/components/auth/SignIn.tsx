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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bebas text-white mb-2 tracking-wider">
            CONNEXION
          </h2>
          <p className="text-gray-300 text-sm">
            Accédez à votre espace BYW
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Votre mot de passe"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#fa7315] to-orange-600 hover:from-orange-600 hover:to-[#fa7315] text-white font-bebas text-lg tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#fa7315]/40 transition-all duration-300 transform hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Connexion...
              </div>
            ) : (
              "SE CONNECTER"
            )}
          </Button>
        </form>
        
        {/* Footer Links */}
        <div className="mt-8 space-y-4 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-[#fa7315] hover:text-orange-400 transition-colors duration-300 text-sm font-medium block w-full"
          >
            Mot de passe oublié ?
          </button>
          
          <div className="text-gray-300 text-sm">
            Pas encore de compte ?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-[#fa7315] hover:text-orange-400 font-semibold transition-colors duration-300"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
