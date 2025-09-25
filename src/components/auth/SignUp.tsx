import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { authService } from '../../services/authService';

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'client' as 'coach' | 'client'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      toast({
        title: "Inscription réussie !",
        description: "Connexion automatique en cours...",
      });
      
      // Attendre que le profil soit créé puis se connecter automatiquement
      setTimeout(async () => {
        try {
          const { data, accessValidation } = await authService.signIn(formData.email, formData.password);
          if (onSignUpSuccess) {
            onSignUpSuccess();
          }
        } catch (error) {
          // Si la connexion auto échoue, rediriger vers la connexion
          onSwitchToSignIn();
        }
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bebas text-white mb-2 tracking-wider">
            INSCRIPTION
          </h2>
          <p className="text-gray-300 text-sm">
            Rejoignez BYW en tant que coach ou client
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Prénom"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
              />
              <Input
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
              />
            </div>
            
            {/* Email */}
            <Input
              type="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
            />
            
            {/* Role Selection */}
            <Select
              value={formData.role}
              onValueChange={(value: 'coach' | 'client') => handleInputChange('role', value)}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="coach" className="text-white hover:bg-gray-800">🏋️ Coach BYW</SelectItem>
                <SelectItem value="client" className="text-white hover:bg-gray-800">👤 Client</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Password Fields */}
            <Input
              type="password"
              placeholder="Mot de passe (min. 6 caractères)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
            />
            
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-[#fa7315] focus:ring-[#fa7315]/20 h-12 rounded-xl"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#fa7315] to-orange-600 hover:from-orange-600 hover:to-[#fa7315] text-white font-bebas text-lg tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#fa7315]/40 transition-all duration-300 transform hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Création...
              </div>
            ) : (
              "CRÉER MON COMPTE"
            )}
          </Button>
        </form>
        
        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-gray-300 text-sm">
            Déjà un compte ?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-[#fa7315] hover:text-orange-400 font-semibold transition-colors duration-300"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
