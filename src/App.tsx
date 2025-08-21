import React, { useState } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthPage } from '@/components/auth/AuthPage'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ClientsPage from '@/components/dashboard/ClientsPage'
import WorkoutsPage from '@/components/dashboard/WorkoutsPage'
import ExercicesPage from '@/components/dashboard/ExercicesPage'
import ClientWorkoutsPage from '@/components/dashboard/ClientWorkoutsPage'
import ClientProgressPage from '@/components/dashboard/ClientProgressPage'
import ClientMessagesPage from '@/components/dashboard/ClientMessagesPage'

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

  const renderContent = () => {
    if (profile.role === 'coach') {
      switch (activeTab) {
        case 'dashboard':
          return <CoachDashboard />
        case 'clients':
          return <ClientsPage />
        case 'workouts':
          return <WorkoutsPage />
        case 'exercices':
          return <ExercicesPage />
        default:
          return <CoachDashboard />
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <ClientDashboard />
        case 'workouts':
          return <ClientWorkoutsPage />
        case 'progress':
          return <ClientProgressPage />
        case 'messages':
          return <ClientMessagesPage />
        default:
          return <ClientDashboard />
      }
    }
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
            <div className="p-8">{renderContent()}</div>
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
        <AppContent />
      </AuthProvider>
      <Toaster />
    </QueryProvider>
  )
}

export default App