import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configuration optimisée pour la production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache intelligent - données fraîches pendant 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Garder en cache pendant 10 minutes après inactivité
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      // Ne pas refetch automatiquement sur focus window
      refetchOnWindowFocus: false,
      // Retry intelligent - 3 tentatives avec backoff exponentiel
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 401/403 (auth)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      // Timeout de 10 secondes maximum
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry les mutations une seule fois
      retry: 1,
      // Timeout de 15 secondes pour les mutations
      retryDelay: 2000,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools seulement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};