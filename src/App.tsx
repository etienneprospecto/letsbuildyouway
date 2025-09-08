import React, { useState } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { WeekProvider } from '@/providers/WeekProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthPage } from '@/components/auth/AuthPage'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import AppRouter from '@/components/layout/AppRouter'

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  console.log('AppContent render - user:', user?.email, 'profile:', profile?.role, 'loading:', loading)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!user || !profile) {
    console.log('No user or profile, showing AuthPage')
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

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <WeekProvider>
          <AppContent />
        </WeekProvider>
      </AuthProvider>
      <Toaster />
    </QueryProvider>
  )
}

export default App