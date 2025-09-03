import React from 'react'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ClientsPage from '@/components/dashboard/ClientsPage'
import WorkoutsPage from '@/components/dashboard/WorkoutsPage'
import ExercicesPage from '@/components/dashboard/ExercicesPage'
import MessagesPage from '@/components/dashboard/MessagesPage'
import CoachFeedbacksPage from '@/components/dashboard/CoachFeedbacksPage'
import SettingsPage from '@/components/dashboard/SettingsPage'
import ClientMessagesPage from '@/components/client/ClientMessagesPage'
import ClientSeances from '@/components/client/ClientSeances'
import ProgressionDashboard from '@/components/client/ProgressionDashboard'
import ClientFeedbacksPage from '@/components/client/ClientFeedbacksPage'
import ClientResources from '@/components/client/ClientResources'
import ClientSettingsPage from '@/components/client/ClientSettingsPage'

interface AppRouterProps {
  activeTab: string
  userRole: 'coach' | 'client'
}

const AppRouter: React.FC<AppRouterProps> = ({ activeTab, userRole }) => {
  if (userRole === 'coach') {
    switch (activeTab) {
      case 'dashboard':
        return <CoachDashboard />
      case 'clients':
        return <ClientsPage />
      case 'workouts':
        return <WorkoutsPage />
      case 'exercices':
        return <ExercicesPage />
      case 'messages':
        return <MessagesPage />
      case 'feedbacks-hebdomadaires':
        return <CoachFeedbacksPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <CoachDashboard />
    }
  } else {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboard />
      case 'seances':
        return <ClientSeances />
      case 'progression':
        return <ProgressionDashboard />
      case 'feedbacks-hebdomadaires':
        return <ClientFeedbacksPage />
      case 'ressources':
        return <ClientResources />
      case 'messages':
        return <ClientMessagesPage />
      case 'settings':
        return <ClientSettingsPage />
      default:
        return <ClientDashboard />
    }
  }
}

export default AppRouter
