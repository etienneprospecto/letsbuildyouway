import React, { useState } from 'react'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import { useAuthStore } from '@/store/authStore'

function AppContent() {
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    if (user?.role === 'coach') {
      switch (activeTab) {
        case 'dashboard':
          return <CoachDashboard />
        case 'clients':
          return <div className="p-8">Clients Management - Coming Soon</div>
        case 'workouts':
          return <div className="p-8">Workout Library - Coming Soon</div>
        case 'messages':
          return <div className="p-8">Messages - Coming Soon</div>
        case 'settings':
          return <div className="p-8">Settings - Coming Soon</div>
        default:
          return <CoachDashboard />
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <ClientDashboard />
        case 'workouts':
          return <div className="p-8">My Workouts - Coming Soon</div>
        case 'progress':
          return <div className="p-8">Progress Tracking - Coming Soon</div>
        case 'messages':
          return <div className="p-8">Messages - Coming Soon</div>
        case 'profile':
          return <div className="p-8">Profile Settings - Coming Soon</div>
        default:
          return <ClientDashboard />
      }
    }
  }

  return (
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryProvider>
      <AppContent />
      <Toaster />
    </QueryProvider>
  )
}

export default App