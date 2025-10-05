import { useQuery } from '@tanstack/react-query';
import { OptimizedQueriesService } from '../services/optimizedQueriesService';
import { logger } from '../lib/logger';

/**
 * Hook pour récupérer les données du dashboard coach avec cache intelligent
 */
export const useCoachDashboardData = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-dashboard', coachId],
    queryFn: () => OptimizedQueriesService.getCoachDashboardData(coachId!),
    enabled: !!coachId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useCoachDashboardData', error);
    }
  });
};

/**
 * Hook pour récupérer les données du dashboard client avec cache intelligent
 */
export const useClientDashboardData = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client-dashboard', clientId],
    queryFn: () => OptimizedQueriesService.getClientDashboardData(clientId!),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useClientDashboardData', error);
    }
  });
};

/**
 * Hook pour récupérer les messages avec cache intelligent
 */
export const useMessagesWithDetails = (relationId: string | undefined, limit: number = 50) => {
  return useQuery({
    queryKey: ['messages', relationId, limit],
    queryFn: () => OptimizedQueriesService.getMessagesWithDetails(relationId!, limit),
    enabled: !!relationId,
    staleTime: 30 * 1000, // 30 secondes (messages plus dynamiques)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useMessagesWithDetails', error);
    }
  });
};

/**
 * Hook pour récupérer les séances avec cache intelligent
 */
export const useSessionsWithDetails = (clientId: string | undefined, limit: number = 20) => {
  return useQuery({
    queryKey: ['sessions', clientId, limit],
    queryFn: () => OptimizedQueriesService.getSessionsWithDetails(clientId!, limit),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useSessionsWithDetails', error);
    }
  });
};

/**
 * Hook pour récupérer les données de facturation avec cache intelligent
 */
export const useBillingDataWithClients = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['billing-data', coachId],
    queryFn: () => OptimizedQueriesService.getBillingDataWithClients(coachId!),
    enabled: !!coachId,
    staleTime: 10 * 60 * 1000, // 10 minutes (données de facturation plus stables)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useBillingDataWithClients', error);
    }
  });
};

/**
 * Hook pour récupérer les données de progression avec cache intelligent
 */
export const useProgressDataWithDetails = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['progress-data', clientId],
    queryFn: () => OptimizedQueriesService.getProgressDataWithDetails(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      logger.error('Erreur useProgressDataWithDetails', error);
    }
  });
};