import React, { useState, useEffect } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { supabase } from '@/lib/supabase'
import { WeekProvider } from '@/providers/WeekProvider'
import { OptimizedAuthProvider, useAuth } from '@/providers/OptimizedAuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthPage } from '@/components/auth/AuthPage'
import AcceptInvitation from '@/components/auth/AcceptInvitation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import AppRouter from '@/components/layout/AppRouter'
import { logger } from '@/lib/logger'
import PerformanceMonitor from '@/components/performance/PerformanceMonitor'
import { imagePreloader } from '@/services/imagePreloaderService'

function AppContentSimple() {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  logger.debug('AppContentSimple render', { 
    user: user?.email, 
    profile: profile?.role, 
    loading, 
    isAuthenticated 
  }, 'AppContentSimple')

  // Précharger les images critiques au chargement
  useEffect(() => {
    if (isAuthenticated) {
      imagePreloader.preloadCriticalImages().catch(error => {
        logger.warn('Failed to preload critical images', error, 'AppContentSimple');
      });
    }
  }, [isAuthenticated]);

  // SUPPRESSION du timeout forcé - React Query gère maintenant le cache
  // Plus besoin de forceLoading avec le système optimisé

  // Vérifier si on est sur la page d'acceptation d'invitation
  const isAcceptInvitationPage = window.location.pathname === '/accept-invitation' || 
                                 window.location.search.includes('token=')

  if (isAcceptInvitationPage) {
    return <AcceptInvitation />
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!isAuthenticated) {
    logger.debug('No user or profile, showing AuthPage', null, 'AppContentSimple')
    return <AuthPage />
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              <AppRouter activeTab={activeTab} userRole={profile.role} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export function AppPageSimple() {
  return (
    <PerformanceMonitor threshold={16}>
      <QueryProvider>
        <OptimizedAuthProvider>
          <WeekProvider>
            <AppContentSimple />
          </WeekProvider>
        </OptimizedAuthProvider>
        <Toaster />
      </QueryProvider>
    </PerformanceMonitor>
  )
}
