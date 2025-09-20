import React, { Suspense, lazy } from 'react'

// Lazy loading des composants de pages
const CoachDashboard = lazy(() => import('@/components/dashboard/CoachDashboard'))
const ClientDashboard = lazy(() => import('@/components/dashboard/ClientDashboard'))
const ClientsPage = lazy(() => import('@/components/dashboard/ClientsPage'))
const WorkoutsPage = lazy(() => import('@/components/dashboard/WorkoutsPage'))
const ExercicesPage = lazy(() => import('@/components/dashboard/ExercicesPage'))
const MessagesPage = lazy(() => import('@/components/dashboard/MessagesPage'))
const SimpleCoachFeedbacksPage = lazy(() => import('@/components/dashboard/SimpleCoachFeedbacksPage'))
const SettingsPage = lazy(() => import('@/components/dashboard/SettingsPage'))
const ClientMessagesPage = lazy(() => import('@/components/client/ClientMessagesPage'))
const ClientSeances = lazy(() => import('@/components/client/ClientSeances'))
const ProgressionDashboard = lazy(() => import('@/components/client/ProgressionDashboard'))
const SimpleClientFeedbacksPage = lazy(() => import('@/components/client/SimpleClientFeedbacksPage'))
const ClientResources = lazy(() => import('@/components/client/ClientResources'))
const ClientSettingsPage = lazy(() => import('@/components/client/ClientSettingsPage'))
const ClientNutritionPage = lazy(() => import('@/components/client/ClientNutritionPage'))
const CoachNutritionPage = lazy(() => import('@/components/dashboard/CoachNutritionPage'))
const CoachCalendarPage = lazy(() => import('@/components/dashboard/CoachCalendarPage'))
const ClientCalendarPage = lazy(() => import('@/components/client/ClientCalendarPage'))
const CoachTrophiesPage = lazy(() => import('@/components/dashboard/CoachTrophiesPage'))
const ClientTrophiesPage = lazy(() => import('@/components/client/ClientTrophiesPage'))
const CoachBillingPage = lazy(() => import('@/components/dashboard/CoachBillingPage'))
const ClientBillingPage = lazy(() => import('@/components/client/ClientBillingPage'))
const ColorCustomizer = lazy(() => import('@/components/dashboard/ColorCustomizer'))

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
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
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
