import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { useAuth } from '@/providers/OptimizedAuthProvider';
import { logger } from '@/lib/logger';

export const AuthPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = async () => {
    logger.debug('AuthPage: handleAuthSuccess appelé', null, 'AuthPage');
    
    try {
      // Rafraîchir le profil après connexion réussie
      await refreshProfile();
      logger.debug('AuthPage: Profil rafraîchi avec succès', null, 'AuthPage');
    } catch (error) {
      logger.warn('AuthPage: Erreur lors du rafraîchissement du profil', error, 'AuthPage');
      // Continuer même en cas d'erreur de rafraîchissement
    }
    
    // Attendre un peu pour que le profil soit mis à jour
    setTimeout(() => {
      logger.debug('AuthPage: Redirection vers /app/dashboard', null, 'AuthPage');
      navigate('/app/dashboard');
    }, 1000);
  };

  return <AuthForm onAuthSuccess={handleAuthSuccess} />;
};
