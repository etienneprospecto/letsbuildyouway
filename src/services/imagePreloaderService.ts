import { logger } from '@/lib/logger';

interface ImageCache {
  [url: string]: {
    image: HTMLImageElement;
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

class ImagePreloaderService {
  private cache: ImageCache = {};
  private maxCacheSize = 50; // Maximum 50 images en cache
  private maxAge = 5 * 60 * 1000; // 5 minutes

  /**
   * Précharge une image et la met en cache
   */
  async preloadImage(url: string): Promise<HTMLImageElement | null> {
    // Vérifier si l'image est déjà en cache
    if (this.cache[url] && this.cache[url].loaded) {
      const cached = this.cache[url];
      const age = Date.now() - cached.timestamp;
      
      if (age < this.maxAge) {
        logger.debug('Image loaded from cache', { url, age }, 'ImagePreloader');
        return cached.image;
      } else {
        // Cache expiré, nettoyer
        delete this.cache[url];
      }
    }

    // Nettoyer le cache si nécessaire
    this.cleanupCache();

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Configuration pour optimiser le chargement
      img.crossOrigin = 'anonymous';
      img.loading = 'lazy';
      
      img.onload = () => {
        this.cache[url] = {
          image: img,
          loaded: true,
          error: false,
          timestamp: Date.now()
        };
        
        logger.debug('Image preloaded successfully', { url }, 'ImagePreloader');
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.cache[url] = {
          image: img,
          loaded: false,
          error: true,
          timestamp: Date.now()
        };
        
        logger.warn('Image preload failed', { url, error }, 'ImagePreloader');
        reject(error);
      };
      
      // Démarrer le chargement
      img.src = url;
    });
  }

  /**
   * Précharge plusieurs images en parallèle
   */
  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => 
      this.preloadImage(url).catch(() => null)
    );
    
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  /**
   * Vérifie si une image est en cache
   */
  isImageCached(url: string): boolean {
    return this.cache[url]?.loaded === true;
  }

  /**
   * Obtient une image du cache
   */
  getCachedImage(url: string): HTMLImageElement | null {
    const cached = this.cache[url];
    if (cached && cached.loaded && !cached.error) {
      return cached.image;
    }
    return null;
  }

  /**
   * Nettoie le cache des images expirées
   */
  private cleanupCache(): void {
    const now = Date.now();
    const urls = Object.keys(this.cache);
    
    // Si on dépasse la taille maximale, supprimer les plus anciennes
    if (urls.length >= this.maxCacheSize) {
      const sortedUrls = urls.sort((a, b) => 
        this.cache[a].timestamp - this.cache[b].timestamp
      );
      
      // Supprimer les 20% les plus anciennes
      const toRemove = sortedUrls.slice(0, Math.floor(urls.length * 0.2));
      toRemove.forEach(url => delete this.cache[url]);
    }
    
    // Supprimer les images expirées
    urls.forEach(url => {
      const cached = this.cache[url];
      if (cached && now - cached.timestamp > this.maxAge) {
        delete this.cache[url];
      }
    });
  }

  /**
   * Précharge les images critiques de l'application
   */
  async preloadCriticalImages(): Promise<void> {
    const criticalImages = [
      // Images par défaut pour les avatars
      'https://ui-avatars.com/api/?name=U&background=fa7315&color=fff&size=200',
      'https://ui-avatars.com/api/?name=C&background=fa7315&color=fff&size=200',
      'https://ui-avatars.com/api/?name=U&background=fa7315&color=fff&size=200'
    ];

    try {
      await this.preloadImages(criticalImages);
      logger.info('Critical images preloaded', { count: criticalImages.length }, 'ImagePreloader');
    } catch (error) {
      logger.warn('Failed to preload critical images', error, 'ImagePreloader');
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): {
    totalImages: number;
    loadedImages: number;
    errorImages: number;
    cacheSize: number;
  } {
    const urls = Object.keys(this.cache);
    const loaded = urls.filter(url => this.cache[url].loaded).length;
    const errors = urls.filter(url => this.cache[url].error).length;
    
    return {
      totalImages: urls.length,
      loadedImages: loaded,
      errorImages: errors,
      cacheSize: urls.length
    };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache = {};
    logger.info('Image cache cleared', null, 'ImagePreloader');
  }
}

// Export d'une instance singleton
export const imagePreloader = new ImagePreloaderService();
