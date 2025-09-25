import { useEffect } from 'react';

export const useScrollLock = () => {
  useEffect(() => {
    // Empêcher le scroll sur le body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Fonction pour empêcher le scroll au-delà des limites
    const preventOverscroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollContainer = target.closest('.page-content');
      
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        
        // Empêcher le scroll vers le haut si on est déjà en haut
        if (scrollTop <= 0 && (e as WheelEvent).deltaY < 0) {
          e.preventDefault();
        }
        
        // Empêcher le scroll vers le bas si on est déjà en bas
        if (scrollTop >= scrollHeight - clientHeight && (e as WheelEvent).deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    // Ajouter les event listeners
    document.addEventListener('wheel', preventOverscroll, { passive: false });
    document.addEventListener('touchmove', preventOverscroll, { passive: false });

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('wheel', preventOverscroll);
      document.removeEventListener('touchmove', preventOverscroll);
    };
  }, []);
};
