import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { ArrowLeft, Zap, Users, Trophy } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSwitchToSignUp = () => setIsSignUp(true);
  const handleSwitchToSignIn = () => setIsSignUp(false);

  const handleAuthSuccess = async () => {
    // Attendre un peu pour que la session et le profil soient prêts
    await new Promise(resolve => setTimeout(resolve, 600));
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00060f] via-[#001122] to-[#000816] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fa7315]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#fa7315]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => {
            console.log('Bouton cliqué !');
            window.location.href = '/';
          }}
          className="group flex items-center gap-2 text-white hover:text-orange-400 transition-colors duration-300 bg-black/20 px-4 py-2 rounded-lg hover:bg-black/40 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-bebas text-lg tracking-wider">RETOUR AU SITE</span>
        </button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding & Features */}
            <div className="space-y-8 text-white">
              {/* Logo & Brand */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <img
                    className="w-20 h-20 rounded-full"
                    alt="Build Your Way Logo"
                    src="/images/logo.png"
                  />
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bebas tracking-wider">
                      BUILDYOURWAY
                    </h1>
                    <p className="text-[#fa7315] font-semibold text-lg">
                      Plateforme de Coaching Sportif
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-3 bg-gradient-to-br from-[#fa7315]/20 to-orange-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-[#fa7315]" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-white mb-1">Gestion Complète</h3>
                    <p className="text-gray-300 text-sm">Suivez vos clients, programmes et séances en temps réel</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-3 bg-gradient-to-br from-[#fa7315]/20 to-orange-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-[#fa7315]" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-white mb-1">Interface Intuitive</h3>
                    <p className="text-gray-300 text-sm">Design moderne et responsive pour tous vos appareils</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-3 bg-gradient-to-br from-[#fa7315]/20 to-orange-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-[#fa7315]" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-white mb-1">Résultats Garantis</h3>
                    <p className="text-gray-300 text-sm">Outils avancés pour maximiser l'engagement de vos clients</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bebas text-[#fa7315]">1000+</div>
                  <div className="text-sm text-gray-400">Coachs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bebas text-[#fa7315]">50K+</div>
                  <div className="text-sm text-gray-400">Clients accompagnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bebas text-[#fa7315]">4.9/5</div>
                  <div className="text-sm text-gray-400">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
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
          </div>
        </div>
      </div>
    </div>
  );
};
