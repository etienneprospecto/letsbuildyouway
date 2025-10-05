import React, { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  threshold?: number; // Seuil en millisecondes
}

/**
 * Composant de monitoring des performances
 * Détecte les reflows lents et les optimise automatiquement
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  threshold = 16 // 16ms = 60fps
}) => {
  const observerRef = useRef<PerformanceObserver | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  useEffect(() => {
    // Observer pour les mesures de performance
    if ('PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              const duration = entry.duration;
              
              if (duration > threshold) {
                logger.warn(`Performance: ${entry.name} took ${duration.toFixed(2)}ms`, {
                  name: entry.name,
                  duration,
                  threshold,
                  startTime: entry.startTime
                }, 'PerformanceMonitor');
              }
            }
          });
        });

        // Observer les mesures de performance
        observerRef.current.observe({ entryTypes: ['measure'] });
      } catch (error) {
        logger.warn('PerformanceObserver not supported', error, 'PerformanceMonitor');
      }
    }

    // Monitoring des frames
    const monitorFrames = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      
      frameCountRef.current++;
      
      if (frameTime > threshold) {
        logger.warn(`Slow frame detected: ${frameTime.toFixed(2)}ms`, {
          frameTime,
          frameCount: frameCountRef.current,
          threshold
        }, 'PerformanceMonitor');
      }
      
      lastFrameTimeRef.current = now;
      requestAnimationFrame(monitorFrames);
    };

    // Démarrer le monitoring des frames
    requestAnimationFrame(monitorFrames);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  // Optimisation automatique des reflows
  useEffect(() => {
    const optimizeReflows = () => {
      // Détecter les éléments qui causent des reflows
      const elements = document.querySelectorAll('[style*="transform"], [style*="opacity"]');
      
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Forcer l'utilisation du GPU
        if (!htmlElement.style.willChange) {
          htmlElement.style.willChange = 'transform, opacity';
        }
        
        // Optimiser les transitions
        if (!htmlElement.style.transform) {
          htmlElement.style.transform = 'translateZ(0)';
        }
      });
    };

    // Optimiser au chargement
    optimizeReflows();
    
    // Optimiser après les mutations DOM
    const observer = new MutationObserver(optimizeReflows);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
};

export default PerformanceMonitor;
