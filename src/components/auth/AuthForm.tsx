import React, { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSwitchToSignUp = () => setIsSignUp(true);
  const handleSwitchToSignIn = () => setIsSignUp(false);

  const handleAuthSuccess = async () => {
    // Attendre un peu pour que le profil soit créé
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">BYW</h1>
          <p className="mt-2 text-gray-600">
            Build Your Way - Coaching Sportif
          </p>
        </div>

        {/* Auth Form */}
        {isSignUp ? (
          <SignUp 
            onSwitchToSignIn={handleSwitchToSignIn} 
            onSignUpSuccess={handleAuthSuccess}
          />
        ) : (
          <SignIn 
            onSwitchToSignUp={handleSwitchToSignUp} 
            onSignInSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};
