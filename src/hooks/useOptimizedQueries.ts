import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientService } from '@/services/clientService'
import { progressService } from '@/services/progressService'
import { SeanceService } from '@/services/seanceService'
import { NutritionService } from '@/services/nutritionService'

// Query keys constants
export const QUERY_KEYS = {
  clients: ['clients'] as const,
  client: (id: string) => ['clients', id] as const,
  clientProgress: (id: string) => ['clients', id, 'progress'] as const,
  clientSeances: (id: string) => ['clients', id, 'seances'] as const,
  clientNutrition: (id: string) => ['clients', id, 'nutrition'] as const,
  coachClients: (coachId: string) => ['coaches', coachId, 'clients'] as const,
} as const

// Optimized hooks for client data
export const useClientData = (clientId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.client(clientId),
    queryFn: () => ClientService.getClientById(clientId),
    enabled: !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useClientProgress = (clientId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.clientProgress(clientId),
    queryFn: () => progressService.getClientProgress(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useClientSeances = (clientId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.clientSeances(clientId),
    queryFn: () => SeanceService.getSeancesByClient(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useClientNutrition = (clientId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.clientNutrition(clientId),
    queryFn: () => NutritionService.getClientNutritionStats(clientId),
    enabled: !!clientId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export const useCoachClients = (coachId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.coachClients(coachId),
    queryFn: () => ClientService.getClientsByCoach(coachId),
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation hooks with optimistic updates
export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      ClientService.updateClient(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
    },
  })
}

export const useCreateProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => progressService.createProgress(data),
    onSuccess: (_, variables) => {
      // Invalidate progress queries for the client
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.clientProgress(variables.client_id) 
      })
    },
  })
}

// Prefetch utilities
export const usePrefetchClientData = () => {
  const queryClient = useQueryClient()
  
  const prefetchClient = (clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.client(clientId),
      queryFn: () => ClientService.getClientById(clientId),
      staleTime: 10 * 60 * 1000,
    })
  }
  
  const prefetchClientProgress = (clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.clientProgress(clientId),
      queryFn: () => progressService.getClientProgress(clientId),
      staleTime: 5 * 60 * 1000,
    })
  }
  
  return { prefetchClient, prefetchClientProgress }
}
