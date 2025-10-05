import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook pour optimiser les performances et réduire les reflows
 */
export const usePerformanceOptimization = () => {
  const rafId = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  // Debounce function pour éviter les appels trop fréquents
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle function pour limiter la fréquence d'exécution
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Optimisation des animations avec requestAnimationFrame
  const optimizedAnimation = useCallback((callback: () => void) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame((timestamp) => {
      // Limiter à 60fps maximum
      if (timestamp - lastFrameTime.current >= 16.67) {
        callback();
        lastFrameTime.current = timestamp;
      }
    });
  }, []);

  // Observer pour les éléments qui entrent dans le viewport
  const useIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) => {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    return observer;
  }, []);

  // Optimisation des images lazy loading
  const optimizeImageLoading = useCallback(() => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }, []);

  // Mesurer les performances
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) { // Plus de 16ms = problème de performance
      logger.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`, {
        name,
        duration,
        threshold: 16
      }, 'Performance');
    }
    
    return duration;
  }, []);

  // Optimisation des reflows
  const batchDOMUpdates = useCallback((updates: (() => void)[]) => {
    // Forcer un reflow avant les modifications
    document.body.offsetHeight;
    
    // Appliquer toutes les modifications en une fois
    updates.forEach(update => update());
    
    // Forcer un reflow après les modifications
    document.body.offsetHeight;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    debounce,
    throttle,
    optimizedAnimation,
    useIntersectionObserver,
    optimizeImageLoading,
    measurePerformance,
    batchDOMUpdates
  };
};
