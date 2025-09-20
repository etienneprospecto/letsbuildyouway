import React from 'react'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ClientsPage from '@/components/dashboard/ClientsPage'
import WorkoutsPage from '@/components/dashboard/WorkoutsPage'
import ExercicesPage from '@/components/dashboard/ExercicesPage'
import MessagesPage from '@/components/dashboard/MessagesPage'
import SimpleCoachFeedbacksPage from '@/components/dashboard/SimpleCoachFeedbacksPage'
import SettingsPage from '@/components/dashboard/SettingsPage'
import ClientMessagesPage from '@/components/client/ClientMessagesPage'
import ClientSeances from '@/components/client/ClientSeances'
import ProgressionDashboard from '@/components/client/ProgressionDashboard'
import SimpleClientFeedbacksPage from '@/components/client/SimpleClientFeedbacksPage'
import ClientResources from '@/components/client/ClientResources'
import ClientSettingsPage from '@/components/client/ClientSettingsPage'
import ClientNutritionPage from '@/components/client/ClientNutritionPage'
import CoachNutritionPage from '@/components/dashboard/CoachNutritionPage'
import { CoachCalendarPage } from '@/components/dashboard/CoachCalendarPage'
import { ClientCalendarPage } from '@/components/client/ClientCalendarPage'
import { CoachTrophiesPage } from '@/components/dashboard/CoachTrophiesPage'
import { ClientTrophiesPage } from '@/components/client/ClientTrophiesPage'
import { CoachBillingPage } from '@/components/dashboard/CoachBillingPage'
import { ClientBillingPage } from '@/components/client/ClientBillingPage'
import ColorCustomizer from '@/components/dashboard/ColorCustomizer'

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
        return <SimpleCoachFeedbacksPage />
      case 'nutrition':
        return <CoachNutritionPage />
      case 'calendar':
        return <CoachCalendarPage />
      case 'trophies':
        return <CoachTrophiesPage />
      case 'billing':
        return <CoachBillingPage />
      case 'settings':
        return <SettingsPage />
      case 'color-customizer':
        return <ColorCustomizer />
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
        return <SimpleClientFeedbacksPage />
      case 'ressources':
        return <ClientResources />
      case 'nutrition':
        return <ClientNutritionPage />
      case 'calendar':
        return <ClientCalendarPage />
      case 'trophies':
        return <ClientTrophiesPage />
      case 'billing':
        return <ClientBillingPage />
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
