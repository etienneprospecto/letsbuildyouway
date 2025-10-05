import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: (error: Error) => void;
}

/**
 * Composant d'image optimisé qui gère les erreurs CORS et les fallbacks
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  loading = 'lazy',
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback par défaut basé sur les initiales
  const getDefaultFallback = useCallback((altText: string) => {
    const initials = altText
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=fa7315&color=fff&size=200`;
  }, []);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    const error = new Error(`Failed to load image: ${target.src}`);
    
    logger.warn('OptimizedImage: Erreur de chargement d\'image', {
      src: target.src,
      alt,
      error: error.message
    }, 'OptimizedImage');

    setHasError(true);
    setIsLoading(false);

    // Essayer le fallback personnalisé d'abord
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      return;
    }

    // Puis le fallback par défaut
    const defaultFallback = getDefaultFallback(alt);
    if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
      return;
    }

    // Si tout échoue, appeler le callback d'erreur
    onError?.(error);
  }, [alt, fallbackSrc, imageSrc, getDefaultFallback, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Détecter les URLs Google qui peuvent causer des problèmes CORS
  const isGoogleImage = src?.includes('googleusercontent.com') || src?.includes('googleapis.com');
  const shouldUseProxy = isGoogleImage && !src?.includes('proxy');

  // URL proxy pour les images Google (optionnel)
  const proxiedSrc = shouldUseProxy 
    ? `https://images.weserv.nl/?url=${encodeURIComponent(src!)}&w=200&h=200&fit=cover&q=80`
    : imageSrc;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}
      
      <img
        {...props}
        src={proxiedSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "filter grayscale" : "",
          className
        )}
        style={{
          // Optimisations de performance
          willChange: 'auto',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            {alt.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
