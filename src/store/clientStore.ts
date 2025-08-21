import { create } from 'zustand'

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  age: number
  photoUrl?: string
  objective: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  startDate: string
  needsAttention: boolean
  lastActivity?: string
  progressPercentage: number
}

interface ClientState {
  clients: Client[]
  isLoading: boolean
  selectedClient: Client | null
  
  // Actions
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
  setSelectedClient: (client: Client | null) => void
  setLoading: (loading: boolean) => void
  
  // Computed
  getClientById: (id: string) => Client | undefined
  getClientsNeedingAttention: () => Client[]
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,
  selectedClient: null,

  setClients: (clients) => set({ clients }),
  
  addClient: (client) => set((state) => ({ 
    clients: [...state.clients, client] 
  })),
  
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    )
  })),
  
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(client => client.id !== id)
  })),
  
  setSelectedClient: (client) => set({ selectedClient: client }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  getClientById: (id) => get().clients.find(client => client.id === id),
  
  getClientsNeedingAttention: () => get().clients.filter(client => client.needsAttention)
}))