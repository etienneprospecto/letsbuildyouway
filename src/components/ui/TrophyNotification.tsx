import React, { useState, useEffect } from 'react';
import { Trophy, X, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';

interface TrophyNotificationProps {
  trophy: {
    id: string;
    name: string;
    description: string;
    icon_url: string;
  };
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export const TrophyNotification: React.FC<TrophyNotificationProps> = ({
  trophy,
  isVisible,
  onClose,
  onShare
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      // Auto-fermer après 5 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Partage par défaut
      if (navigator.share) {
        navigator.share({
          title: `Nouveau trophée débloqué !`,
          text: `Je viens de débloquer le trophée "${trophy.name}" ! 🏆`,
          url: window.location.href
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-lg shadow-2xl border-2 border-yellow-300">
            {/* Confettis */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 1, 
                      y: 0, 
                      x: Math.random() * 100 - 50,
                      rotate: 0 
                    }}
                    animate={{ 
                      opacity: 0, 
                      y: -100, 
                      x: Math.random() * 200 - 100,
                      rotate: 360 
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: Math.random() * 0.5 
                    }}
                    className="absolute top-4 left-1/2 w-2 h-2 bg-white rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Contenu */}
            <div className="text-center text-white">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: 2, 
                  repeatType: "reverse" 
                }}
                className="text-6xl mb-3"
              >
                {trophy.icon_url}
              </motion.div>

              <h3 className="text-xl font-bold mb-2 drop-shadow-sm">
                🎉 Nouveau Trophée !
              </h3>

              <Badge 
                variant="secondary" 
                className="mb-3 bg-white text-yellow-600 font-semibold"
              >
                {trophy.name}
              </Badge>

              <p className="text-sm mb-4 drop-shadow-sm">
                {trophy.description}
              </p>

              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleShare}
                  className="gap-1 bg-white text-yellow-600 hover:bg-gray-100"
                >
                  <Share2 className="w-3 h-3" />
                  Partager
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="bg-transparent border-white text-white hover:bg-white hover:text-yellow-600"
                >
                  Super ! 👍
                </Button>
              </div>
            </div>

            {/* Effet de brillance */}
            <motion.div
              animate={{ 
                x: [-100, 100], 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 1 
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrophyNotification;
