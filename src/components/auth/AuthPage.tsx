import React from 'react';
import { AuthForm } from './AuthForm';
import { useAuth } from '../../providers/AuthProvider';

export const AuthPage: React.FC = () => {
  const { refreshProfile } = useAuth();

  const handleAuthSuccess = async () => {
    // Rafraîchir le profil après connexion réussie
    await refreshProfile();
  };

  return <AuthForm onAuthSuccess={handleAuthSuccess} />;
};
