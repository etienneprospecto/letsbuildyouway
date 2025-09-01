import React from 'react'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ClientsPage from '@/components/dashboard/ClientsPage'
import WorkoutsPage from '@/components/dashboard/WorkoutsPage'
import ExercicesPage from '@/components/dashboard/ExercicesPage'
import MessagesPage from '@/components/dashboard/MessagesPage'
import CoachFeedbacksPage from '@/components/dashboard/CoachFeedbacksPage'
import ClientMessagesPage from '@/components/client/ClientMessagesPage'
import EditableProfile from '@/components/client/EditableProfile'
import ClientSeances from '@/components/client/ClientSeances'
import ProgressionDashboard from '@/components/client/ProgressionDashboard'
import ClientFeedbacks from '@/components/client/ClientFeedbacks'
import ClientFeedbacksPage from '@/components/client/ClientFeedbacksPage'
import ClientResources from '@/components/client/ClientResources'

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
      case 'feedbacks':
        return <ClientFeedbacks />
      case 'feedbacks-hebdomadaires':
        return <ClientFeedbacksPage />
      case 'ressources':
        return <ClientResources />
      case 'profile':
        return <EditableProfile />
      case 'messages':
        return <ClientMessagesPage />
      default:
        return <ClientDashboard />
    }
  }
}

export default AppRouter
