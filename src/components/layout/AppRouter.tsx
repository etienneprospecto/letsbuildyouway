import React, { Suspense, lazy } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy loading des composants de pages avec gestion d'erreur
const CoachDashboard = lazy(() => import('@/components/dashboard/CoachDashboard').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientDashboard = lazy(() => import('@/components/dashboard/ClientDashboard').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientsPage = lazy(() => import('@/components/dashboard/ClientsPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const WorkoutsPage = lazy(() => import('@/components/dashboard/WorkoutsPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ExercicesPage = lazy(() => import('@/components/dashboard/ExercicesPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const MessagesPage = lazy(() => import('@/components/dashboard/MessagesPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const SimpleCoachFeedbacksPage = lazy(() => import('@/components/dashboard/SimpleCoachFeedbacksPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const SettingsPage = lazy(() => import('@/components/dashboard/SettingsPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientMessagesPage = lazy(() => import('@/components/client/ClientMessagesPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientSeances = lazy(() => import('@/components/client/ClientSeances').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ProgressionDashboard = lazy(() => import('@/components/client/ProgressionDashboard').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const SimpleClientFeedbacksPage = lazy(() => import('@/components/client/SimpleClientFeedbacksPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientResources = lazy(() => import('@/components/client/ClientResources').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientSettingsPage = lazy(() => import('@/components/client/ClientSettingsPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientNutritionPage = lazy(() => import('@/components/client/ClientNutritionPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const CoachNutritionPage = lazy(() => import('@/components/dashboard/CoachNutritionPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const CoachCalendarPage = lazy(() => import('@/components/dashboard/CoachCalendarPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientCalendarPage = lazy(() => import('@/components/client/ClientCalendarPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const CoachTrophiesPage = lazy(() => import('@/components/dashboard/CoachTrophiesPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientTrophiesPage = lazy(() => import('@/components/client/ClientTrophiesPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const CoachBillingPage = lazy(() => import('@/components/dashboard/CoachBillingPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ClientBillingPage = lazy(() => import('@/components/client/ClientBillingPage').catch(() => ({ default: () => <div>Erreur de chargement</div> })))
const ColorCustomizer = lazy(() => import('@/components/dashboard/ColorCustomizer').catch(() => ({ default: () => <div>Erreur de chargement</div> })))

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
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
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
