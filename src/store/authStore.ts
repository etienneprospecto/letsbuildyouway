import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'coach' | 'client'
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User) => void
  logout: () => void
  switchRole: (role: 'coach' | 'client') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      
      switchRole: (role) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              role,
              firstName: role === 'coach' ? 'Demo Coach' : 'Demo Client',
              lastName: 'User'
            }
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)