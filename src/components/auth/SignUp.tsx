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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez BYW en tant que coach ou client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Prénom"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
            <Input
              placeholder="Nom"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          
          <Select
            value={formData.role}
            onValueChange={(value: 'coach' | 'client') => handleInputChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coach">Coach BYW</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Créer le compte"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-blue-600 hover:underline"
          >
            Se connecter
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
