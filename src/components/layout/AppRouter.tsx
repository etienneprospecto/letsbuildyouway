import React from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

// Imports statiques temporaires pour résoudre le problème de lazy loading
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

// Composant de chargement
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Chargement de la page...</p>
    </div>
  </div>
)

interface AppRouterProps {
  activeTab: string
  userRole: 'coach' | 'client'
}

const AppRouter: React.FC<AppRouterProps> = ({ activeTab, userRole }) => {
  const renderPage = (Component: React.ComponentType) => (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  )

  if (userRole === 'coach') {
    switch (activeTab) {
      case 'dashboard':
        return renderPage(CoachDashboard)
      case 'clients':
        return renderPage(ClientsPage)
      case 'workouts':
        return renderPage(WorkoutsPage)
      case 'exercices':
        return renderPage(ExercicesPage)
      case 'messages':
        return renderPage(MessagesPage)
      case 'feedbacks-hebdomadaires':
        return renderPage(SimpleCoachFeedbacksPage)
      case 'nutrition':
        return renderPage(CoachNutritionPage)
      case 'calendar':
        return renderPage(CoachCalendarPage)
      case 'trophies':
        return renderPage(CoachTrophiesPage)
      case 'billing':
        return renderPage(CoachBillingPage)
      case 'settings':
        return renderPage(SettingsPage)
      case 'color-customizer':
        return renderPage(ColorCustomizer)
      default:
        return renderPage(CoachDashboard)
    }
  } else {
    switch (activeTab) {
      case 'dashboard':
        return renderPage(ClientDashboard)
      case 'seances':
        return renderPage(ClientSeances)
      case 'progression':
        return renderPage(ProgressionDashboard)
      case 'feedbacks-hebdomadaires':
        return renderPage(SimpleClientFeedbacksPage)
      case 'ressources':
        return renderPage(ClientResources)
      case 'nutrition':
        return renderPage(ClientNutritionPage)
      case 'calendar':
        return renderPage(ClientCalendarPage)
      case 'trophies':
        return renderPage(ClientTrophiesPage)
      case 'billing':
        return renderPage(ClientBillingPage)
      case 'messages':
        return renderPage(ClientMessagesPage)
      case 'settings':
        return renderPage(ClientSettingsPage)
      default:
        return renderPage(ClientDashboard)
    }
  }
}

export default AppRouter
